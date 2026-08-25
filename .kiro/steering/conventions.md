# Project Conventions

> These conventions will be defined once the project structure is set up.
> Open points in architecture.md need to be resolved first.

## Routes

- Next.js App Router (`app/` directory)
- Route groups, layouts, and server components — TBD

## Server Logic

- React Server Components for data fetching
- Server Actions for mutations
- Route Handlers (`app/api/`) for external integrations

## Components

- Component library: TBD (see architecture open points)
- One component per file, named export

## Database

- Drizzle ORM schema location: TBD
- Migrations in `drizzle/` directory
- Use Neon serverless driver for edge compatibility

## Storage

- Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible API)
- Image strategy: TBD (store vs proxy — see architecture open points)

## Auth

- Solution: TBD (see architecture open points)
