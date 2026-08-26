# MVP Waves

## Wave 0 — Bootstrap ✅

**Goal**: Working infra, clean slate, deployable app with auth.

### Tasks

- [x] Wipe Neon DB (drop all tables from old implementation)
- [x] `create-next-app` with App Router + TypeScript
- [x] Biome config (lint + format)
- [x] Lefthook config (pre-commit: biome check + vitest)
- [x] Drizzle ORM setup (node-postgres + @vercel/functions, models in lib/db/models/, migrations)
- [x] Better Auth setup (Google OAuth + Passkey, Drizzle adapter relations-v2)
- [x] Auth tables generated + migrated
- [x] Login/logout flow (minimal — just functional)
- [x] Protected routes via proxy.ts (Next.js 16 convention)
- [x] Vitest + Playwright setup
- [x] Deploy to Vercel (auto-migrate on build)
- [x] Tests: proxy unit tests (100% coverage) + E2E login/redirect

### Acceptance ✅

- App deploys to Vercel on push
- User can sign in with Google and sign out
- Unauthenticated users are redirected to login on protected routes
- Public routes (/, /login) accessible without auth
- All tests pass, 100% coverage on proxy logic

---

## Wave 1 — Shell UI (Mock)

**Goal**: The app looks and feels complete, but everything is fake data.

### Step A: Shell + Visual Infrastructure ✅

- [x] shadcn/ui init (Tailwind v4, OKLCH colors)
- [x] Custom theme "Ink & Wind" (dark primary, purple accent, Inter + Poppins)
- [x] Noise overlay, ink dividers, glassmorphism elements
- [x] Root layout with dark mode by default
- [x] Mobile navigation (floating bottom bar: Search, Library)
- [x] Desktop navigation (top bar: logo + nav items)
- [x] User menu (avatar dropdown with Settings + Sign out, or Sign in button)
- [x] Login dialog (lightbox with blur, Google + Passkey buttons)
- [x] Empty placeholder pages (navigable)
- [x] Tests: E2E navigation + login dialog flow

### Step B: Pages with Mock Data ✅

- [x] Mock data: 5-6 manga with chapters (static, from API routes)
- [x] Search page (input + results grid)
- [x] Library page (grid with status tabs)
- [x] Manga Detail page (cover, info, chapter list)
- [x] Reader page (vertical scroll, placeholder images)
- [x] Settings page (theme toggle, account info, passkey registration)
- [x] Empty states + loading skeletons
- [x] Favicon / app icon
- [x] Responsive: works great on mobile + desktop
- [x] Tests: E2E full navigation flow, responsive checks

### Acceptance ✅

- User can navigate all pages (mock data)
- Design is polished — feels like a finished app
- Dark mode works
- Mobile + desktop responsive
- Tests pass

---

## Wave 2 — Search (Backend) ✅

**Goal**: Scraper works reliably, API returns real data.

### Tasks

- [x] Scraper interface definition (MangaSource: search, getManga, getChapters, getChapterPages)
- [x] HeanCms base class implementation (reusable for all HeanCms sites)
- [x] OmegaScans as HeanCms instance
- [x] Source registry (getSource, getSourceIds, DEFAULT_SOURCE)
- [x] API route: `GET /api/search?q=&source=&page=`
- [x] Rate limiting / error handling for external calls
- [x] Tests: 9 unit tests with mocked HTTP

### Acceptance ✅

- `GET /api/search?q=love` returns manga results from OmegaScans
- Scraper handles errors gracefully (404, paywalled chapters)
- 100% coverage of scraper logic

---

## Wave 3 — Search (Frontend) ✅

**Goal**: User searches and sees real results in a polished UI.

### Tasks

- [x] Replace mock search with real API calls (/api/search)
- [x] Debounced search input (400ms)
- [x] Results grid (cover, title, source)
- [x] Loading / error / empty states for real data
- [x] Tests: E2E search flow against real OmegaScans API

### Acceptance ✅

- User types in search, sees real manga results from OmegaScans
- UI handles slow/failed responses gracefully
- Tests pass

---

## Wave 4 — Manga Detail

**Goal**: User can view manga info and chapter list.

