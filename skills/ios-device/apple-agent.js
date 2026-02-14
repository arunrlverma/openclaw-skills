#!/usr/bin/env node
// Apple Device Sub-Agent
// Usage: node apple-agent.js "user's natural language request"
// Autonomously handles Apple device workflows via claude-sonnet-4-5 + tool calling.
// Reads buddy token and Brave API key from /root/.openclaw/openclaw.json

const { execFileSync, execSync } = require("child_process");
const { readFileSync } = require("fs");

const RELAY_URL = "https://clawd-relay.fly.dev";
const MODEL = "anthropic/claude-sonnet-4-5";
const MAX_ITERATIONS = 12;
const TIMEOUT_MS = 240000;
const DEVICE_SH = "/root/workspace/skills/ios-device/device.sh";

// Read config
function getConfig() {
  try {
    const config = JSON.parse(readFileSync("/root/.openclaw/openclaw.json", "utf8"));
    const token = config.models?.providers?.["buddy-relay"]?.apiKey;
    if (!token) throw new Error("buddy-relay token not found");
    const braveKey = config.tools?.web?.search?.apiKey || "";
    return { token, braveKey };
  } catch (e) {
    console.error(`Error reading config: ${e.message}`);
    process.exit(1);
  }
}

// Get current time for the system prompt
function getCurrentTime() {
  try {
    return execSync("date '+%Y-%m-%dT%H:%M:%S %Z (%A)'", { encoding: "utf8" }).trim();
  } catch {
    return new Date().toISOString();
  }
}

// Brave web search
async function webSearch(query, braveKey, count = 5) {
  if (!braveKey) return JSON.stringify({ error: "Web search not configured (no Brave API key)" });
  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json", "X-Subscription-Token": braveKey }
    });
    if (!res.ok) return JSON.stringify({ error: `Search API error: ${res.status}` });
    const data = await res.json();
    const results = (data.web?.results || []).map(r => ({
      title: r.title, url: r.url, snippet: r.description
    }));
    return JSON.stringify({ query, results });
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

