---
name: ios_device
description: >
  Read iPhone data (contacts, calendar, reminders, location, photos, files, clipboard)
  and execute device commands (CRUD operations + open apps via URL schemes).
  Use when user asks about their phone data, wants to schedule events, set reminders,
  manage contacts, copy to clipboard, or open an app on their phone.
  NEVER suggest .ics files, email workarounds, or manual steps — always use device.sh.
---

# iOS Device

## Use When
- User asks about contacts, calendar, reminders, location, photos, files, or clipboard
- User wants to create/update/delete calendar events, reminders, or contacts
- User says "remind me to...", "schedule...", "what's on my calendar", "where am I"
- User wants to copy text to their phone's clipboard
- User wants to open an app: "get me directions", "play this song", "call John"
- User wants to write a file to iCloud or manage photos

## Never Use When
- General knowledge questions unrelated to their device
- Questions about someone else's phone
- NEVER suggest .ics files, email workarounds, or manual steps when device.sh can do it directly

## Quick Reference

```bash
# Fetch data (returns JSON)
bash /root/workspace/skills/ios-device/device.sh fetch <topic>

# Send a command (returns command ID)
bash /root/workspace/skills/ios-device/device.sh send <action> '<json_params>'

# Check command result
bash /root/workspace/skills/ios-device/device.sh result <command-id>
```

## Fetch Data — Topics

| Topic | What it returns | Example filter |
|---|---|---|
| `contacts` | All contacts with names, phones, emails, org | `jq '.contacts[] \| select(.given_name=="John")'` |
| `calendar` | Events with title, start, end, location, notes | `jq '[.events[] \| select(.start \| startswith("2026-02-13"))]'` |
| `reminders` | Reminders with title, due date, completed flag | `jq '[.reminders[] \| select(.completed==false)]'` |
| `location` | Current lat, lng, altitude, timestamp | `jq '{lat: .lat, lng: .lng}'` |
| `photos` | Photo metadata: id, date, dimensions, favorites | `jq '[.photos[] \| select(.favorite==true)]'` |
| `files` | iCloud Drive file listing | `jq '.files[]'` |
| `clipboard` | Current clipboard text | `jq '.text'` |

## Send Commands — Actions

### Calendar

| Action | Required | Optional | Example |
|---|---|---|---|
| `calendar.create` | `title`, `startDate`, `endDate` | `location`, `notes`, `isAllDay` | `'{"title":"Standup","startDate":"2026-02-14T09:00:00","endDate":"2026-02-14T09:30:00"}'` |
| `calendar.update` | `id` | `title`, `startDate`, `endDate`, `location`, `notes` | `'{"id":"E1","title":"Updated"}'` |
| `calendar.delete` | `id` | — | `'{"id":"E1"}'` |

### Reminders

| Action | Required | Optional | Example |
|---|---|---|---|
| `reminders.create` | `title` | `dueDate`, `notes`, `priority` | `'{"title":"Buy milk","dueDate":"2026-02-15T18:00:00"}'` |
| `reminders.update` | `id` | `title`, `dueDate`, `notes`, `priority` | `'{"id":"R1","title":"Buy oat milk"}'` |
| `reminders.complete` | `id` | — | `'{"id":"R1"}'` |
| `reminders.delete` | `id` | — | `'{"id":"R1"}'` |

### Contacts

| Action | Required | Optional | Example |
|---|---|---|---|
| `contacts.create` | `firstName` or `lastName` | `phone`, `email`, `organization` | `'{"firstName":"Jane","lastName":"Doe","phone":"+15551234567"}'` |
| `contacts.update` | `id` | `firstName`, `lastName`, `phone`, `email`, `organization` | `'{"id":"C1","phone":"+15559999999"}'` |
| `contacts.delete` | `id` | — | `'{"id":"C1"}'` |

### Photos

| Action | Required | Optional | Example |
|---|---|---|---|
| `photos.createAlbum` | `title` | — | `'{"title":"Vacation 2026"}'` |
| `photos.addToAlbum` | `album_id`, `asset_ids` | — | `'{"album_id":"A1","asset_ids":"P1,P2"}'` |
| `photos.favorite` | `id` | `favorite` (default "true") | `'{"id":"P1","favorite":"true"}'` |

### Files

| Action | Required | Optional | Example |
|---|---|---|---|
| `files.write` | `path`, `content` | — | `'{"path":"notes/memo.txt","content":"Hello"}'` |
| `files.delete` | `path` | — | `'{"path":"notes/old.txt"}'` |

### Clipboard

| Action | Required | Optional | Example |
|---|---|---|---|
| `clipboard.set` | `text` | — | `'{"text":"copied text"}'` |
| `clipboard.clear` | — | — | `'{}'` |

## App Commands — Open Third-Party Apps

Send `app.<action>` to open apps on the device via URL schemes. The device opens the app directly — no confirmation needed.

