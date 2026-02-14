#!/bin/bash
set -euo pipefail

CONFIG="/root/.openclaw/openclaw.json"
RELAY_URL="https://clawd-relay.fly.dev"

# Extract token
TOKEN=$(jq -r '.models.providers["buddy-relay"].apiKey' "$CONFIG" 2>/dev/null)
if [[ -z "$TOKEN" || "$TOKEN" == "null" ]]; then
  echo "Error: buddy-relay token not found in $CONFIG" >&2
  exit 1
fi

relay_call() {
  local method="$1" url="$2"
  shift 2
  local HTTP_CODE BODY
  BODY=$(curl -s -w "\n%{http_code}" "$url" -X "$method" -H "Authorization: Bearer ${TOKEN}" "$@")
  HTTP_CODE=$(echo "$BODY" | tail -1)
  BODY=$(echo "$BODY" | sed '$ d')
  if [[ "$HTTP_CODE" -ge 200 && "$HTTP_CODE" -lt 300 ]]; then
    echo "$BODY"
    return 0
  elif [[ "$HTTP_CODE" == "404" ]]; then
    echo "$BODY" >&2
    return 2
  else
    echo "Error: HTTP $HTTP_CODE from relay" >&2
    echo "$BODY" >&2
    return 1
  fi
}

# Wait for device to acknowledge receipt of a command.
# Returns 0 if acked, 1 if not after MAX_ATTEMPTS.
# First check is immediate, then 2.5s intervals.
wait_for_ack() {
  local CMD_ID="$1" MAX_ATTEMPTS="${2:-6}"
  for i in $(seq 1 "$MAX_ATTEMPTS"); do
    relay_call GET "${RELAY_URL}/buddy/commands/${CMD_ID}/ack" >/dev/null 2>&1 && return 0
    sleep 2.5
  done
  return 1
}

CMD="${1:-}"

case "$CMD" in
  fetch)
    TOPIC="${2:?Usage: device.sh fetch <topic> [filters_json]}"
    FILTERS="${3:-\{\}}"
    ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())' 2>/dev/null)
    BODY=$(echo "$FILTERS" | jq --arg id "$ID" --arg action "fetch.${TOPIC}" '. + {"id": $id, "action": $action}')
    relay_call POST "${RELAY_URL}/buddy/commands" -H "Content-Type: application/json" -d "$BODY" >/dev/null 2>&1

    # Fast ack check — device offline detected in ~15s instead of 120s
    if ! wait_for_ack "$ID" 6; then
      echo '{"error":"device_offline","message":"Device did not respond within 15 seconds. Is the app open?"}'
      exit 1
    fi

    # Device acknowledged — now wait for full result (up to ~120s)
    for ATTEMPT in 1 2 3 4; do
      RESULT=$(relay_call GET "${RELAY_URL}/buddy/commands/${ID}/result?wait=30" 2>/dev/null)
      RC=$?
      if [[ $RC -eq 0 ]]; then
        echo "$RESULT"
        exit 0
      fi
    done
    echo '{"error":"timeout","message":"Device acknowledged but did not complete within 120 seconds"}'
    exit 1
    ;;

  send)
    ACTION="${2:?Usage: device.sh send <action> '<json_params>'}"
    PARAMS="${3:-\{\}}"
    ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())' 2>/dev/null)
    BODY=$(echo "$PARAMS" | jq --arg id "$ID" --arg action "$ACTION" '. + {"id": $id, "action": $action}')
    relay_call POST "${RELAY_URL}/buddy/commands" -H "Content-Type: application/json" -d "$BODY" >/dev/null 2>&1

    # Fast ack check
    if ! wait_for_ack "$ID" 6; then
      echo "{\"id\":\"${ID}\",\"status\":\"device_offline\",\"message\":\"Device did not acknowledge within 15 seconds\"}"
      exit 1
    fi

    # Device acknowledged — wait for result (up to ~60s)
    for ATTEMPT in 1 2; do
      RESULT=$(relay_call GET "${RELAY_URL}/buddy/commands/${ID}/result?wait=30" 2>/dev/null)
      RC=$?
      if [[ $RC -eq 0 ]]; then
        echo "$RESULT"
        exit 0
      fi
    done
    # Ack'd but no result yet — device is processing
    echo "{\"id\":\"${ID}\",\"status\":\"processing\",\"message\":\"Device received the command and is working on it\"}"
    ;;

  result)
    COMMAND_ID="${2:?Usage: device.sh result <command-id>}"
    RESULT=$(relay_call GET "${RELAY_URL}/buddy/commands/${COMMAND_ID}/result?wait=15" 2>/dev/null)
    RC=$?
    if [[ $RC -eq 0 ]]; then
      echo "$RESULT"
    elif [[ $RC -eq 2 ]]; then
      echo '{"status":"no_result","message":"Device has not responded yet. Try again in a few seconds."}'
    else
      echo '{"error":"relay_error","message":"Could not reach relay"}'
    fi
    ;;

  *)
    echo "Usage: device.sh <fetch|send|result> [args...]" >&2
    echo "" >&2
    echo "  fetch <topic> [json] Fetch real-time data (contacts, calendar, reminders, photos, location, files, clipboard)" >&2
    echo "  send <action> <json> Send a command to the device" >&2
    echo "  result <id>          Check the result of a sent command" >&2
    exit 1
    ;;
esac
