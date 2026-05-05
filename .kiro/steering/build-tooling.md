# Build & Tooling

## Build System

- **tsc** for type-checking and building (`tsc --build` for project references)
- Root-level scripts orchestrate all workspaces
- CDK uses `NodejsFunction` with esbuild bundling for Lambdas

### Root Scripts
```bash
npm run build            # tsc --build (all workspaces)
npm run clean            # tsc --build --clean
npm test                 # pretest → build, test → vitest run, posttest → clean
npm run test:coverage    # same hooks + --coverage
npm run lint             # biome check .
npm run format           # biome format --write .
```

## Linting & Formatting

- **Biome** for linting and formatting (NOT ESLint/Prettier)
- Single quotes, trailing commas, semicolons
- Configuration in `biome.json` at root

## Package Manager

- **npm** with workspaces
- Lock file: `package-lock.json`
- Workspaces: `packages/*`, `apps/*`, `infra`
