---
name: agent_memory
description: Persistent memory system. Automatically remember facts, decisions, and user preferences across conversations. Query past information.
---

# Agent Memory

## Use When
- Start of every conversation (load memory automatically)
- User shares personal information, preferences, or decisions
- User asks "do you remember...", "what did I say about...", "what did we decide..."
- After important conversations (save new facts)

## Don't Use When
- Trivial small talk that doesn't contain memorable information

## How It Works
Your memory is stored as a JSON file in your cloud storage (Google Drive). It persists across all conversations.

## Commands

### Load memory (do this at start of conversations)
```bash
bash /root/workspace/skills/memory/memory.sh load
```

### Save a fact
```bash
bash /root/workspace/skills/memory/memory.sh fact "User prefers morning workouts"
```

### Save a decision
```bash
bash /root/workspace/skills/memory/memory.sh decision "notification_frequency" "Weekly digest on Sundays"
```

### Save a user preference
```bash
bash /root/workspace/skills/memory/memory.sh pref "timezone" "PST"
```

### Search memory
```bash
bash /root/workspace/skills/memory/memory.sh search "workout"
```

### Show full memory
```bash
bash /root/workspace/skills/memory/memory.sh show
```

## Memory Behavior
- At the START of each conversation, load your memory to recall past context
- During conversation, when the user shares something worth remembering, save it
- When asked about past decisions or facts, search your memory first
- Don't save trivial things — focus on: preferences, decisions, goals, important facts, names, dates
- If the user corrects you, update the relevant memory entry
- Keep facts concise: one clear statement per fact

## What to Remember
- User preferences (communication style, timezone, interests)
- Decisions made ("we decided to use React for the frontend")
- Goals and deadlines ("ship feature X by March 15")
- Important personal info the user shares (name, role, team)
- Project context (tech stack, architecture decisions)
- Things the user explicitly asks you to remember

## What NOT to Remember
- Exact conversation transcripts
- Temporary context ("let me look at this file")
- Information that changes frequently without significance
