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

## T1 — Auth (Better Auth + Google OAuth)

**Scope:** Better Auth setup + web integration

- [ ] Better Auth config with Google provider
- [ ] Drizzle adapter for Better Auth tables
- [ ] API route handler (`src/routes/api/auth.$.ts`)
- [ ] Web: login/logout flow
- [ ] Web: persist session, protect routes via `_authed` layout
- [ ] Deploy

**Acceptance:** User signs in with Google, session persists across page reloads.

## T2 — Data Models (Drizzle + Neon)

**Scope:** Schema definition, migrations, types

- [ ] Drizzle schema: manga, chapter, user, library, reading_progress tables
- [ ] Neon database provisioned (free tier)
- [ ] Migrations generated and applied
- [ ] TypeScript types exported from schema
- [ ] Deploy

**Acceptance:** Schema compiles, tables exist in Neon, types are importable.

## T3 — Scraper (OmegaScans)

**Scope:** `src/lib/scraper/`

- [ ] Common scraper interface (search, getManga, getChapters, getChapterImages)
- [ ] OmegaScans implementation
- [ ] Tests with mocked HTTP responses

**Acceptance:** `search("solo leveling")` returns results, `getChapterImages(url)` returns image URLs.

## T4 — API (Server Functions)

**Scope:** Server functions + R2 integration

- [ ] Server function: searchManga (calls scraper)
- [ ] Server function: addManga (upsert manga + chapters to Postgres)
- [ ] Server function: getLibrary (user's manga list)
- [ ] Server function: addToLibrary / removeFromLibrary
- [ ] Server function: getChapter (returns image URLs from R2 or triggers download)
- [ ] Server function: markChapterRead
- [ ] R2 integration: upload/download chapter images
- [ ] Deploy

**Acceptance:** All server functions return expected data.

## T5 — Search UI

**Scope:** Web app search page

- [ ] Search input with debounced live query
- [ ] Results grid (cover, title, source)
- [ ] Tap result → detail view with chapter list
- [ ] "Add to Library" button (calls addManga + addToLibrary)
- [ ] Deploy

**Acceptance:** User searches, sees results from OmegaScans, adds manga to library.

## T6 — Library UI

**Scope:** Web app library page

- [ ] Library grid view (cover, title, status, last read chapter)
- [ ] Status filter/tabs (Reading, Completed, Plan to Read, Dropped, On Hold)
- [ ] Change status action
- [ ] Tap manga → chapter list
- [ ] Deploy

**Acceptance:** User sees their library, can filter by status, can navigate to chapters.

## T7 — Reader

**Scope:** Web app reader + R2 download

- [ ] Vertical scroll reader component
- [ ] Loading state while chapter downloads to R2
- [ ] Image lazy loading (viewport-based)
- [ ] Infinite chapter transition (scroll past last image → next chapter loads)
- [ ] Server function: download chapter images from source → R2
- [ ] Deploy

**Acceptance:** User opens chapter, waits for download if needed, reads with vertical scroll, next chapter loads automatically.

## T8 — Progress Tracking

**Scope:** API + UI integration

- [ ] Auto-mark chapter as read when opened
- [ ] Manual mark/unmark from chapter list
- [ ] Show read/unread state in chapter list
- [ ] Track "current chapter" per manga per user
- [ ] Resume reading (open library → continue where left off)
- [ ] Deploy

**Acceptance:** Reading a chapter marks it read. Progress syncs across devices.

## T9 — CRON (Daily Chapter Check)

**Scope:** Vercel Cron + API route

- [ ] Vercel Cron config in `vercel.json`
- [ ] API route: query all manga in at least one library
- [ ] API route: check source for new chapters
- [ ] API route: add new chapters to DB (no image download)
- [ ] Deploy

**Acceptance:** New chapters appear in chapter list within 24h of source publication.

## T10 — Polish

**Scope:** Final touches

- [ ] Custom domain (optional)
- [ ] Error handling / loading states across all pages
- [ ] Mobile responsive polish
- [ ] Deploy

**Acceptance:** App works smoothly on mobile Chrome/Safari, no unhandled errors.
