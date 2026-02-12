---
name: reminders
description: User asks to be reminded about something
---

# Reminders

## Use When
- User asks to be reminded about something
- User wants to set a timer or schedule a check-in
- User asks about their pending reminders

## Don't Use When
- User wants to track workouts or meals (use respective trackers)
- User needs real-time calendar integration (not supported)

## Tools
- set_reminder(message, when) -> scheduled reminder
- list_reminders() -> pending reminders
- clear_reminder(id) -> removed reminder

## Artifacts
Output saved to: /root/workspace/skills/reminders/data/
