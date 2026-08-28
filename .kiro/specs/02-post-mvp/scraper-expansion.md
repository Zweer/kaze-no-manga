# Scraper Expansion — New Sources Spec

> Reference: keiyoushi/extensions-source (Mihon extensions)
> Last updated: 2026-08-28

## Context

Kaze no Manga currently has 3 sources: **MangaDex**, **Comick**, **OmegaScans**.
Goal: add 9 more sources by studying how Mihon's Kotlin extensions work and
replicating the HTTP patterns in our TypeScript scraper (no browser, no WebView).

## How Mihon Actually Works

Mihon does **NOT** use an Android browser for normal scraping. The flow is:

1. **OkHttp client** — standard HTTP requests with custom headers/cookies
2. **Source-specific interceptors** — each extension can:
   - Add cookies (e.g. `toonily-mature=1`)
   - Compute tokens/signatures (e.g. MangaFire `VrfSigner`)
   - Solve redirects (e.g. BatCave `DleGuardResolver`)
3. **WebView ONLY for Cloudflare** — when CF blocks everything, Mihon opens
   Android WebView to let the user solve the challenge, then reuses cookies.
   This is a one-shot fallback, NOT the normal scraping path.

**None of the sources in our list require Cloudflare WebView bypass.**

## Current Scraper Architecture

```
lib/scraper/
  types.ts              # MangaSource interface
  index.ts              # Registry (getSource, getAllSources)
  fetch-utils.ts        # fetchWithRetry, safeJson, timeout
  sources/
    heancms/index.ts    # Base class: JSON API
    omegascans/index.ts # HeanCms instance
    comick/index.ts     # Custom: JSON API + HTML for pages
    mangadex/index.ts   # Custom: JSON API
```

Each source implements `MangaSource`:
- `search(query, page?)` → `SearchResult`
- `getManga(identifier)` → `MangaDetail`
- `getChapters(manga)` → `Chapter[]`
- `getChapterPages(chapter)` → `string[]` (image URLs)

---

## Source Analysis

### Tier 1 — Easy (pure HTML or clean JSON API, no anti-bot)

#### ToonGod ⭐ IMPORTANT — ❌ BLOCKED BY CLOUDFLARE
- **Mihon base**: `MadaraNoAjax` (WordPress Madara theme, no AJAX)
- **Type**: HTML scraping (cheerio)
- **URL**: `https://www.toongod.org`
- **mangaSubString**: `webtoons`
- **Search**: `GET /{mangaSubString}/?s={query}&post_type=wp-manga`
- **Manga detail**: `GET /{mangaSubString}/{slug}/` → parse HTML selectors
- **Chapter list**: Embedded in manga detail page (no AJAX call needed)
- **Chapter pages**: `GET /{mangaSubString}/{slug}/{chapter-slug}/` → parse `div.page-break img`
- **Date format**: `d MMM yyyy` (e.g. "5 Aug 2026")
- **Protection**: ❌ **Cloudflare Managed Challenge** (cType: 'managed', verified 2026-08-28)
  - Returns 403 with JS challenge on ALL requests
  - Cannot be bypassed server-side without a headless browser
  - Mihon handles this via Android WebView (user solves challenge, cookies reused)
- **Status**: PARKED — not implementable without browser. Will be skipped.
  If CF protection is ever removed, the Madara base class supports it via config.

#### Toonily ⭐ IMPORTANT
- **Mihon base**: `Madara` (WordPress Madara theme, AJAX variant)
- **Type**: HTML scraping + WP-Admin AJAX POST
- **URL**: `https://toonily.com`
- **mangaSubString**: `serie` (NOTE: not "manga" or "webtoon")
- **Search**: POST to `/wp-admin/admin-ajax.php` with `action=madara_load_more`
  - FormData: `page`, `template`, `vars[s]`, `vars[post_type]=wp-manga`, etc.
- **Manga detail**: `GET /serie/{slug}/` → parse HTML selectors
- **Chapter list (Ajax)**: POST to `/serie/{slug}/ajax/chapters/` with empty body
  - Headers: `X-Requested-With: XMLHttpRequest`
- **Chapter pages**: Same as ToonGod — `div.page-break img`
  - Some chapters use `#chapter-protector-data` (AES encrypted) — need to handle
- **Cookie required**: `toonily-mature=1`
- **Date format**: `MMM d, yy` (e.g. "Aug 5, 26")
- **Protection**: None (just the cookie)
- **Notes**: Search URL pattern `/webtoon/` gets rewritten to `/serie/`

