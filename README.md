# Kaze no Manga (風の漫画)

> **Never lose your place in manga again**

Cross-device manga reading tracker — search, read, and track your progress.

## Stack

- **Framework**: TanStack Start (SSR, file-based routing, server functions)
- **Auth**: Better Auth (Google OAuth)
- **Database**: Neon Postgres + Drizzle ORM
- **Storage**: Cloudflare R2 (manga images, zero egress)
- **UI**: shadcn/ui + Tailwind CSS 4
- **Hosting**: Vercel
- **Jobs**: Vercel Cron

## Project Structure

```
src/
├── routes/         # File-based routing (TanStack Router)
├── components/     # UI components (shadcn/ui + custom)
├── lib/            # Business logic (auth, db, scraper, storage)
├── server/         # Server functions (type-safe RPC)
└── styles/         # Tailwind CSS
```

## Getting Started

```bash
npm install
npm run dev          # Start dev server on http://localhost:3000
```

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Biome check
npm run lint:fix     # Biome auto-fix
npm run test         # Vitest
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run migrations
npm run db:studio    # Open Drizzle Studio
```

## License

MIT
