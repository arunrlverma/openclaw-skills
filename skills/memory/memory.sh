#!/bin/bash
set -euo pipefail
CONFIG="${HOME}/.openclaw/s8t.json"
[[ -f "$CONFIG" ]] || { echo "Error: S8t not configured (no memory storage)" >&2; exit 1; }
API_URL=$(jq -r '.apiUrl' "$CONFIG")
AGENT_TOKEN=$(jq -r '.agentToken' "$CONFIG")
MEMORY_PATH="memory/memory.json"
CMD="${1:-}"

# Helper: read current memory
read_memory() {
  local raw
  raw=$(curl -sf "${API_URL}/storage/${AGENT_TOKEN}/files/${MEMORY_PATH}" 2>/dev/null || echo '{}')
  # If it's a "not found" JSON response, return empty
  if echo "$raw" | jq -e '.error' &>/dev/null 2>&1; then
    echo '{}'
  else
    echo "$raw"
  fi
}

# Helper: write memory
write_memory() {
  local data="$1"
  echo "$data" | curl -sf -X PUT "${API_URL}/storage/${AGENT_TOKEN}/files/${MEMORY_PATH}" \
    -H "Content-Type: application/json" -d @- > /dev/null
}

case "$CMD" in
  load)
    MEM=$(read_memory)
    if [ "$MEM" = "{}" ]; then
      echo "No memories yet. I'll start remembering things as we talk."
    else
      FACTS=$(echo "$MEM" | jq -r '.facts // [] | .[] | "- \(.text) (\(.date))"' 2>/dev/null || echo "")
      DECISIONS=$(echo "$MEM" | jq -r '.decisions // [] | .[] | "- \(.topic): \(.value) (\(.date))"' 2>/dev/null || echo "")
      PREFS=$(echo "$MEM" | jq -r '.preferences // {} | to_entries[] | "- \(.key): \(.value)"' 2>/dev/null || echo "")
      echo "=== Memory Loaded ==="
      if [ -n "$FACTS" ]; then echo -e "Facts:\n$FACTS"; fi
      if [ -n "$DECISIONS" ]; then echo -e "\nDecisions:\n$DECISIONS"; fi
      if [ -n "$PREFS" ]; then echo -e "\nPreferences:\n$PREFS"; fi
      echo "===================="
    fi
    ;;

  fact)
    TEXT="${2:?Usage: memory.sh fact \"fact text\"}"
    MEM=$(read_memory)
    DATE=$(date -u +%Y-%m-%d)
    MEM=$(echo "$MEM" | jq --arg t "$TEXT" --arg d "$DATE" '.facts = (.facts // []) + [{"text": $t, "date": $d}]')
    write_memory "$MEM"
    echo "Saved fact: $TEXT"
    ;;

  decision)
    TOPIC="${2:?Usage: memory.sh decision \"topic\" \"value\"}"
    VALUE="${3:?Usage: memory.sh decision \"topic\" \"value\"}"
    MEM=$(read_memory)
    DATE=$(date -u +%Y-%m-%d)
    # Remove old decision with same topic, add new one
    MEM=$(echo "$MEM" | jq --arg t "$TOPIC" --arg v "$VALUE" --arg d "$DATE" \
      '.decisions = ((.decisions // []) | map(select(.topic != $t))) + [{"topic": $t, "value": $v, "date": $d}]')
    write_memory "$MEM"
    echo "Saved decision: $TOPIC = $VALUE"
    ;;

  pref)
    KEY="${2:?Usage: memory.sh pref \"key\" \"value\"}"
    VALUE="${3:?Usage: memory.sh pref \"key\" \"value\"}"
    MEM=$(read_memory)
    MEM=$(echo "$MEM" | jq --arg k "$KEY" --arg v "$VALUE" '.preferences = ((.preferences // {}) + {($k): $v})')
    write_memory "$MEM"
    echo "Saved preference: $KEY = $VALUE"
    ;;

  search)
    QUERY="${2:?Usage: memory.sh search \"query\"}"
    MEM=$(read_memory)
    echo "$MEM" | jq -r --arg q "$QUERY" '
      def match_text: ascii_downcase | contains($q | ascii_downcase);
      [
        (.facts // [] | .[] | select(.text | match_text) | "FACT: \(.text) (\(.date))"),
        (.decisions // [] | .[] | select((.topic | match_text) or (.value | match_text)) | "DECISION: \(.topic) = \(.value) (\(.date))"),
        (.preferences // {} | to_entries[] | select((.key | match_text) or (.value | match_text)) | "PREF: \(.key) = \(.value)")
      ] | if length == 0 then "No matches found for: \($q)" else .[] end'
    ;;

  show)
    MEM=$(read_memory)
    if [ "$MEM" = "{}" ]; then
      echo "Memory is empty."
    else
      echo "$MEM" | jq .
    fi
    ;;

  *)
    echo "Usage: memory.sh <load|fact|decision|pref|search|show> [args...]" >&2
    exit 1
    ;;
esac