#### Weeb Central
- **Mihon base**: Custom `KeiSource`
- **Type**: HTML scraping
- **URL**: `https://weebcentral.com`
- **Search**: `GET /search/data?text={query}&limit=32&offset=0&display_mode=Full+Display`
- **Manga detail**: `GET /series/{id}/{slug}` → parse `section[x-data]` blocks
- **Chapter list**: `GET /series/{id}/full-chapter-list` → parse `div[x-data] > a`
- **Chapter pages**: `GET /series/{id}/{chapter}/images?is_prev=False&reading_style=long_strip`
  → parse `section[x-data~=scroll] > img[src]`
- **Rate limit**: 1 request per 2 seconds
- **Protection**: None
- **Notes**: Uses `<source srcset>` for cover images. Strips special chars from search.

#### ReadComicsOnline
- **Mihon base**: `MMRCMS` (custom multi-site CMS)
- **Type**: HTML scraping
- **URL**: `https://readcomicsonline.li` (verify current URL)
- **Search**: Text search via `/search/{query}`
- **Popular**: `GET /comic-list?sort=views&page={n}`
- **Manga detail**: Parse `h1.text-2xl`, `img.w-full.rounded-xl`, `p.mt-5.text-sm`
- **Chapter list**: `.overflow-hidden.border-ink-600 > a`
- **Chapter pages**: `#reader-all img`
- **Date format**: `d MMM yyyy`
- **Protection**: None
- **Notes**: Uses `itemPath = "comic"` (not "manga"). Simple, minimal site.

#### Atsumaru
- **Mihon base**: Custom `KeiSource`
- **Type**: JSON API (REST + Typesense search)
- **URL**: `https://atsumaru.co`
- **Search**: `GET /collections/manga/documents/search?q={query}&query_by=title,englishTitle,otherNames,authors&per_page=40&page={n}`
  - Response: Typesense format `{ hits: [{ document: {...} }] }`
  - OR fallback: `{ items: [...] }`
- **Popular**: `GET /api/home2/popular?offset=0&limit=40&types=Manga,Manwha,Manhua,OEL&mediums=Comic&timeframe=daily`
- **Manga detail**: `GET /api/manga/page?id={id}` → `{ mangaPage: {...} }`
- **Chapter list**: `GET /api/manga/allChapters?mangaId={id}` → `{ chapters: [...] }`
- **Chapter pages**: `GET /api/read/chapter?mangaId={slug}&chapterId={chapterId}`
  → `{ readChapter: { pages: [{ image, pageNumber, pageUuid, ext }] } }`
- **Headers**: `Accept: */*`, `Content-Type: application/json`
- **Protection**: None (rate limit 2 req/s)
- **Notes**: Static images may need protocol fix (`http:` → `https:`).
  Images can be on source CDN or `/static/` path.

### Tier 2 — Medium (anti-bot mechanisms to reverse-engineer)

#### MangaFire
- **Mihon base**: Custom `KeiSource`
- **Type**: JSON API
- **URL**: `https://mangafire.to`
- **Search**: `GET /api/titles?keyword={query}&page={n}&limit=50&order[views_30d]=desc`
- **Manga detail**: `GET /api/titles/{hid}`
- **Chapter list**: `GET /api/titles/{hid}/chapters?language=en&sort=number&order=desc&page={n}&limit=200`
- **Chapter pages**: `GET /api/chapters/{chapterId}` → `{ data: { pages: [{ url }] } }`
- **Protection**: ⚠️ **VrfSigner interceptor** — signs requests with a computed token
  - Need to reverse-engineer `VrfSigner` class to understand the signing algorithm
  - Also has `ChallengeSolverInterceptor` for shape-selecting captcha
- **Difficulty**: Medium-High — the VrfSigner is the main blocker
- **Notes**: Uses `hid` (hash ID) for manga identification, extracted from URL slugs

#### Kagane
- **Mihon base**: Custom `KeiSource`
- **Type**: JSON API (v2)
- **URL**: `https://kagane.org` (verify)
- **Search**: `POST /api/v2/search/series` with JSON body (genres, tags, sort, content_lang)
  - Query params: `?page={n}&size=35&sort={sortParam}`
- **Manga detail**: `GET /api/v2/series/{seriesId}`
- **Chapter list**: Embedded in manga detail response (`seriesBooks` array)
- **Chapter pages**: `POST /api/v2/books/{chapterId}?is_datasaver=false` with `{}` body
  - Requires **integrity token** via `POST /api/integrity` (from base URL page)
  - Requires **challenge response** per chapter — token + cacheUrl + manifest
  - Image URLs: `{cacheUrl}/api/v2/books/page/{chapterId}/{pageUuid}.jxl?token={accessToken}`
- **Protection**: ⚠️ **Integrity token + per-chapter challenge**
  - Token refreshes on 401/403/507
  - Interceptor handles automatic refresh
- **Difficulty**: Medium — tokens are programmatic, no browser needed, but complex flow
- **Notes**: Multi-language (uses `content_lang` filter). Has genre/tag filters via API.

