# Project Conventions

## Routes

- TanStack Router file-based routing in `src/routes/`
- Layout routes use underscore prefix: `_authed.tsx`
- Dynamic params use dollar sign: `manga.$id.tsx`
- API/server routes in `src/routes/api/`

## Server Functions

- Defined in `src/server/functions/` grouped by domain
- Use `createServerFn` from `@tanstack/react-start`
- Always validate input with `.inputValidator()`
- Auth middleware applied via `.middleware()`

## Components

- shadcn/ui components in `src/components/ui/`
- Custom components in `src/components/`
- One component per file, named export

## Database

- Drizzle ORM schema in `src/lib/db/schema.ts`
- Migrations in `drizzle/migrations/`
- Use Neon serverless driver for edge compatibility

## Storage

- Cloudflare R2 via `@aws-sdk/client-s3` (S3-compatible API)
- Helpers in `src/lib/storage.ts`
- Public bucket for serving manga images directly

## Auth

- Better Auth config in `src/lib/auth.ts`
- Client-side auth in `src/lib/auth-client.ts`
- API route handler in `src/routes/api/auth.$.ts`
