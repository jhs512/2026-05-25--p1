import { createClient } from '@supabase/supabase-js'

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

export const supabase = createClient(url, anonKey)
