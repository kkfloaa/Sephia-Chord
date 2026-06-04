# Sephia Chord Deployment

## Required Vercel Environment Variables

Add these in Vercel Project Settings > Environment Variables.

```text
APP_PASSWORD=4-digit PIN
SESSION_SECRET=long random secret
NOTION_TOKEN=Notion integration token
NOTION_DATA_SOURCE_ID=372e8d7a-8351-806b-ab7c-000b31321073
NOTION_VERSION=2026-03-11
NOTION_TIME_ZONE_OFFSET=+09:00
VAPID_PUBLIC_KEY=generated public key
VAPID_PRIVATE_KEY=generated private key
VAPID_SUBJECT=mailto:your-email@example.com
CRON_SECRET=long random secret
```

Generate push keys locally:

```bash
node scripts/generate-vapid-keys.js
```

## Background 30-Minute Alerts

The app stores the browser push subscription in Notion and exposes:

```text
GET /api/reminder-cron
Authorization: Bearer CRON_SECRET
```

Call this endpoint every 5 minutes from an external scheduler, or use Vercel Cron on a plan that supports that frequency.

Vercel Hobby Cron is not suitable for 30-minute alerts because its schedule frequency is too low for minute-level reminder checks.

On iPhone, background web push requires the app to be installed on the Home Screen.

## Personal-Only Notes

- Do not commit `.env` or `.env.local`.
- Do not share the deployed URL.
- Keep Vercel Deployment Protection enabled if you want an extra gate before the PIN screen.
- After deployment, open `/api/health` once to confirm the environment variables are recognized.
