# Architecture

## Overview

Kaze no Manga is a manga reading tracker — search, read, and track progress across devices.

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict)
- **Database**: Neon Postgres + Drizzle ORM
- **Storage**: Cloudflare R2 (manga images, zero egress, S3-compatible)
- **Auth**: TBD (open point)
- **UI**: TBD (open point)
- **Hosting**: Vercel
- **Jobs**: Vercel Cron

## Key Decisions

- **Next.js** over TanStack Start: larger ecosystem, more stable, better Vercel integration
- **Postgres** over DynamoDB: full-text search, relational queries, portable
- **Cloudflare R2** over S3/Vercel Blob: zero egress fees (critical for serving manga images)
- **Vercel** over AWS: zero infra management, git-push deploys

## Open Points

> These need to be decided before implementation begins.

- [ ] **Auth solution**: Better Auth? NextAuth? Clerk? (evaluate DX, cost, features)
- [ ] **UI library**: shadcn/ui again? Or something else?
- [ ] **Image storage strategy**: Store images on R2 or fetch on-demand from source and proxy?
- [ ] **Project structure**: App Router conventions (route groups, server components, etc.)
- [ ] **Monorepo vs single app**: Still single app?

## Database Schema (unchanged concept)

| Table | Purpose |
|-------|---------|
| `manga` | Global manga metadata (title, cover, source, source_id) |
| `chapter` | Chapters per manga (number, title, source_url) |
| `user` | User profiles |
| `library` | User ↔ Manga relationship (status, added_at) |
| `reading_progress` | Current chapter per manga per user, chapters read |
