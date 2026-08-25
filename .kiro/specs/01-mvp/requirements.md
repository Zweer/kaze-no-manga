# MVP Requirements

## Vision

Kaze no Manga is a **reader + tracker in one** — search manga, read chapters, track progress across devices.

## Philosophy: Slow & Solid

The MVP is delivered in **waves** — small, focused increments. Each wave is:

- **Complete**: shippable, usable, tested
- **Curated**: not "it works" but "it's nice to use"
- **Covered**: 100% test coverage (unit + E2E) for what it introduces

We don't rush to "feature complete". We build one thing at a time, make it great, then move on.

## Core Flow (end state)

```
Search → Manga Detail → Add to Library → Read Chapter → Track Progress
                                                              ↓
                                          CRON checks for new chapters daily
```

## Wave Overview

| Wave | Name | Focus |
|------|------|-------|
| 0 | Bootstrap | Infra, DB reset, auth, deploy pipeline |
| 1 | Shell | Layout, nav, theme — all mockato |
| 2 | Search (backend) | Scraper + API |
| 3 | Search (frontend) | UI collegata al backend |
| 4 | Manga detail | Pagina dettaglio + lista capitoli |
| 5 | Library (base) | Add/remove manga, lista piatta |
| 6 | Library (advanced) | Stati, filtri, ordinamento, badge |
| 7 | Reader (core) | Vertical scroll, immagini, singolo capitolo |
| 8 | Reader (navigation) | Prev/next, transizioni |
| 9 | Progress | Auto-mark read, resume, sync |
| 10 | CRON & polish | Job nuovi capitoli, rifinitura |

## Technical Constraints

- Single source per manga (OmegaScans) for MVP
- Images linked from source (no storage, no proxy)
- Online-only (no PWA/offline)
- No push notifications
- Manual progress only (no scroll-based tracking)

## Success Criteria (end of all waves)

- User signs in with Google
- User searches manga on OmegaScans
- User adds manga to library with status
- User reads chapters (images from source)
- Chapters marked as read automatically
- Progress syncs across devices
- CRON detects new chapters daily
- Deployed on Vercel
- 100% test coverage maintained across all waves

## Non-Goals (for MVP)

- Multiple sources per manga
- External tracker sync (AniList, MAL)
- Community features
- Recommendations/discovery
- Offline reading / PWA cache
- Push notifications
- Image storage (R2/proxy)