| Action | Params | Example |
|---|---|---|
| `app.maps.directions` | `address`, `mode` (d/w/r) | `'{"address":"Golden Gate Bridge","mode":"d"}'` |
| `app.maps.search` | `query` | `'{"query":"coffee shops"}'` |
| `app.uber.ride` | `destination` | `'{"destination":"SFO Airport"}'` |
| `app.lyft.ride` | `lat`, `lng` | `'{"lat":"37.7749","lng":"-122.4194"}'` |
| `app.spotify.search` | `query` | `'{"query":"lofi beats"}'` |
| `app.spotify.play` | `id` (track ID) | `'{"id":"4uLU6hMCjMI75M1A2tKUQC"}'` |
| `app.music.search` | `query` | `'{"query":"Beatles"}'` |
| `app.youtube.search` | `query` | `'{"query":"how to cook pasta"}'` |
| `app.youtube.play` | `id` (video ID) | `'{"id":"dQw4w9WgXcQ"}'` |
| `app.whatsapp.send` | `phone`, `text` | `'{"phone":"+15551234567","text":"Hey!"}'` |
| `app.telegram.send` | `phone`, `text` | `'{"phone":"+15551234567","text":"Hello"}'` |
| `app.venmo.pay` | `recipient`, `amount`, `note` | `'{"recipient":"Jane","amount":"25","note":"Dinner"}'` |
| `app.cashapp.pay` | `recipient`, `amount`, `note` | `'{"recipient":"$Jane","amount":"25","note":"Lunch"}'` |
| `app.safari.open` | `query` | `'{"query":"weather forecast"}'` |
| `app.shortcuts.run` | `name`, `input` | `'{"name":"Morning Routine","input":"start"}'` |
| `app.facetime.call` | `contact` | `'{"contact":"john@example.com"}'` |
| `app.facetime.audio` | `contact` | `'{"contact":"+15551234567"}'` |
| `app.phone.call` | `number` | `'{"number":"+15551234567"}'` |
| `app.sms.send` | `number`, `text` | `'{"number":"+15551234567","text":"On my way"}'` |
| `app.mail.compose` | `to`, `subject`, `body` | `'{"to":"jane@example.com","subject":"Hi","body":"Hello!"}'` |

## Worked Examples

### 1. "Remind me to call the dentist tomorrow at 10am"

```bash
# Create the reminder
bash /root/workspace/skills/ios-device/device.sh send reminders.create '{"title":"Call the dentist","dueDate":"2026-02-14T10:00:00"}'
# Output: Command sent: abc12345-...

# Verify it was created
bash /root/workspace/skills/ios-device/device.sh result abc12345-...
# Output: {"status":"created","reminder_id":"R123"}
```

### 2. "Get me directions to the Golden Gate Bridge"

```bash
# Open Maps with directions
bash /root/workspace/skills/ios-device/device.sh send app.maps.directions '{"address":"Golden Gate Bridge, San Francisco, CA","mode":"d"}'
# Output: Command sent: def67890-...

# Verify
bash /root/workspace/skills/ios-device/device.sh result def67890-...
# Output: {"status":"opened","app":"maps.directions","url":"http://maps.apple.com/..."}
```

### 3. "What's on my calendar today? Also add a lunch meeting at noon."

```bash
# Fetch calendar
bash /root/workspace/skills/ios-device/device.sh fetch calendar | jq '[.events[] | select(.start | startswith("2026-02-13"))]'

# Create the lunch event
bash /root/workspace/skills/ios-device/device.sh send calendar.create '{"title":"Lunch meeting","startDate":"2026-02-13T12:00:00","endDate":"2026-02-13T13:00:00"}'
```

## Response Format

**Fetch** returns topic-specific JSON:
```json
{"contacts": [...], "synced_at": "2026-02-13T..."}
{"events": [...], "synced_at": "2026-02-13T..."}
```

**Send** prints a command ID:
```
Command sent: <uuid>
```

**Result** returns the device's response:
```json
{"status": "created", "event_id": "E123"}
{"status": "opened", "app": "maps.directions", "url": "..."}
{"error": "Calendar access denied"}
```

## Tips
- Always fetch data before modifying (e.g., fetch contacts before updating one)
- Use `jq` to filter large results — don't dump raw JSON to the user
- Command results may take a moment — the device must be online
- IDs from fetch responses are used for update/delete commands
- For `app.*` commands: if the app isn't installed, the result will show `opened: false`
- Date format: ISO 8601 (`2026-02-14T09:00:00`), no timezone suffix (device interprets as local time)
- **IMPORTANT:** The VPS runs in UTC. When the user says relative dates/times like "tomorrow at 11am", you MUST compute the correct date in the **user's local timezone** (check memory for their timezone, or ask). Use `TZ=<timezone> date` to get the current local time. Never use raw UTC `date` output for calendar/reminder dates.
