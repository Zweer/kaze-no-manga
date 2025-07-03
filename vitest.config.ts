import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Use Vitest's global APIs
    environment: 'node', // Or 'jsdom' if you need browser APIs
    setupFiles: ['./test/setup.ts'], // Path to your global setup file
    include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'], // Test file patterns
  },
});
