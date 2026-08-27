# Post-MVP Phase 1 — Multi-Source Search

## Wave 12 — Madara Base Class + ToonGod/Toonily ✅

**Goal**: HTML scraping engine for WordPress/Madara-based manga sites.

### Tasks

- [x] Install cheerio for HTML parsing
- [x] Create Madara base class implementing MangaSource (HTML scraping)
- [x] ToonGod instance (mangaSubDirectory: "webtoons")
- [x] Toonily instance (mangaSubDirectory: "serie")
- [x] Register in scraper index
- [x] 10 unit tests with mocked HTML responses

### Acceptance ✅

- `getSource("toongod")` and `getSource("toonily")` work
- All Madara methods tested (search, getManga, getChapters, getChapterPages)

---

## Wave 13 — Comick Scraper ✅

**Goal**: Add Comick (JSON API, large catalog).

### Tasks

- [x] Comick class (api.comick.io, JSON API + HTML for chapter pages)
- [x] Register in scraper index (now 4 sources)
- [x] 6 unit tests with mocked responses

### Acceptance ✅

- Search, detail, chapters, pages all work via API
- Tests pass

---

## Wave 14 — Multi-Source Search UI ✅

**Goal**: Search shows results from ALL registered sources, grouped by source.

### Tasks

- [x] API: `GET /api/search` fetches all sources in parallel
- [x] Results grouped by source, ordered by result count (most first)
- [x] Failed sources show error inline, don't block others
- [x] Source sections with header (name + count + ink divider)
- [x] Empty sources hidden
- [x] Single source mode: `?source=omegascans` for filtering

### Acceptance ✅

- Search returns sections from all 4 sources
- Sources sorted by result count
- Failed sources show error, don't break others
- Tests pass (90 total)
