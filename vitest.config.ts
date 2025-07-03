import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',

        'drizzle.config.ts',
        'eslint.config.mjs',
        'next-env.d.ts',
        'next.config.ts',
        'instrumentation.ts',
        '.next',
        'components/ui',
        'lib/db/index.ts',
        'lib/log.ts',
        'test/**/*',
        'e2e/**/*',
      ],
    },
  },
});
