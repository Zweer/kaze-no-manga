# MVP Requirements

## Goal

A working manga reading tracker where a user can search manga, read chapters, and track progress across devices.

## Features

1. **Search** — Find manga by title (from MangaPark/OmegaScans)
2. **Read** — Vertical scroll reader with lazy loading and infinite chapter transition
3. **Library** — Add/remove manga, set status (Reading, Completed, Plan to Read, Dropped, On Hold)
4. **Progress** — Mark chapters as read, track current chapter
5. **Auth** — Google OAuth via Cognito
6. **PWA** — Installable, offline cache for read chapters, push notifications (later)

## Non-Goals (for MVP)

- External tracker sync (AniList, MAL)
- Community features
- Recommendations/discovery
- Automatic progress tracking (scroll-based)
- Telegram bot / MCP server

## Success Criteria

- User can sign in, search a manga, read a chapter, and see it marked as read
- Works on mobile browser as installed PWA
- Deployed on AWS with CDK
