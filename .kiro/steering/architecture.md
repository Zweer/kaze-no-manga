# Architecture

## Overview

Kaze no Manga is a manga reading tracker — search, read, and track progress across devices.

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 7 (strict, noUncheckedIndexedAccess)
- **Database**: Neon Postgres + Drizzle ORM 1.0 (relations v2)
- **Auth**: Better Auth 1.7 (Google OAuth + Passkey)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Validation**: Zod 4
- **Scraping**: cheerio (HTML) + native fetch (JSON APIs)
- **Hosting**: Vercel (Fluid compute)
- **Jobs**: Vercel Cron (daily chapter check)
- **Testing**: Vitest + React Testing Library + Playwright

## Key Decisions

- **Next.js** over TanStack Start: larger ecosystem, more stable, better Vercel integration
- **Postgres** over DynamoDB: full-text search, relational queries, portable
- **Better Auth** over NextAuth/Clerk: self-hosted, full control, great DX, free
- **shadcn/ui**: copy-paste components, full ownership, Tailwind-native
- **Images from source**: direct links to source CDN — no R2, no proxy (~32 MB per chapter makes storage impractical)
- **Vercel Fluid + node-postgres**: TCP pooling via `attachDatabasePool` (fastest method)
- **Multi-source scraper**: pluggable architecture, each source implements `MangaSource` interface
- **One manga = one source**: no cross-source matching (too complex for the value)

## Scraper Architecture

```
lib/scraper/
  types.ts                  # MangaSource interface
  index.ts                  # Registry (getSource, getAllSources)
  fetch-utils.ts            # fetchWithRetry, safeJson, timeout
  sources/
    heancms/index.ts        # Base class: JSON API (OmegaScans)
    madara/index.ts         # Base class: HTML scraping (ToonGod, Toonily)
    comick/index.ts         # Custom: JSON API + HTML for pages
    omegascans/index.ts     # HeanCms instance
    toongod/index.ts        # Madara instance
    toonily/index.ts        # Madara instance
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `user` | User profiles (Better Auth) |
| `session` | Sessions (Better Auth) |
| `account` | OAuth accounts (Better Auth) |
| `verification` | Token verification (Better Auth) |
| `passkey` | WebAuthn credentials (Better Auth) |
| `manga` | Global manga metadata (source, slug, title, cover) |
| `chapter` | Chapters per manga (persisted by CRON) |
| `library` | User ↔ Manga relationship (status, added_at) |
| `reading_progress` | Chapter read tracking per user per manga |

## API Routes

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/search` | GET | Public | Multi-source search (parallel) |
| `/api/manga/[source]/[slug]` | GET | Public | Manga detail from scraper |
| `/api/manga/[source]/[slug]/chapters` | GET | Public | Chapter list from scraper |
| `/api/chapter/[source]/[mangaSlug]/[chapterSlug]` | GET | Public | Chapter page images |
| `/api/library` | GET/POST | Auth | Get/add library entries |
| `/api/library/[id]` | PATCH/DELETE | Auth | Update status/remove |
| `/api/library/check` | GET | Optional | Check if manga in library |
| `/api/progress` | POST | Auth | Mark chapter as read |
| `/api/progress/[source]/[slug]` | GET | Optional | Get read chapters |
| `/api/cron/check-chapters` | GET | CRON_SECRET | Daily new chapter check |
| `/api/auth/[...all]` | GET/POST | - | Better Auth handler |