#### BatCave
- **Mihon base**: Custom `KeiSource`
- **Type**: HTML scraping + JSON (DLE-based CMS — DataLife Engine)
- **URL**: `https://batcave.biz` (verify)
- **Search**: `GET /search/{query}` or filter via `GET /ComicList/{filters}`
  - Sorting via POST with FormData `dlenewssortby`, `dledirection`
- **Manga detail**: Parse `header.page__header h1`, `div.page__poster img`, `div.page__text`
- **Chapter list**: Embedded in detail page via `window.__DATA__` script tag
  - `{ comicId, chapters: [{ id, title, number, date }], xhash }`
- **Chapter pages**: `POST /engine/ajax/controller.php?mod=api&action=reader/getChapterData`
  - JSON body: `{ newsId, chapterId }`
  - Response: `{ data: { images: [...] } }`
- **Protection**: ⚠️ **DleGuardResolver interceptor** — handles anti-bot redirect
  - DLE Guard is a common CMS protection that redirects and sets a cookie
  - Need to reverse-engineer the redirect/cookie flow
- **Difficulty**: Medium — DLE Guard is well-known, usually solvable with cookie handling
- **Notes**: Comics-focused (not manga). Has publisher/genre/year filters.

---

## Madara Base Class Design

ToonGod and Toonily both use WordPress Madara theme. Two variants:

### MadaraNoAjax (ToonGod)
- Chapter list is embedded in the manga detail HTML page
- Search via GET query params
- Simpler — fewer requests needed

### Madara (Toonily)
- Chapter list fetched via AJAX POST to `/{mangaSubString}/{slug}/ajax/chapters/`
- Search via POST to `/wp-admin/admin-ajax.php` with `action=madara_load_more`
- Some chapters may use `#chapter-protector-data` (AES encrypted images)

### Shared HTML Selectors (from MadaraBase.kt)

```
Title:          div.post-title h3, div.post-title h1
Author:         div.author-content > a
Description:    div.description-summary div.summary__content
Thumbnail:      div.summary_image img
Genres:         div.genres-content a
Status:         div.summary-content (last match)
Chapter list:   li.wp-manga-chapter
Chapter link:   a (inside chapter li)
Chapter date:   span.chapter-release-date
Page images:    div.page-break img (data-src, data-lazy-src, srcset, src)
```

### Image URL Resolution (priority order)
1. `data-src`
2. `data-lazy-src`
3. `data-cfsrc`
4. `data-manga-src`
5. `srcset` (pick highest resolution)
6. `src`

### Chapter Protector (Toonily — some chapters)
Some chapters encrypt image URLs with AES:
1. Find `#chapter-protector-data` element
2. Extract Base64 script → decode → get `wpmangaprotectornonce` and `chapter_data`
3. Decrypt AES-CBC with password derived from MD5(password + salt)
4. Result is JSON array of image URLs

**Decision**: Implement basic Madara first. Add protector decryption only if
we encounter protected chapters in practice.

---

## Implementation Plan

### Wave A — Madara Base Class + ToonGod + Toonily ✅
**Priority**: 🔥 Highest (most important sources)
**Result**: Toonily working. ToonGod blocked by Cloudflare (parked).

1. ✅ Created `lib/scraper/sources/madara/index.ts` — base class (328 lines)
2. ✅ Created `lib/scraper/sources/toongod/index.ts` — Madara NoAjax (CF-blocked)
3. ✅ Created `lib/scraper/sources/toonily/index.ts` — Madara Ajax
4. ✅ Registered both in `lib/scraper/index.ts`
5. ✅ 27 tests with real HTML fixtures from Toonily

### Wave B — Weeb Central ✅ (ReadComicsOnline dropped)
**Priority**: 🔥 High (simple HTML, broadens catalog)
**Result**: Weeb Central working. ReadComicsOnline dead (502, ad-farm shell).

1. ✅ Created `lib/scraper/sources/weebcentral/index.ts`
2. ✅ Registered in `lib/scraper/index.ts` (6 sources total)
3. ✅ 16 tests with real HTML fixtures
4. ❌ ReadComicsOnline: site returning 502 on comic pages, home is pure ad JS. Dropped.

### Wave C — Atsumaru ✅
**Priority**: 🟡 Medium (clean API, good catalog)
**Result**: Working. Domain migrated from atsumaru.co (dead) to atsu.moe.

1. ✅ Created `lib/scraper/sources/atsumaru/types.ts` + `index.ts`
2. ✅ Registered in `lib/scraper/index.ts` (7 sources total)
3. ✅ 11 tests with mocked JSON responses
4. Note: atsumaru.co is NXDOMAIN, but atsu.moe has the same API

### Wave D — MangaFire (research spike) ❌ BLOCKED
**Priority**: 🟡 Medium (large catalog but anti-bot)
**Result**: Cloudflare managed challenge on ALL endpoints (403).