### Tasks

- [ ] API route: `GET /api/manga/[source]/[slug]` (fetch + upsert to DB)
- [ ] Manga detail page (cover, title, description, metadata)
- [ ] Chapter list (ordered, with number + title)
- [ ] Link from search results to detail page
- [ ] Tests: API tests, E2E detail page navigation

### Acceptance

- Clicking a search result shows manga detail with chapter list
- Manga is persisted in DB after first view
- Tests pass

---

## Wave 5 — Library (Base)

**Goal**: User can save manga to their collection.

### Tasks

- [ ] DB: library table (user_id, manga_id, status, added_at)
- [ ] API routes: add to library, remove from library, get library
- [ ] "Add to Library" button on manga detail
- [ ] Library page: flat grid of saved manga
- [ ] "Remove" action
- [ ] Tests: API CRUD tests, E2E add/remove flow

### Acceptance

- User adds manga from detail page
- Library page shows saved manga
- User can remove manga
- Tests pass

---

## Wave 6 — Library (Advanced)

**Goal**: Library is organized and informative.

### Tasks

- [ ] Status management (Reading, Plan to Read, Completed, On Hold, Dropped)
- [ ] Change status action (on library card + detail page)
- [ ] Filter tabs by status
- [ ] Sort options (alphabetical, recently added, last read)
- [ ] Unread chapter badge
- [ ] Tests: E2E status change, filter, sort flows

### Acceptance

- User can set/change manga status
- Filters and sort work correctly
- Unread badge shows when new chapters exist
- Tests pass

---

## Wave 7 — Reader (Core)

**Goal**: User can read a single chapter comfortably.

### Tasks

- [ ] API route: `GET /api/chapter/[id]/images` (fetch from source)
- [ ] Reader page: vertical scroll layout
- [ ] Image lazy loading (viewport-based)
- [ ] Loading state (chapter loading)
- [ ] Error handling (images fail to load)
- [ ] Full-screen mode (hide nav)
- [ ] Tests: API tests, E2E reader flow

### Acceptance

- User opens a chapter from chapter list
- Images load and display in vertical scroll
- Lazy loading works (not all images loaded at once)
- Tests pass

---

## Wave 8 — Reader (Navigation)

**Goal**: Seamless chapter-to-chapter reading experience.

### Tasks

- [ ] Previous / next chapter navigation
- [ ] Chapter transition UI (end of chapter → next prompt)
- [ ] Keyboard shortcuts (arrow keys for prev/next)
- [ ] Scroll progress indicator
- [ ] Back to manga detail
- [ ] Tests: E2E multi-chapter navigation

### Acceptance

- User finishes chapter, can continue to next seamlessly
- Prev/next buttons and keyboard shortcuts work
- Tests pass

---

## Wave 9 — Progress

**Goal**: Reading progress tracked and synced.

### Tasks

- [ ] DB: reading_progress table (user_id, manga_id, chapter_id, read_at)
- [ ] Auto-mark chapter as read when opened
- [ ] Show read/unread state in chapter list
- [ ] "Continue reading" button (resume from last chapter)
- [ ] Track current chapter per manga per user
- [ ] Cross-device sync (same account, different browser)
- [ ] Tests: API tests, E2E progress tracking + resume

### Acceptance

- Opening a chapter marks it as read
- Chapter list shows read/unread correctly
- "Continue reading" resumes at the right chapter
- Progress syncs across devices
- Tests pass

---

## Wave 10 — CRON & Polish

**Goal**: App checks for new content and feels polished.

### Tasks

- [ ] Vercel Cron config: daily chapter check
- [ ] Cron job: for manga in ≥1 library, check source for new chapters
- [ ] Add new chapters to DB (no image download)
- [ ] "New" badge on manga with unread chapters
- [ ] Final polish: error boundaries, 404 page, favicon, meta tags
- [ ] Performance audit (Core Web Vitals)
- [ ] Tests: cron job unit tests, E2E new chapter badge

### Acceptance

- New chapters appear within 24h of source publication
- "New" badge visible on library + detail
- App scores well on Lighthouse
- All tests pass across all waves
- MVP complete 🎉
