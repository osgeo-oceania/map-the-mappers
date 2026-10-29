import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Components under test are .tsx with the automatic JSX runtime.
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: fileURLToPath(new URL('./', import.meta.url)),
      },
    ],
  },
  test: {
    include: ['__tests__/**/*.test.ts'],
    environment: 'node',
  },
})