1. ✅ Tested API endpoints — all return CF challenge page
2. ✅ Analyzed VrfSigner — fully portable to TypeScript (3-stage encryption,
   hardcoded tables/keys/IVs, deterministic). Ready to implement if CF is removed.
3. ❌ Not implementable server-side without browser. PARKED.

### Wave E — Kagane (research spike) ❌ BLOCKED
**Priority**: 🟡 Medium (good catalog, complex auth)
**Result**: Cloudflare managed challenge (403). Domain is kagane.org.

1. ✅ Tested — CF managed challenge on home page
2. ❌ Not implementable server-side. PARKED.

### Wave F — BatCave (research spike) ❌ BLOCKED
**Priority**: 🟢 Low (comics niche, DLE Guard)
**Result**: Cloudflare managed challenge (403). Domain is batcave.biz.

1. ✅ Tested — CF managed challenge on /comix/, /ComicList/, /search/
2. ❌ Not implementable server-side. PARKED.
3. Note: DLE Guard would have been the challenge, but CF blocks before we even get there.

---

## What We Do NOT Do

- **No browser/Puppeteer/Playwright for scraping** — server-side only, `fetch` + cheerio
- **No Cloudflare bypass** — if a source adds CF, we drop it (or use client-side mode, see below)
- **No cross-source matching** — one manga = one source
- **No image proxying** — direct links to source CDN
- **No chapter protector decryption** (unless actually needed in practice)

## Future: Client-Side Sources

Some sources (e.g. ToonGod) are behind Cloudflare and can't be scraped server-side.
A hybrid architecture could unlock these:

**Concept**: the browser does the fetching, the server only persists data.

```
┌─────────────┐     fetch HTML      ┌──────────────┐
│  User's      │ ──────────────────► │  ToonGod.org │
│  Browser     │ ◄────────────────── │  (CF-protected) │
│              │     HTML + images   └──────────────┘
│  (CF challenge                         
│   solved natively)                     
│              │     parsed data     ┌──────────────┐
│              │ ──────────────────► │  Kaze API    │
└─────────────┘   POST /api/...     │  (persist)   │
                                    └──────────────┘
```

**Key design points**:
- `MangaSource` interface stays the same, but has a `mode: "server" | "client"` flag
- Server sources: fetched by API routes (current behavior)
- Client sources: fetched by browser JS, parsed client-side, results sent to API
- Search: client-side source makes fetch from browser → parses with DOM APIs → renders
- Library/Progress: still server-side (POST parsed manga/chapter data to API)
- Reader: images loaded directly by browser `<img>` (already works this way)
- Needs CORS: most manga sites don't set CORS headers → may need a thin proxy
  for the HTML fetch only, or use the browser's ability to navigate/iframe

**Open questions**:
- CORS is the main blocker — `fetch()` from browser to `toongod.org` may be blocked
- Alternative: browser extension that bypasses CORS (too complex for now)
- Alternative: service worker as proxy (same CORS problem)
- Could work for sites that DO set `Access-Control-Allow-Origin: *`
- Evaluate when we have a concrete use case that justifies the complexity

**Status**: PARKED — interesting idea, revisit when more sources need it.

## Open Questions

- [x] Verify current URLs for all sources → Done. atsumaru.co → atsu.moe, readcomicsonline.li is dead
- [x] MangaFire VrfSigner → Algorithm is public and portable, but site is behind CF
- [x] Kagane integrity token → Can't test, site behind CF
- [x] BatCave DLE Guard → Can't test, site behind CF
- [x] ReadComicsOnline base URL → Site is dead (502, ad-farm)
- [ ] Rate limits — should we add per-source rate limiting to `fetchWithRetry`?

## Summary (2026-08-28)

**4 of 9 target sources implemented and working.**
**5 blocked by Cloudflare** (ToonGod, MangaFire, Kagane, BatCave) **or dead** (ReadComicsOnline).

| Source | Status | Notes |
|--------|--------|-------|
| Toonily | ✅ Working | Madara Ajax, 27 tests |
| Weeb Central | ✅ Working | Custom HTML, 16 tests |
| Atsumaru | ✅ Working | JSON API at atsu.moe, 11 tests |
| OmegaScans | ✅ Already had | HeanCms, 9 tests |
| MangaDex | ✅ Already had | JSON API |
| Comick | ✅ Already had | JSON API + HTML, 6 tests |
| ToonGod | ❌ CF blocked | Config ready, Madara NoAjax |
| MangaFire | ❌ CF blocked | VrfSigner portable, API known |
| Kagane | ❌ CF blocked | API documented in Kotlin source |
| BatCave | ❌ CF blocked | DLE Guard not even reachable |
| ReadComicsOnline | ❌ Dead | 502, ad-farm shell |

The CF-blocked sources are candidates for the future **client-side source** architecture.
