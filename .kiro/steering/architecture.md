# Architecture

## Overview

Kaze no Manga is a single TanStack Start application deployed on Vercel.

## Structure

```
src/
├── routes/         # File-based routing (TanStack Router)
├── components/     # UI components (shadcn/ui + custom)
├── lib/            # Business logic (auth, db, scraper, storage)
├── server/         # Server functions (type-safe RPC)
└── styles/         # Tailwind CSS
```

## Stack

- **Framework**: TanStack Start (SSR, server functions, file-based routing)
- **Auth**: Better Auth (Google OAuth)
- **Database**: Neon Postgres + Drizzle ORM
- **Storage**: Cloudflare R2 (manga images, zero egress, S3-compatible)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Hosting**: Vercel
- **Jobs**: Vercel Cron

## Database Schema (Postgres)

| Table | Purpose |
|-------|---------|
| `manga` | Global manga metadata (title, cover, source, source_id) |
| `chapter` | Chapters per manga (number, title, source_url, images_on_r2) |
| `user` | User profiles (from Better Auth) |
| `library` | User ↔ Manga relationship (status, added_at) |
| `reading_progress` | Current chapter per manga per user, chapters read |

## Key Decisions

- **TanStack Start** over Next.js: type-safe routing, explicit caching, no vendor lock-in
- **Postgres** over DynamoDB: full-text search, relational queries, portable
- **Cloudflare R2** over S3/Vercel Blob: zero egress fees (critical for serving manga images)
- **Better Auth** over Auth.js: better DX, plugin system, native TanStack Start support
- **Vercel** over AWS: zero infra management, git-push deploys, native framework support
- **Single app** over monorepo: simpler for a single deployable, no workspace overhead
