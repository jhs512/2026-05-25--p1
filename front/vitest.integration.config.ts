import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'

// Integration suite: runs against a real local Supabase stack (`supabase start`).
// We never mock supabase-js here (ADR-0002). Load ALL env vars (empty prefix) so
// both the publishable (anon) key and the secret (service_role) key are available
// to the tests and to the app's client singleton via import.meta.env.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    test: {
      environment: 'node',
      include: ['src/**/*.integration.test.{ts,tsx}'],
      env,
    },
  }
})
