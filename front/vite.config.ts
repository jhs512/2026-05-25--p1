import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Router plugin must come before the React plugin.
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    // `fast` suite: jsdom, no external deps. Integration tests (which need a
    // running local Supabase stack) live in *.integration.test.* and are
    // excluded here — they run via `pnpm test:integration` (see ADR-0002).
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.integration.test.*', '**/e2e/**'],
  },
})
