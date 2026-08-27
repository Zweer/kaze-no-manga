# Kaze no Manga (風の漫画)

> **Never lose your place in manga again**

Cross-device manga reading tracker — search, read, and track your progress.

## Features

- 🔍 **Search** — Live search on OmegaScans
- 📖 **Read** — Vertical scroll reader with chapter navigation
- 📚 **Library** — Save manga, filter by status, sort
- 📊 **Progress** — Auto-tracks read chapters, resume where you left off
- 🔐 **Auth** — Google OAuth + Passkey (WebAuthn)
- ⏰ **CRON** — Daily check for new chapters

## Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 7 (strict)
- **Database**: Neon Postgres + Drizzle ORM 1.0
- **Auth**: Better Auth 1.7 (Google + Passkey)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Hosting**: Vercel
- **Testing**: Vitest + Playwright

## Getting Started

```bash
npm install
cp .env.example .env.local  # Fill in your values
npm run db:migrate
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | Biome lint check |
| `npm run lint:fix` | Biome auto-fix |
| `npm test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run db:generate` | Generate DB migration |
| `npm run db:migrate` | Apply migrations |
| `npm run env:pull` | Pull env vars from Vercel |

## License

MIT
