# Build & Tooling

## Build System

- **Vite** for dev server and production builds (via TanStack Start plugin)
- **Nitro** as the server runtime (configured automatically by TanStack Start)
- Output: `.output/` directory with server + client bundles

### Scripts
```bash
npm run dev          # Vite dev server on :3000
npm run build        # Production build → .output/
npm run start        # Start production server locally
npm run lint         # biome check .
npm run lint:fix     # biome check --write .
npm run db:generate  # Drizzle Kit generate migrations
npm run db:migrate   # Drizzle Kit run migrations
npm run db:studio    # Drizzle Kit Studio (DB browser)
```

## Linting & Formatting

- **Biome** for linting and formatting (NOT ESLint/Prettier)
- Single quotes, trailing commas, semicolons
- Configuration in `biome.json` at root
- Import organization via Biome assist

## Git Hooks

- **Lefthook** for pre-commit hooks
- Pre-commit: biome check, lockfile-lint, sort-package-json, tsc --noEmit

## Package Manager

- **npm** (no workspaces — single app)
- Lock file: `package-lock.json`
- Exact versions pinned (no `^` or `~`)
