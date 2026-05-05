# MVP Tasks

## Dependency Order

```
T1 (Auth) → T2 (Models) → T3 (Scraper) → T4 (API) → T5 (Search UI)
                                              ↓
                              T6 (Library) → T7 (Reader) → T8 (Progress)
                                                              ↓
                                                           T9 (CRON)
```

## T1 — Auth (Cognito + Google OAuth)

**Scope:** CDK stack + web integration

- [ ] Cognito User Pool with Google as identity provider
- [ ] Cognito App Client (SPA flow)
- [ ] Web: login/logout flow (redirect to Cognito hosted UI)
- [ ] Web: persist session, protect routes
- [ ] AppSync: configure Cognito authorizer

**Acceptance:** User signs in with Google, session persists across page reloads.

## T2 — Data Models (GraphQL + DynamoDB)

**Scope:** Schema definition, types, table design

- [ ] GraphQL schema: Manga, Chapter, User, Library, History types
- [ ] GraphQL schema: queries and mutations
- [ ] DynamoDB table design (single-table, pk/sk/gsi1)
- [ ] Generated TypeScript types from schema

**Acceptance:** Schema compiles, types are importable from `@kaze-no-manga/models`.

## T3 — Scraper (OmegaScans)

**Scope:** `@kaze-no-manga/scraper` package

- [ ] Common scraper interface (search, getManga, getChapters, getChapterImages)
- [ ] OmegaScans implementation
- [ ] Tests with mocked HTTP responses

**Acceptance:** `search("solo leveling")` returns results, `getChapterImages(url)` returns image URLs.

## T4 — API (AppSync Resolvers)

**Scope:** CDK + JS resolvers

- [ ] Resolver: searchManga (calls scraper Lambda)
- [ ] Resolver: addManga (upsert manga + chapters to DynamoDB)
- [ ] Resolver: getLibrary (user's manga list)
- [ ] Resolver: addToLibrary / removeFromLibrary
- [ ] Resolver: getChapter (returns image URLs from S3 or triggers download)
- [ ] Resolver: markChapterRead
- [ ] Lambda: scraper worker (search + download images to S3)

**Acceptance:** All resolvers return expected data via AppSync console.

## T5 — Search UI

**Scope:** Web app search page

- [ ] Search input with debounced live query
- [ ] Results grid (cover, title, source)
- [ ] Tap result → detail view with chapter list
- [ ] "Add to Library" button (calls addManga + addToLibrary)

**Acceptance:** User searches, sees results from OmegaScans, adds manga to library.

## T6 — Library UI

**Scope:** Web app library page

- [ ] Library grid view (cover, title, status, last read chapter)
- [ ] Status filter/tabs (Reading, Completed, Plan to Read, Dropped, On Hold)
- [ ] Change status action
- [ ] Tap manga → chapter list

**Acceptance:** User sees their library, can filter by status, can navigate to chapters.

## T7 — Reader

**Scope:** Web app reader + S3 download Lambda

- [ ] Vertical scroll reader component
- [ ] Loading state while chapter downloads to S3
- [ ] Image lazy loading (viewport-based)
- [ ] Infinite chapter transition (scroll past last image → next chapter loads)
- [ ] Lambda: download chapter images from source → S3

**Acceptance:** User opens chapter, waits for download if needed, reads with vertical scroll, next chapter loads automatically.

## T8 — Progress Tracking

**Scope:** API + UI integration

- [ ] Auto-mark chapter as read when opened
- [ ] Manual mark/unmark from chapter list
- [ ] Show read/unread state in chapter list
- [ ] Track "current chapter" per manga per user
- [ ] Resume reading (open library → continue where left off)

**Acceptance:** Reading a chapter marks it read. Progress syncs across devices.

## T9 — CRON (Daily Chapter Check)

**Scope:** EventBridge + Lambda

- [ ] EventBridge rule (daily trigger)
- [ ] Lambda: query all manga in at least one library
- [ ] Lambda: check source for new chapters
- [ ] Lambda: add new chapters to DB (no image download)

**Acceptance:** New chapters appear in chapter list within 24h of source publication.

## T10 — Deploy & Polish

**Scope:** Infrastructure + final touches

- [ ] CloudFront distribution for web app
- [ ] Lambda@Edge for SSR
- [ ] Custom domain (optional)
- [ ] Error handling / loading states across all pages
- [ ] Mobile responsive polish

**Acceptance:** App deployed, accessible via URL, works on mobile Chrome/Safari.
