---
name: ios_device
description: Access synced iPhone data (contacts, calendar, reminders, location) and execute device commands
---

# iOS Device

## Use When
- User asks about their contacts, calendar events, reminders, location, photos, files, or clipboard
- User wants to create, update, or delete calendar events, reminders, or contacts
- User wants to copy something to their clipboard
- User asks "what's on my calendar", "remind me to...", "where am I", "who is in my contacts"

## Don't Use When
- User asks general knowledge questions unrelated to their device data
- User asks about someone else's phone

## How It Works
Your iPhone data is synced through a relay server. Use `device.sh` to fetch data and send commands to the device.

## Commands

### Fetch Data

Retrieve synced data from the device. Returns JSON.

```bash
bash /root/workspace/skills/ios-device/device.sh fetch contacts
bash /root/workspace/skills/ios-device/device.sh fetch calendar
bash /root/workspace/skills/ios-device/device.sh fetch reminders
bash /root/workspace/skills/ios-device/device.sh fetch photos
bash /root/workspace/skills/ios-device/device.sh fetch location
bash /root/workspace/skills/ios-device/device.sh fetch files
bash /root/workspace/skills/ios-device/device.sh fetch clipboard
```

### Send Commands

Send a command to the device. The action determines what happens and the JSON payload provides parameters.

```bash
bash /root/workspace/skills/ios-device/device.sh send <action> '<json_params>'
```

#### Calendar Commands

Create an event:
```bash
bash /root/workspace/skills/ios-device/device.sh send calendar.create '{"title":"Team standup","startDate":"2026-02-14T09:00:00","endDate":"2026-02-14T09:30:00","notes":"Weekly sync"}'
```

Update an event:
```bash
bash /root/workspace/skills/ios-device/device.sh send calendar.update '{"id":"event-id-here","title":"Updated title","startDate":"2026-02-14T10:00:00","endDate":"2026-02-14T10:30:00"}'
```

Delete an event:
```bash
bash /root/workspace/skills/ios-device/device.sh send calendar.delete '{"id":"event-id-here"}'
```

#### Reminder Commands

Create a reminder:
```bash
bash /root/workspace/skills/ios-device/device.sh send reminders.create '{"title":"Buy groceries","dueDate":"2026-02-15T18:00:00","notes":"Milk, eggs, bread"}'
```

Complete a reminder:
```bash
bash /root/workspace/skills/ios-device/device.sh send reminders.complete '{"id":"reminder-id-here"}'
```

Update a reminder:
```bash
bash /root/workspace/skills/ios-device/device.sh send reminders.update '{"id":"reminder-id-here","title":"Updated title","dueDate":"2026-02-16T12:00:00"}'
```

Delete a reminder:
```bash
bash /root/workspace/skills/ios-device/device.sh send reminders.delete '{"id":"reminder-id-here"}'
```

#### Contact Commands

Create a contact:
```bash
bash /root/workspace/skills/ios-device/device.sh send contacts.create '{"firstName":"Jane","lastName":"Doe","phone":"+15551234567","email":"jane@example.com"}'
```

Update a contact:
```bash
bash /root/workspace/skills/ios-device/device.sh send contacts.update '{"id":"contact-id-here","phone":"+15559876543"}'
```

Delete a contact:
```bash
bash /root/workspace/skills/ios-device/device.sh send contacts.delete '{"id":"contact-id-here"}'
```

#### Photos Commands

Create an album:
```bash
bash /root/workspace/skills/ios-device/device.sh send photos.createAlbum '{"title":"Vacation 2026"}'
```

Favorite a photo:
```bash
bash /root/workspace/skills/ios-device/device.sh send photos.favorite '{"id":"asset-id-here","favorite":"true"}'
```

#### Files Commands

Write a file to iCloud Documents:
```bash
bash /root/workspace/skills/ios-device/device.sh send files.write '{"path":"notes/meeting.txt","content":"Meeting notes here..."}'
```

Delete a file:
```bash
bash /root/workspace/skills/ios-device/device.sh send files.delete '{"path":"notes/old-file.txt"}'
```

#### Clipboard Commands

Copy text to clipboard:
```bash
bash /root/workspace/skills/ios-device/device.sh send clipboard.set '{"text":"Text to copy to clipboard"}'
```

Clear clipboard:
```bash
bash /root/workspace/skills/ios-device/device.sh send clipboard.clear '{}'
```

### Check Command Results

After sending a command, check if the device has executed it:

```bash
bash /root/workspace/skills/ios-device/device.sh result <command-id>
```

The `send` command prints the command ID when submitted. Use that ID to check the result.

## Examples

### Find a contact by name
```bash
bash /root/workspace/skills/ios-device/device.sh fetch contacts | jq '.contacts[] | select(.given_name == "John")'
```

### Get today's calendar events
```bash
bash /root/workspace/skills/ios-device/device.sh fetch calendar | jq '[.events[] | select(.start | startswith("2026-02-13"))]'
```

### Get incomplete reminders
```bash
bash /root/workspace/skills/ios-device/device.sh fetch reminders | jq '[.reminders[] | select(.completed == false)]'
```

### Get current location
```bash
bash /root/workspace/skills/ios-device/device.sh fetch location | jq '{lat: .lat, lng: .lng, timestamp: .timestamp}'
```

### Create a reminder and check the result
```bash
# Send the command
bash /root/workspace/skills/ios-device/device.sh send reminders.create '{"title":"Call dentist","dueDate":"2026-02-14T10:00:00"}'
# Output: Command sent: abc12345-...

# Check result
bash /root/workspace/skills/ios-device/device.sh result abc12345-...
```

## Tips
- Always fetch data first before modifying it (e.g., fetch contacts before updating one)
- Use jq to filter large result sets rather than reading everything
- Command results may take a moment to appear — the device needs to be online to process them
- IDs returned in fetched data are used as references for update/delete commands
