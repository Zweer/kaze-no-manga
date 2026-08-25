# Architecture

## Overview

Kaze no Manga is a manga reading tracker — search, read, and track progress across devices.

## Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict)
- **Database**: Neon Postgres + Drizzle ORM (1.0, relations v2)
- **Auth**: Better Auth (1.7+) with `@better-auth/drizzle-adapter/relations-v2`
- **UI**: shadcn/ui
- **Hosting**: Vercel
- **Jobs**: Vercel Cron

## Key Decisions

- **Next.js** over TanStack Start: larger ecosystem, more stable, better Vercel integration
- **Postgres** over DynamoDB: full-text search, relational queries, portable
- **Better Auth** over NextAuth/Clerk: self-hosted, full control, great DX, free
- **shadcn/ui**: copy-paste components, full ownership, Tailwind-native
- **Images from source**: link directly to external source — no R2, no proxy (simplicity first)
- **Vercel** over AWS: zero infra management, git-push deploys

## Open Points

> To be decided when the relevant wave starts.

- [ ] **Project structure**: App Router conventions (route groups, server components, etc.)
- [ ] **Monorepo vs single app**: Still single app?

## Database Schema (concept)

| Table | Purpose |
|-------|---------|
| `user` | User profiles (managed by Better Auth) |
| `session` | Sessions (managed by Better Auth) |
| `account` | OAuth accounts (managed by Better Auth) |
| `verification` | Email/token verification (managed by Better Auth) |
| `passkey` | WebAuthn credentials (managed by Better Auth) |
| `manga` | Global manga metadata (title, cover, source, source_id) |
| `chapter` | Chapters per manga (number, title, source_url) |
| `library` | User ↔ Manga relationship (status, added_at) |
| `reading_progress` | Current chapter per manga per user, chapters read |
