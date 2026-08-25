# Project Conventions

> These conventions will be defined once the project structure is set up.
> Open points in architecture.md need to be resolved first.

## Routes

- Next.js App Router (`app/` directory)
- Route groups, layouts, and server components — TBD

## Server Logic

- React Server Components for data fetching
- Server Actions for mutations
- Route Handlers (`app/api/`) for external integrations

## Components

- Component library: TBD (see architecture open points)
- One component per file, named export

## Database

- Drizzle ORM with `node-postgres` + `@vercel/functions` `attachDatabasePool`
- Client in `lib/db/index.ts`
- Models in `lib/db/models/` — one file per domain:
  - `auth.ts` (user, session, account, verification, passkey)
  - `manga.ts` (manga, chapter) — future
  - `library.ts` (library, reading_progress) — future
  - `index.ts` (barrel re-export)
- Relations in `lib/db/relations.ts` (cross-domain, single source of truth)
- Migrations output in `db/` directory (committed to repo)
- Runtime: `DATABASE_URL` (pooled, via PgBouncer)
- Migrations: `DATABASE_URL_UNPOOLED` (direct connection for drizzle-kit)
- Deploy: `drizzle-kit migrate` runs before `next build` (vercel.json buildCommand)
- Local: `dotenv-cli` loads `.env.local` for db:* scripts

## Storage

- Images from source: direct links, no proxy, no R2 (simplicity first)
- May revisit in post-MVP

## Auth

- Better Auth (1.7+) with `@better-auth/drizzle-adapter/relations-v2`
- Providers: Google OAuth + Passkey (`@better-auth/passkey`)
- Server config in `lib/auth.ts`
- Client helper in `lib/auth-client.ts`
- Route handler in `app/api/auth/[...all]/route.ts`
- Route protection via `proxy.ts` (Next.js 16 proxy convention)
- Public routes: `/`, `/login`, search, manga detail
- Protected routes: `/library`, `/settings`
