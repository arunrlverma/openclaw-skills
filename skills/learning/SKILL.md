---
name: nightly_learning
description: Manages nightly learning sessions. Stores learning plan, journal, and progress in persistent storage. Used automatically during the 1am-6am learning window.
---
# Nightly Learning

## Use When
- During nightly learning sessions (1am-6am) — called automatically
- User asks "what did you learn last night?" or "show your learning journal"
- You want to review what you've studied or plan future learning

## Commands
```bash
bash /root/workspace/skills/learning/learning.sh plan           # view current learning plan
bash /root/workspace/skills/learning/learning.sh plan-set       # write plan from stdin
bash /root/workspace/skills/learning/learning.sh journal        # view recent journal (last 100 entries)
bash /root/workspace/skills/learning/learning.sh log "entry"    # append journal entry with timestamp
bash /root/workspace/skills/learning/learning.sh summary        # view last morning summary
bash /root/workspace/skills/learning/learning.sh summary-set    # write summary from stdin
```

## During Learning Sessions
1. First tick: load memory, review plan, identify gaps
2. Subsequent ticks: pick next action from plan, take action, log what you learned
3. Final tick (morning summary): write summary, send to user via Telegram
