# Build & Tooling

## Build System

- **Next.js** built-in (Turbopack for dev, Webpack/Turbopack for production)
- Output: `.next/` directory

## Linting & Formatting

- **Biome** — single tool for lint + format (fast, no config sprawl)
- Runs on pre-commit hook

## Git Hooks

- **Lefthook** — fast, no node deps, simple YAML config
- Pre-commit: Biome check (lint + format)

## Package Manager

- **npm** (no workspaces — single app)
- Exact versions pinned (no `^` or `~`)

## Open Points

- [ ] Turbopack or Webpack for production builds?
