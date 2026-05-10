# MVP Requirements

## Vision

Kaze no Manga is a **reader + tracker in one** — inspired by Mihon but with a backend.
Unlike Mihon (which is headless/local-only), we have a server that stores images on R2
and syncs progress across devices. The scraper architecture can draw inspiration from
Mihon's extension system in future phases.

## Goal

A working manga reading tracker where a user can search manga, read chapters (served
from Cloudflare R2), and track progress across devices.

## Core Flow

```
Search (live on external sources)
  → User picks a manga
  → Manga + chapter list saved to DB (global, shared across all users)
  → User adds it to their Library
  → User opens a chapter → images downloaded to R2 on-demand (sync, user waits)
  → Reader: vertical scroll from R2, chapter transitions
  → Progress tracked: chapters marked as read
  → CRON (daily): checks for new chapters on manga in at least one library
```

## Features

### 1. Auth
- Google OAuth via Better Auth
- Session persists cross-device
- All other features require authentication

### 2. Search
- Live search on OmegaScans (single source for MVP)
- Returns: title, cover image, source URL
- No local DB of all manga — search is always live against the source

### 3. Add to DB
- When user selects a manga from search results, save to Postgres:
  - Manga metadata (title, cover, source, source_id)
  - Chapter list (number, title, source_url)
- Manga is a **global entity** — shared across all users
- If manga already exists in DB (another user added it), skip creation

### 4. Library
- User adds/removes manga to their personal library
- Status: Reading, Completed, Plan to Read, Dropped, On Hold
- Library view shows all user's manga with status and last read chapter

### 5. Reader
- Vertical scroll reader
- Images served from Cloudflare R2
- **Lazy download**: when user opens a chapter not yet on R2, download it
  synchronously (user sees loading state, then reads)
- Infinite chapter transition (finish chapter → next loads automatically)
- If chapter is already on R2 (another user triggered download), serve directly

### 6. Progress
- Mark chapters as read (manual)
- Track current chapter per manga per user
- Reading a chapter automatically marks it as read

### 7. CRON (Daily Chapter Check)
- Vercel Cron triggers daily
- For each manga that exists in at least one user's library:
  - Check source for new chapters
  - Add new chapters to DB
- Does NOT download images (that's lazy, on-demand)
- Does NOT send notifications (post-MVP)

## Technical Constraints

- **Single source per manga** (OmegaScans only for MVP)
- **No offline/PWA cache** — online-only for MVP
- **No push notifications** — post-MVP
- **No automatic progress tracking** (scroll-based) — manual only
- **Sync download** — user waits for chapter images to be on R2 before reading

## Success Criteria

- User can sign in with Google
- User can search a manga on OmegaScans
- User can add manga to library
- User can read a chapter (images from R2)
- Chapter is marked as read after reading
- Progress syncs across devices (same account, different browser)
- CRON detects new chapters daily
- Deployed on Vercel

## Non-Goals (for MVP)

- Multiple sources per manga
- External tracker sync (AniList, MAL)
- Community features
- Recommendations/discovery
- Automatic progress tracking (scroll-based)
- Telegram bot / MCP server
- Offline reading / PWA cache
- Push notifications
