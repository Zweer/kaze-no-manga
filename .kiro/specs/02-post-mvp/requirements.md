# Post-MVP Roadmap

## Phase 2 — Smart Tracking & Notifications

- Automatic progress tracking (scroll-based)
- Push notifications (new chapters available)

## Phase 3 — Offline & External Sync

- Offline reading (PWA cache for downloaded chapters)
- External tracker sync (AniList, MAL)

## Phase 4 — Multi-source & Scraper Extensions

- Multiple sources per manga (fallback, preference)
- Scraper extension system (inspired by Mihon's architecture)

## Phase 5 — Telegram Bot

- Telegram bot for notifications and quick actions

## Phase 6 — Recommendations & Community

- Recommendations based on library
- Community features (shared lists, ratings)

## Phase 7 — MCP Server

- MCP server for AI-assisted manga discovery

## Notes

- Mihon inspiration: their extension system is a good model for multi-source
  scraping. We differ in having a backend (S3 storage, shared DB, cross-device sync).
- Architecture decisions in MVP should not block future phases (e.g., manga model
  should support multiple sources even if MVP only uses one).
