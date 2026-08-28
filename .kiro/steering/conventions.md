# Project Conventions

## Routes

- Next.js App Router (`app/` directory)
- Route group `(app)` for pages with navigation layout
- API routes in `app/api/`
- Proxy (`proxy.ts`) protects `/library` and `/settings`

## Server Logic

- API Route Handlers for all data fetching
- Client-side fetching with `useEffect` + `useState`
- Shared helpers: `requireSession()`, `apiError()`, `buildMangaId()`
- Input validation: Zod schemas in `lib/validations.ts`

## Components

- shadcn/ui for primitives (Button, Card, Dialog, Tabs, Select, etc.)
- Reusable app components: `MangaCover`, `MangaCardSkeleton`, `PageHeading`, `ErrorState`, `StatusSelect`
- Layout components: `MobileNav`, `DesktopNav`, `NoiseOverlay`, `LoginDialog`, `UserMenu`
- Shared nav items in `components/layout/nav-items.ts`
- Custom hooks in `hooks/` (e.g. `useMangaDetail`)
- Toast via Sonner for mutation feedback
- AlertDialog for destructive actions

## Database

- Drizzle ORM with `node-postgres` + `@vercel/functions` `attachDatabasePool`
- Client in `lib/db/index.ts`
- Models in `lib/db/models/` — one file per domain:
  - `auth.ts` (user, session, account, verification, passkey)
  - `manga.ts` (manga)
  - `chapter.ts` (chapter)
  - `library.ts` (library)
  - `progress.ts` (reading_progress)
  - `index.ts` (barrel re-export)
- Relations in `lib/db/relations.ts` (cross-domain, single source of truth)
- Migrations output in `db/` directory (committed to repo)
- Runtime: `DATABASE_URL` (pooled, via PgBouncer)
- Migrations: `DATABASE_URL_UNPOOLED` (direct connection for drizzle-kit)
- Deploy: `drizzle-kit migrate` runs before `next build` (vercel.json buildCommand)
- Local: `dotenv-cli` loads `.env.local` for db:* scripts

## Scraper

- Interface: `MangaSource` in `lib/scraper/types.ts`
- Registry: `lib/scraper/index.ts` (getSource, getAllSources)
- Resilience: `fetchWithRetry` (10s timeout, 3 retries, exponential backoff)
- Safe JSON parsing: `safeJson<T>()`
- Base classes: `HeanCms` (JSON API), `Madara` (HTML scraping via cheerio)
- Sources: OmegaScans, ToonGod, Toonily, Comick

## Storage

- Images from source: direct links, no proxy, no R2
- ~32 MB per chapter makes storage impractical (verified via analysis)

## Auth

- Better Auth (1.7+) with `@better-auth/drizzle-adapter/relations-v2`
- Providers: Google OAuth + Passkey (`@better-auth/passkey`)
- Server config in `lib/auth.ts`
- Client helper in `lib/auth-client.ts`
- Route handler in `app/api/auth/[...all]/route.ts`
- Route protection via `proxy.ts` (Next.js 16 proxy convention)
- Cookie: `__Secure-better-auth.session_token` (HTTPS) or `better-auth.session_token` (HTTP)
- Public routes: `/`, search, manga detail, reader
- Protected routes: `/library`, `/settings`
- Login: lightbox dialog on current page (`?login=true&callbackUrl=...`)
