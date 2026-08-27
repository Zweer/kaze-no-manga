# Post-MVP Roadmap

## Philosophy

Same as MVP: one thing at a time, make it great, then move on.
Each phase is independent and shippable.

## Phase 1 — Multi-Source Search

**Priority: 🔥 #1 — unlocks real daily usage**

- Add Madara base class (ToonGod, Toonily)
- Add Comick scraper (JSON API)
- Add WeebCentral scraper (custom)
- Search returns results grouped by source, ordered by result count
- Parallel fetch — sources appear progressively as they respond
- Optional source filter in search UI
- Each manga stays tied to ONE source (no cross-source matching)

## Phase 2 — External Tracker Sync

**Priority: 🔥 #2 — critical for power users**

- AniList integration (OAuth + API)
- MyAnimeList integration
- Import library from tracker
- Export/sync progress to tracker
- Bi-directional: read on Kaze → updates AniList, update AniList → reflects in Kaze

## Phase 3 — Notifications

**Priority: 🔥 #3 — the "it works for me" feature**

- Notification preferences per user (Settings page)
- Channels (user picks which ones):
  - Web Push (browser native)
  - Telegram bot
  - Discord webhook
- Triggered by CRON when new chapters are found
- Per-manga notification toggle (mute specific manga)

## Phase 4 — Reader Improvements

**Priority: 🟡**

- Scroll-based progress (mark read when reaching bottom, not on open)
- Prefetch next chapter while reading
- Pinch to zoom on mobile
- Double-tap to zoom
- Reading direction setting (vertical scroll / horizontal swipe)

## Phase 5 — PWA

**Priority: 🟡**

- Service worker for caching (app shell, static assets)
- "Install app" prompt
- Offline: deferred (needs local image storage — complex)

## Phase 6 — Telegram/Discord Bot

**Priority: 🟡**

- Beyond notifications: search, quick actions
- Telegram: inline search, "add to library" from chat
- Discord: slash commands in server

## Phase 7 — Recommendations

**Priority: 🟢**

- "If you like X, try Y" based on genres/library
- Trending on each source
- New releases feed

## Phase 8 — Community

**Priority: 🟢**

- Shared reading lists
- Ratings / reviews
- User profiles (public library)

## Dropped

- ~~MCP server~~ — deprioritized, no clear use case
- ~~Manga multi-source matching~~ — too complex for the value. Each manga stays on one source. User re-adds from another source if needed.

## Notes

- Multi-source matching was considered but rejected: slug matching is unreliable,
  global matching needs admin review, and the simpler "one manga = one source"
  model covers 99% of use cases.
- AniList ID could be used as a future "universal ID" if cross-source matching
  becomes necessary, but only for manga that exist on AniList.
- Architecture supports adding sources easily (implement MangaSource interface,
  register in lib/scraper/index.ts).
