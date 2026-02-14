#!/bin/bash
set -euo pipefail
CONFIG="${HOME}/.openclaw/s8t.json"
[[ -f "$CONFIG" ]] || { echo "Error: S8t not configured" >&2; exit 1; }
API_URL=$(jq -r '.apiUrl' "$CONFIG")
AGENT_TOKEN=$(jq -r '.agentToken' "$CONFIG")
CMD="${1:-}"

s8t_read() { curl -sf "${API_URL}/storage/${AGENT_TOKEN}/files/$1" 2>/dev/null || echo ""; }
s8t_write() { curl -sf -X PUT "${API_URL}/storage/${AGENT_TOKEN}/files/$1" -H "Content-Type: text/plain" -d "$2" >/dev/null; }

case "$CMD" in
  plan)
    PLAN=$(s8t_read "learning/plan.md")
    [[ -z "$PLAN" ]] && echo "No learning plan yet." || echo "$PLAN"
    ;;
  plan-set)
    CONTENT=$(cat)
    s8t_write "learning/plan.md" "$CONTENT"
    echo "Learning plan updated (${#CONTENT} bytes)"
    ;;
  journal)
    JOURNAL=$(s8t_read "learning/journal.md")
    [[ -z "$JOURNAL" ]] && echo "No journal entries yet." || echo "$JOURNAL" | tail -100
    ;;
  log)
    ENTRY="${2:?Usage: learning.sh log \"what I learned\"}"
    DATE=$(date -u '+%Y-%m-%d %H:%M UTC')
    JOURNAL=$(s8t_read "learning/journal.md")
    JOURNAL="${JOURNAL}
[${DATE}] ${ENTRY}"
    s8t_write "learning/journal.md" "$JOURNAL"
    echo "Logged: $ENTRY"
    ;;
  summary)
    SUMMARY=$(s8t_read "learning/last-summary.md")
    [[ -z "$SUMMARY" ]] && echo "No summary yet." || echo "$SUMMARY"
    ;;
  summary-set)
    CONTENT=$(cat)
    s8t_write "learning/last-summary.md" "$CONTENT"
    echo "Summary saved"
    ;;
  *) echo "Usage: learning.sh <plan|plan-set|journal|log|summary|summary-set> [args...]" >&2; exit 1 ;;
esac
