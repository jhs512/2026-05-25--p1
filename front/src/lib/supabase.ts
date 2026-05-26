import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// The anon key is public by design and shipped in the bundle; RLS is the
// authorization boundary (ADR-0001). Values come from VITE_-prefixed env vars
// (local stack in dev, Cloudflare Pages injection in prod).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — see .env.example',
  )
}

// Typed with the generated Database schema so every .rpc()/.from() call is checked
// against the live Postgres types (regenerate via `supabase gen types typescript`).
export const supabase = createClient<Database>(url, anonKey)
