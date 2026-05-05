# Kaze no Manga (風の漫画)

> **Never lose your place in manga again**

Cross-device manga reading tracker — search, read, and track your progress across multiple sources.

## Stack

- **Web**: React Router v7 SSR (Lambda@Edge) — mobile-first PWA
- **API**: AWS AppSync (GraphQL) with JS resolvers
- **Database**: DynamoDB
- **Auth**: Cognito (Google OAuth)
- **Storage**: S3 + CloudFront (manga images)
- **Jobs**: EventBridge + SQS + Lambda (scraping, notifications)
- **IaC**: AWS CDK (TypeScript)

## Monorepo Structure

```
├── packages/
│   ├── brand/        # Design tokens, Tailwind preset, CSS variables, assets
│   ├── models/       # GraphQL schema + generated types
│   └── scraper/      # Multi-source manga scrapers (common interface)
├── apps/
│   └── web/          # React Router v7 — mobile-first PWA
└── aws/
    ├── stacks/       # CDK stacks (auth, api, storage, frontend, jobs)
    ├── resolvers/    # AppSync JS resolvers
    └── functions/    # Lambda handlers (scraper, notifications, telegram-bot)
```

## Getting Started

```bash
npm install
npm run web:dev        # Start web app dev server
npm run aws:synth      # Synthesize CDK stacks
npm run aws:deploy     # Deploy to AWS
```

## Features (MVP)

- 🔍 Search manga across multiple sources (MangaPark, OmegaScans)
- 📖 Vertical scroll reader with infinite chapter loading
- 📚 Personal library with reading status tracking
- ✅ Manual progress tracking (mark chapters as read)
- 🔐 Google OAuth authentication
- 📱 PWA — installable, works offline, push notifications
- 🖼️ Images stored on S3 (not dependent on source availability)

## Architecture

```
CloudFront CDN
├── Lambda@Edge (React Router v7 SSR)
└── S3 (manga images)

AppSync GraphQL API (JS resolvers → DynamoDB)

EventBridge (cron) → SQS → Lambda (scraper)
                                 ↓
                              S3 (images)
```

## Development

```bash
npm run lint           # Check with Biome
npm run lint:fix       # Auto-fix
npm run test           # Run all tests
npm run build          # Build all packages
```

## License

MIT
