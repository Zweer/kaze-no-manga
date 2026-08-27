# Post-MVP Phase 1 — Multi-Source Search

## Wave 12 — Madara Base Class + ToonGod/Toonily

**Goal**: HTML scraping engine for WordPress/Madara-based manga sites.

### Tasks

- [ ] Install cheerio for HTML parsing
- [ ] Create Madara base class implementing MangaSource (HTML scraping)
  - search: parse search results page
  - getManga: parse manga detail page
  - getChapters: parse chapter list (AJAX or page)
  - getChapterPages: parse reader page for image URLs
- [ ] ToonGod instance (extends Madara)
- [ ] Toonily instance (extends Madara)
- [ ] Register in scraper index
- [ ] Unit tests with mocked HTML responses
- [ ] Update conventions doc

### Acceptance

- `getSource("toongod")` and `getSource("toonily")` work
- Search returns results from both sources
- Can read chapters from both sources
- Tests pass

---

## Wave 13 — Comick Scraper

**Goal**: Add Comick (JSON API, large catalog).

### Tasks

- [ ] Research Comick API (likely api.comick.io or similar)
- [ ] Create Comick class implementing MangaSource
- [ ] Register in scraper index
- [ ] Unit tests with mocked responses

### Acceptance

- Search returns results from Comick
- Can read chapters
- Tests pass

---

## Wave 14 — Multi-Source Search UI

**Goal**: Search shows results from ALL registered sources, grouped by source.

### Tasks

- [ ] API: `GET /api/search` fetches all sources in parallel
- [ ] Results grouped by source, ordered by result count
- [ ] Progressive loading: each source section appears as it responds
- [ ] Source filter dropdown (optional: "All" / specific source)
- [ ] Loading skeleton per source section
- [ ] Error handling: if one source fails, others still show
- [ ] Tests: E2E multi-source search

### Acceptance

- Search "solo leveling" shows sections from OmegaScans, ToonGod, Toonily, Comick
- First source to respond appears immediately
- Failed sources show error inline, don't block others
- Source filter works
- Tests pass
