# Project Conventions

## Packages

- Workspace packages use `@kaze-no-manga/` scope
- All packages are `private: true` (no NPM publishing)
- Exports via `exports` field in package.json (no build step for internal packages)

## AppSync Resolvers

- JS resolvers in `aws/resolvers/<domain>/<operation>.js`
- Use `@aws-appsync/utils` for DynamoDB operations
- One file per resolver (request + response handlers)

## Lambda Functions

- Handlers in `aws/functions/<name>/index.js`
- Minimal dependencies (bundle with esbuild via CDK NodejsFunction)
- Structured JSON logging

## React (Web)

- React Router v7 file-based routing
- Tailwind CSS v4 with brand preset
- Mobile-first responsive design
- Components in `app/components/`
- Routes in `app/routes/`
