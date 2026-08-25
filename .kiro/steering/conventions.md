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
  - `auth.ts` (user, session, account, verification)
  - `manga.ts` (manga, chapter)
  - `library.ts` (library, reading_progress)
  - `index.ts` (barrel re-export)
- Relations in `lib/db/relations.ts` (cross-domain, single source of truth)
- Migrations in `drizzle/` directory
- Runtime: `DATABASE_URL` (pooled, via PgBouncer)
- Migrations: `DATABASE_URL_UNPOOLED` (direct connection for drizzle-kit)

## Storage

- Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible API)
- Image strategy: TBD (store vs proxy — see architecture open points)

## Auth

- Solution: TBD (see architecture open points)