// Tool definitions for the LLM
const tools = [
  {
    type: "function",
    function: {
      name: "fetch_device_data",
      description: "Fetch data from the user's iPhone in real-time. Checks if device is online within ~15s (fast fail), then waits up to ~120s for data. Use filters to narrow results.",
      parameters: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            enum: ["contacts", "calendar", "reminders", "location", "photos", "files", "clipboard"],
            description: "The type of data to fetch"
          },
          filters: {
            type: "object",
            description: "Optional filters. contacts: name, email, phone, id. calendar: date (YYYY-MM-DD), startDate + endDate (ISO 8601). reminders: completed (true/false), list (list name). photos: favorite (true), startDate, endDate, limit, id.",
          }
        },
        required: ["topic"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_command",
      description: "Send an action command to the user's iPhone. Confirms device receipt within ~15s (fast offline detection), then waits up to ~60s for completion.\n\nReturns one of three statuses:\n- Confirmed result (e.g. {status:'created'}) — action completed successfully\n- {status:'processing'} — device received the command but hasn't finished yet\n- {status:'device_offline'} — device didn't acknowledge within 15s\n\nData commands: calendar.create/update/delete, reminders.create/update/complete/delete, contacts.create/update/delete, photos.createAlbum/addToAlbum/favorite, files.write/delete, clipboard.set/clear.\n\nApp deep links: app.maps.directions, app.maps.search, app.uber.ride, app.lyft.ride, app.spotify.search/play, app.youtube.search/play, app.whatsapp.send, app.telegram.send, app.sms.send, app.phone.call, app.facetime.call/audio, app.mail.compose, app.safari.open, app.shortcuts.run, app.venmo.pay, app.cashapp.pay.",
      parameters: {
        type: "object",
        properties: {
          action: {
            type: "string",
            description: "The command action (e.g. 'calendar.create', 'app.uber.ride')"
          },
          params: {
            type: "object",
            description: "Action parameters as key-value pairs"
          }
        },
        required: ["action", "params"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_command_result",
      description: "Check the result of a command that returned 'processing' status. Polls for up to 15 seconds. Use this when send_command returned {status:'processing'} to check if it completed.",
      parameters: {
        type: "object",
        properties: {
          command_id: {
            type: "string",
            description: "The command ID from a processing send_command response"
          }
        },
        required: ["command_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Search the web for information. Use this to look up addresses, find Spotify track IDs, get business details, check facts, or find any information needed to complete the user's request.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          count: {
            type: "integer",
            description: "Number of results (default 5, max 10)"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "wait_seconds",
      description: "Wait for a specified number of seconds before continuing. Use this to pace retries or give the device time to finish processing.",
      parameters: {
        type: "object",
        properties: {
          seconds: {
            type: "integer",
            description: "Number of seconds to wait (1-30)"
          }
        },
        required: ["seconds"]
      }
    }
  }
];

// Execute a tool call — uses execFileSync for device.sh to avoid shell quoting issues
function executeTool(name, args) {
  try {
    switch (name) {
      case "fetch_device_data": {
        const filtersJson = JSON.stringify(args.filters || {});
        const out = execFileSync("bash", [DEVICE_SH, "fetch", args.topic, filtersJson], {
          encoding: "utf8", timeout: 150000
        });
        return out.trim();
      }
      case "send_command": {
        const paramsJson = JSON.stringify(args.params || {});
        const out = execFileSync("bash", [DEVICE_SH, "send", args.action, paramsJson], {
          encoding: "utf8", timeout: 90000
        });
        return out.trim();
      }
      case "get_command_result": {
        const out = execFileSync("bash", [DEVICE_SH, "result", args.command_id], {
          encoding: "utf8", timeout: 30000
        });
        return out.trim();
      }
      case "wait_seconds": {
        const secs = Math.min(Math.max(parseInt(args.seconds) || 3, 1), 30);
        execSync(`sleep ${secs}`);
        return JSON.stringify({ waited: secs });
      }
      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (e) {
    return JSON.stringify({ error: e.message });
  }
}

// Call the LLM via relay proxy
async function chatCompletion(token, messages) {
  const res = await fetch(`${RELAY_URL}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      tools,
      tool_choice: "auto"
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM API error ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  const userRequest = process.argv[2];
  if (!userRequest) {
    console.error("Usage: node apple-agent.js \"<request>\"");
    process.exit(1);
  }

  const { token, braveKey } = getConfig();
  const currentTime = getCurrentTime();

  const systemPrompt = `You are an expert Apple device assistant with web search capabilities. Execute the user's request using the available tools. NEVER ask clarifying questions — use reasonable defaults and web search to fill in gaps.

CURRENT TIME: ${currentTime}

CORE RULES:
- Act immediately: create/fetch/send, then confirm what you did
- Use ISO 8601 dates WITHOUT timezone suffix (device interprets as local time)
- For calendar events: always set both startDate and endDate. If no time given, use current time then +1 hour
- Be concise: 1-2 sentence summary of what you did
- If something fails, try a different approach once, then explain the error briefly

WEB SEARCH — USE IT:
- Before opening apps that need IDs: search for Spotify track IDs, YouTube video IDs, restaurant addresses, etc.
- Example: user says "play Despacito" → web_search("Despacito Spotify track ID") → get the track URI → app.spotify.play
- Example: user says "get me an Uber to that ramen place on Sawtelle" → web_search("ramen restaurant Sawtelle Blvd Los Angeles") → get address → app.uber.ride
- Example: user says "directions to the nearest Trader Joe's" → fetch location first, then web_search("Trader Joe's near [lat,lng]") → app.maps.directions
- Always search when the user gives a vague destination, song name, or business name

APP DEEP LINKS (use send_command):
| Action | Key params | Example |
|--------|-----------|---------|
| app.uber.ride | destination | {destination: "1234 Main St, Santa Monica, CA"} |
| app.lyft.ride | lat, lng | {lat: "34.0195", lng: "-118.4912"} |
| app.maps.directions | address, mode (d/w/r) | {address: "LAX Airport", mode: "d"} |
| app.maps.search | query | {query: "coffee shops nearby"} |
| app.spotify.search | query | {query: "lofi beats"} |
| app.spotify.play | id | {id: "4uLU6hMCjMI75M1A2tKUQC"} |
| app.youtube.search | query | {query: "how to cook pasta"} |
| app.youtube.play | id | {id: "dQw4w9WgXcQ"} |
| app.whatsapp.send | phone, text | {phone: "+15551234567", text: "Hey!"} |
| app.sms.send | number, text | {number: "+15551234567", text: "On my way"} |
| app.phone.call | number | {number: "+15551234567"} |
| app.facetime.call | contact | {contact: "+15551234567"} |
| app.mail.compose | to, subject, body | {to: "jane@email.com", subject: "Hi", body: "..."} |
| app.safari.open | query | {query: "weather forecast"} |
| app.shortcuts.run | name, input | {name: "Morning Routine"} |
| app.venmo.pay | recipient, amount, note | {recipient: "Jane", amount: "25", note: "Dinner"} |
| app.cashapp.pay | recipient, amount, note | {recipient: "$Jane", amount: "25"} |

CONTACTS WORKFLOW:
- Fetch contacts FIRST before calling, texting, or messaging someone by name
- Use name filter: fetch_device_data(contacts, {name: "John"})
- Then use the phone number from the result for sms/call/whatsapp

UNDERSTANDING COMMAND RESULTS:
send_command returns one of three statuses. Handle each correctly:

1. CONFIRMED (e.g. {"status":"created","event_id":"..."} or {"status":"opened","app":"..."}):
   → Action completed successfully. Tell the user what you did. Do NOT re-fetch to verify.

2. PROCESSING ({"status":"processing","id":"..."}):
   → Device received the command but hasn't finished. Use wait_seconds(10) then get_command_result(id) to check.
   → If still no result, tell the user: "Your phone received the command — it should complete shortly."
   → Do NOT say "done" — be honest that you can't confirm completion.

3. DEVICE OFFLINE ({"status":"device_offline",...}):
   → Device didn't respond within 15 seconds. Tell the user: "Your phone appears to be offline or the app isn't running. Please unlock it and open the OpenClaw app, then try again."
   → Do NOT retry — if the device is offline, retrying wastes time.

For fetch_device_data:
- Success returns data directly (contacts, events, etc.)
- {"error":"device_offline"} → same as above, phone is not reachable
- {"error":"timeout"} → phone is online but the operation is taking very long (rare)`;

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userRequest }
  ];

  // Set global timeout
  const timer = setTimeout(() => {
    console.error("Request timed out after 240s");
    process.exit(1);
  }, TIMEOUT_MS);

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await chatCompletion(token, messages);
      const choice = response.choices?.[0];
      if (!choice) throw new Error("No response from model");

      const msg = choice.message;
      messages.push(msg);

      // If no tool calls, we're done — print final response
      if (!msg.tool_calls || msg.tool_calls.length === 0) {
        if (msg.content) console.log(msg.content);
        clearTimeout(timer);
        return;
      }

      // Execute each tool call and append results
      for (const tc of msg.tool_calls) {
        const args = typeof tc.function.arguments === "string"
          ? JSON.parse(tc.function.arguments)
          : tc.function.arguments;

        let result;
        if (tc.function.name === "web_search") {
          result = await webSearch(args.query, braveKey, args.count || 5);
        } else {
          result = executeTool(tc.function.name, args);
        }

        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result
        });
      }
    }

    // Max iterations reached
    console.error("Max tool-call iterations reached");
    const last = messages[messages.length - 1];
    if (last.role === "assistant" && last.content) {
      console.log(last.content);
    } else {
      console.log("The request required too many steps to complete. Please try a simpler request.");
    }
  } catch (e) {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  } finally {
    clearTimeout(timer);
  }
}

main();
