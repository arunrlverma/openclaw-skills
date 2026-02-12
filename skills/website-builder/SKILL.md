---
name: website_builder
description: Build and host a website on this server. Use when the user wants to create a web page, dashboard, portfolio, or any content viewable in a browser.
---

# Website Builder

## Use When
- User wants to show something in a browser (dashboard, portfolio, report, landing page)
- User asks to "make a website" or "create a page"
- User wants to display data, charts, or formatted content visually
- User asks for something that would be better viewed in a browser than in chat

## Don't Use When
- User just wants text information (respond in chat instead)
- User asks about a specific website (use web-search instead)

## How It Works
You have a web server (nginx) running on this VPS. Any files you place in `/root/workspace/www/` are immediately served at `http://YOUR_VPS_IP/`.

## Building a Site
1. Create HTML/CSS/JS files using the exec tool (bash)
2. Write them to `/root/workspace/www/`
3. The site is live immediately — share the URL with the user

## Design Guidelines
Use Tailwind CSS via CDN for beautiful, responsive designs:
```html
<script src="https://cdn.tailwindcss.com"></script>
```

For icons, use Lucide:
```html
<script src="https://unpkg.com/lucide@latest"></script>
```

For charts, use Chart.js:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

## Template
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PAGE_TITLE</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Content here -->
    </div>
</body>
</html>
```

## Multi-Page Sites
- `index.html` — Home page
- `about.html` — About page
- `dashboard.html` — Data dashboard
- Static assets in `/root/workspace/www/assets/`

## Important
- The URL is `http://VPS_IP/` (no HTTPS yet)
- Files in /root/workspace/www/ are publicly accessible — do NOT put sensitive data there
- **Files are auto-deleted after 24 hours** — this is temporary hosting for sharing content
- Tell the user the link will expire in ~24 hours
- nginx automatically serves static files (no Node.js server needed)
- For dynamic APIs, use Node.js on a different port and proxy via nginx
