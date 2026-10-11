import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/domain/**'],
      reporter: ['text', 'html', 'json-summary'],
      thresholds: { lines: 95, branches: 90, functions: 100, statements: 95 },
    },
  },
});
