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

## Primary Usage
For all Apple device tasks, use the sub-agent:
```bash
node /root/workspace/skills/ios-device/apple-agent.js "<natural language request>"
```
The sub-agent handles multi-step workflows (fetch, create, verify, web search) autonomously using claude-sonnet-4-5 with tool calling. It can search the web for addresses, track IDs, and business info before acting. Just pass the user's natural language request and relay the result.

Examples:
- `node /root/workspace/skills/ios-device/apple-agent.js "remind me to call the dentist tomorrow at 10am"`
- `node /root/workspace/skills/ios-device/apple-agent.js "what's on my calendar today"`
- `node /root/workspace/skills/ios-device/apple-agent.js "find John Smith's phone number and text him 'running late'"`

Only use `device.sh` directly for simple single-step operations where you already know the exact command.

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
# Fetch data in real-time (returns JSON — device must be online)
bash /root/workspace/skills/ios-device/device.sh fetch <topic> [filters_json]

# Send a command (returns command ID)
bash /root/workspace/skills/ios-device/device.sh send <action> '<json_params>'

# Check command result
bash /root/workspace/skills/ios-device/device.sh result <command-id>
```

## Fetch Data — Topics

Fetches are real-time — data is read fresh from the device when requested (2-5 second typical, up to 90s with retries). The fetch automatically retries 3 times (~30s each) to handle cases where the phone is waking from background. If still unreachable after ~90s, returns `{"error":"device_offline"}`.

| Topic | What it returns | Native filters |
|---|---|---|
| `contacts` | Contacts with names, phones, emails, org, id | `name`, `email`, `phone`, `id` |
| `calendar` | Events with title, start, end, location, notes, id | `date` (YYYY-MM-DD), `startDate`+`endDate` |
| `reminders` | Reminders with title, due date, completed flag, id | `completed` (true/false), `list` |
| `location` | Current lat, lng, altitude, timestamp | — |
| `photos` | Photo metadata: id, date, dimensions, favorites | `favorite` (true), `startDate`, `endDate`, `limit`, `id` |
| `files` | iCloud Drive file listing | — |
| `clipboard` | Current clipboard text | — |

### Filter Examples

```bash
# Search contacts by name (native iOS search — fast, partial match)
bash device.sh fetch contacts '{"name":"carlos"}'

# Get today's calendar events only
bash device.sh fetch calendar '{"date":"2026-02-14"}'

# Get incomplete reminders from "Shopping" list
bash device.sh fetch reminders '{"completed":"false","list":"Shopping"}'

# Get 50 favorite photos
bash device.sh fetch photos '{"favorite":"true","limit":"50"}'

# No filters = full fetch
bash device.sh fetch contacts
```

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

### 1. "Find Carlos in my contacts"

```bash
# Use native name search for real-time result
bash /root/workspace/skills/ios-device/device.sh fetch contacts '{"name":"carlos"}'
# Output: {"count":1,"contacts":[{"id":"ABC-123","given_name":"Carlos",...}],"fetched_at":"2026-02-14T..."}
```

### 2. "Remind me to call the dentist tomorrow at 10am"

```bash
# Create the reminder
bash /root/workspace/skills/ios-device/device.sh send reminders.create '{"title":"Call the dentist","dueDate":"2026-02-15T10:00:00"}'
# Output: Command sent: abc12345-...

# Verify it was created
bash /root/workspace/skills/ios-device/device.sh result abc12345-...
# Output: {"status":"created","reminder_id":"R123"}
```

### 3. "What's on my calendar today?"

```bash
# Fetch today's events only
bash /root/workspace/skills/ios-device/device.sh fetch calendar '{"date":"2026-02-14"}'
# Output: {"count":3,"events":[...],"fetched_at":"2026-02-14T..."}
```

### 4. "Get me directions to the Golden Gate Bridge"

```bash
# Open Maps with directions
bash /root/workspace/skills/ios-device/device.sh send app.maps.directions '{"address":"Golden Gate Bridge, San Francisco, CA","mode":"d"}'
# Output: Command sent: def67890-...

# Verify
bash /root/workspace/skills/ios-device/device.sh result def67890-...
# Output: {"status":"opened","app":"maps.directions","url":"http://maps.apple.com/..."}
```

## Response Format

**Fetch** returns topic-specific JSON:
```json
{"contacts": [...], "fetched_at": "2026-02-14T..."}
{"events": [...], "fetched_at": "2026-02-14T..."}
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
- Use native filters instead of `jq` when possible — they're faster and return less data
- The device must be online and the app running (foreground or background) for fetches to work
- If the device is offline, the fetch retries 3x (~90s total). If it still fails, ask the user to open the app and try again
- IDs from fetch responses are used for update/delete commands
- For `app.*` commands: if the app isn't installed, the result will show `opened: false`
- Date format: ISO 8601 (`2026-02-14T09:00:00`), no timezone suffix (device interprets as local time)
- **IMPORTANT:** The VPS runs in UTC. When the user says relative dates/times like "tomorrow at 11am", you MUST compute the correct date in the **user's local timezone** (check memory for their timezone, or ask). Use `TZ=<timezone> date` to get the current local time. Never use raw UTC `date` output for calendar/reminder dates.
