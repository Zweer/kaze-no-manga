import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/**/*.test.ts', 'infra/**/*.test.ts'],
    coverage: {
      provider: 'v8',
    },
  },
});
