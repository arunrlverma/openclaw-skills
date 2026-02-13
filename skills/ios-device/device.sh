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

CMD="${1:-}"

case "$CMD" in
  fetch)
    TOPIC="${2:?Usage: device.sh fetch <contacts|calendar|reminders|photos|location|files|clipboard>}"
    curl -sf "${RELAY_URL}/buddy/sync/${TOPIC}" \
      -H "Authorization: Bearer ${TOKEN}"
    ;;

  send)
    ACTION="${2:?Usage: device.sh send <action> '<json_params>'}"
    PARAMS="${3:-\{\}}"
    ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || uuidgen 2>/dev/null || python3 -c 'import uuid; print(uuid.uuid4())' 2>/dev/null)
    BODY=$(echo "$PARAMS" | jq --arg id "$ID" --arg action "$ACTION" '. + {"id": $id, "action": $action}')
    curl -sf "${RELAY_URL}/buddy/commands" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$BODY"
    echo "Command sent: ${ID}"
    ;;

  result)
    COMMAND_ID="${2:?Usage: device.sh result <command-id>}"
    curl -sf "${RELAY_URL}/buddy/commands/${COMMAND_ID}/result" \
      -H "Authorization: Bearer ${TOKEN}"
    ;;

  *)
    echo "Usage: device.sh <fetch|send|result> [args...]" >&2
    echo "" >&2
    echo "  fetch <topic>        Fetch synced data (contacts, calendar, reminders, photos, location, files, clipboard)" >&2
    echo "  send <action> <json> Send a command to the device" >&2
    echo "  result <id>          Check the result of a sent command" >&2
    exit 1
    ;;
esac
