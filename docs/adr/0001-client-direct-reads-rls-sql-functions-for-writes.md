---
status: accepted
---

# Client-direct reads under RLS; writes go through SQL functions

The app is a fully static SPA (Vite → Cloudflare Pages) with no application backend, so the browser talks to Supabase directly under the anon key. We split data access by operation: **reads** are direct table queries via `supabase-js`, authorized solely by a Postgres **Row Level Security** `SELECT` policy; **writes (create/update/delete)** are never direct table DML — they go through Postgres **SQL functions** invoked as RPC, which encapsulate validation and run with elevated privilege.

## Considered options

- **Edge API layer** (Cloudflare Workers / Supabase Edge Functions) in front of the database — rejected for now: adds a deployment surface and cost that a read-only public listing does not justify.
- **Direct table DML from the client for writes** — rejected: exposing `INSERT/UPDATE/DELETE` to the anon key makes write rules live in scattered RLS policies instead of one auditable function, and is hard to validate.

## Consequences

- **RLS is the only authorization boundary for reads.** A table without `ENABLE ROW LEVEL SECURITY` + an explicit `SELECT` policy is a hole. Migrations must enable RLS explicitly (it is *not* auto-enabled for tables created via SQL).
- **The anon key is public by design** and shipped in the SPA bundle; it grants nothing beyond what RLS policies and `GRANT EXECUTE`d functions allow.
- **Write functions will be `SECURITY DEFINER`** to perform privileged writes; that means each one must pin `search_path` and do its own authorization checks internally, since it bypasses RLS.
- **Scope today:** only reads (`public.posts` listing at `/`) are implemented; sample data is loaded via `seed.sql`. The write-function pattern is recorded here but implemented later, once a **User** concept exists to authorize against.
