# Architecture

## Overview

Kaze no Manga is a monorepo with npm workspaces. All code lives in a single repository.

## Structure

```
packages/   → Shared libraries (brand, models, scraper)
apps/       → Deployable apps with UI (web)
infra/      → AWS CDK infrastructure + resolvers + Lambda functions
```

## Stack

- **Web**: React Router v7 SSR on Lambda@Edge — mobile-first PWA
- **API**: AWS AppSync with JavaScript resolvers → DynamoDB
- **Database**: DynamoDB (single-table design)
- **Auth**: AWS Cognito (Google OAuth)
- **Storage**: S3 + CloudFront (manga images)
- **Jobs**: EventBridge + SQS + Lambda (scraping, notifications)
- **IaC**: AWS CDK (TypeScript)

## DynamoDB Access Patterns

Single-table design with pk/sk + GSI:

| Entity | pk | sk | gsi1pk | gsi1sk |
|--------|----|----|--------|--------|
| Manga | `MANGA#<id>` | `MANGA#<id>` | `MANGA#STATUS#<status>` | `<title>` |
| Chapter | `MANGA#<mangaId>` | `CHAPTER#<number>` | — | — |
| User | `USER#<userId>` | `PROFILE` | `USER#EMAIL` | `<email>` |
| Library | `USER#<userId>` | `LIBRARY#<mangaId>` | `MANGA#<mangaId>` | `USER#<userId>` |
| History | `USER#<userId>` | `HISTORY#<timestamp>` | — | — |

## Dependency Flow

```
brand (tokens, tailwind)
  ↓
models (GraphQL schema, types)
  ↓
scraper (manga sources)
  ↓
infra (CDK stacks, resolvers, Lambda functions)
  ↓
web (React Router v7 PWA)
```

## Key Decisions

- **Monorepo** over multi-repo: atomic changes, shared tooling, single CI
- **DynamoDB** over RDS: free tier, serverless, no cold starts for AppSync direct resolvers
- **AppSync JS resolvers** over Lambda resolvers: lower latency for CRUD, no cold starts
- **PWA** over native mobile: single codebase, installable, push notifications
- **React Router v7** over Next.js: no Vercel lock-in, Lambda@Edge SSR, full AWS control
