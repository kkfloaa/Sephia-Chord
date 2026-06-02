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
```

## Personal-Only Notes

- Do not commit `.env` or `.env.local`.
- Do not share the deployed URL.
- Keep Vercel Deployment Protection enabled if you want an extra gate before the PIN screen.
- After deployment, open `/api/health` once to confirm the environment variables are recognized.
