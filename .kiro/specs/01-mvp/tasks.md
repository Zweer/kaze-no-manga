# MVP Tasks

## Dependency Order

```
T1 (Auth) → T2 (Models) → T3 (Scraper) → T4 (API) → T5 (Search UI)
                                                         ↓
                                         T6 (Library) → T7 (Reader) → T8 (Progress)
                                                                         ↓
                                                                      T9 (CRON)
                                                                         ↓
                                                                      T10 (Polish)
```

Each task ends with a deploy to Vercel. The app grows incrementally.

## T1 — Auth (Better Auth + Google OAuth) ✅

**Scope:** Better Auth setup + web integration

- [x] Better Auth config with Google provider
- [x] Drizzle adapter for Better Auth tables
- [x] API route handler (`src/routes/api/auth.$.ts`)
- [x] Web: login/logout flow
- [x] Web: persist session, protect routes via `_authed` layout
- [x] Deploy

**Acceptance:** ✅ User signs in with Google, session persists across page reloads.

## T2 — Data Models (Drizzle + Neon) ✅

**Scope:** Schema definition, migrations, types

- [x] Drizzle schema: manga, chapter, user, library, reading_progress tables
- [x] Neon database provisioned (free tier)
- [x] Migrations generated and applied
- [x] TypeScript types exported from schema
- [x] Deploy

**Acceptance:** ✅ Schema compiles, tables exist in Neon, types are importable.

## T3 — Scraper (OmegaScans) ✅

**Scope:** `src/lib/scraper/`

- [x] Common scraper interface (search, getManga, getChapters, getChapterImages)
- [x] OmegaScans implementation
- [x] Tests with mocked HTTP responses

**Acceptance:** ✅ `search("stopwatch")` returns results, `getChapterImages(url)` returns image URLs.

## T4 — API (Server Functions) ✅

**Scope:** Server functions + R2 integration

- [x] Server function: searchManga (calls scraper)
- [x] Server function: addManga (upsert manga + chapters to Postgres)
- [x] Server function: getLibrary (user's manga list)
- [x] Server function: addToLibrary / removeFromLibrary
- [x] Server function: getChapter (returns image URLs from source)
- [x] Server function: markChapterRead
- [x] R2 integration: upload/download chapter images
- [x] Deploy

**Acceptance:** ✅ All server functions return expected data.

## T5 — Search UI ✅

**Scope:** Web app search page

- [x] Search input with debounced live query
- [x] Results grid (cover, title, source)
- [x] Tap result → detail view with chapter list
- [x] "Add to Library" button (calls addManga + addToLibrary)
- [x] Deploy

**Acceptance:** ✅ User searches, sees results from OmegaScans, adds manga to library.

## T6 — Library UI ✅

**Scope:** Web app library page

- [x] Library grid view (cover, title, status, last read chapter)
- [x] Status filter/tabs (Reading, Completed, Plan to Read, Dropped, On Hold)
- [ ] Change status action (deferred to polish)
- [x] Tap manga → chapter list
- [x] Deploy

**Acceptance:** ✅ User sees their library, can filter by status, can navigate to chapters.

## T7 — Reader ✅

**Scope:** Web app reader + source download

- [x] Vertical scroll reader component
- [x] Loading state while chapter loads
- [x] Image lazy loading (viewport-based)
- [x] Chapter navigation (prev/next)
- [x] Server function: fetch chapter images from source
- [x] Deploy

**Acceptance:** ✅ User opens chapter, reads with vertical scroll, can navigate chapters.

## T8 — Progress Tracking ✅

**Scope:** API + UI integration

- [x] Auto-mark chapter as read when opened
- [ ] Manual mark/unmark from chapter list (deferred)
- [x] Show read/unread state in chapter list
- [x] Track "current chapter" per manga per user
- [x] Resume reading (continue where left off)
- [x] Deploy

**Acceptance:** ✅ Reading a chapter marks it read. Progress syncs across devices.

## T9 — CRON (Daily Chapter Check) ✅

**Scope:** Vercel Cron + API route

- [x] Vercel Cron config in `vercel.json`
- [x] API route: query all manga in at least one library
- [x] API route: check source for new chapters
- [x] API route: add new chapters to DB (no image download)
- [x] Deploy

**Acceptance:** ✅ New chapters appear in chapter list within 24h of source publication.

## T10 — Polish ✅

**Scope:** Final touches

- [ ] Custom domain (optional)
- [x] Error handling / loading states across all pages
- [x] Mobile responsive (mobile header, bottom nav)
- [x] 404 page
- [x] Favicon
- [x] Deploy

**Acceptance:** ✅ App works smoothly on mobile Chrome/Safari, no unhandled errors.
