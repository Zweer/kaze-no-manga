# Build & Tooling

## Build System

- **Next.js** built-in (Turbopack for dev, Webpack/Turbopack for production)
- Output: `.next/` directory

## Linting & Formatting

> TBD — decide before first code is written.

Options to evaluate:
- **Biome** (used before — fast, single tool)
- **ESLint + Prettier** (Next.js default, larger ecosystem)

## Git Hooks

> TBD — decide with linting.

Options:
- **Lefthook** (used before — fast, no node deps)
- **Husky + lint-staged** (more common in Next.js ecosystem)

## Package Manager

- **npm** (no workspaces — single app)
- Exact versions pinned (no `^` or `~`)

## Open Points

- [ ] Linting: Biome or ESLint?
- [ ] Git hooks: Lefthook or Husky?
- [ ] Turbopack or Webpack for production builds?
