import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      'react-keybound': fileURLToPath(
        new URL('./packages/react-keybound/src/index.ts', import.meta.url),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['packages/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    clearMocks: true,
    globals: true,
  },
});
