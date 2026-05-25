# Walking skeleton — Post listing at `/`, end to end

Status: ready-for-agent

## Parent

[posts-listing PRD](../PRD.md)

## What to build

A walking skeleton that renders every **Post** at the `/` route, end to end, from a local Supabase stack — the foundational tracer bullet every other slice builds on.

Scaffold the standalone `front` SPA (Vite + React + TypeScript) with file-based TanStack Router (the `/` route) and TanStack Query. Initialize the local Supabase project and add a migration that creates `public.posts` (schema below) with Row Level Security **explicitly enabled** and a single public `SELECT` policy for `anon`/`authenticated` — no write policies (per ADR-0001). Add seed data with a handful of sample Korean Posts. Build a single env-configured `supabase-js` client and a small Post data-access module that reads Posts newest-first; the `/` route fetches through TanStack Query and renders each Post's title, body, and creation time — unstyled is fine. Establish the `fast` (jsdom) Vitest suite with one component test covering the data state. Commit a `.env.example`.

Schema for `public.posts`:

```
id           bigint generated always as identity primary key
title        text not null
content      text
created_at   timestamptz not null default now()
modified_at  timestamptz not null default now()
```

## Acceptance criteria

- [x] `supabase start` brings up a local stack; the migration creates `public.posts` with the schema above, RLS explicitly enabled, and a public `SELECT` policy — and no INSERT/UPDATE/DELETE policies.
- [x] Seed loads sample Korean Posts on a fresh `supabase db reset`.
- [x] With env vars from the local stack, `pnpm dev` serves `/` showing seeded Post titles, body, and creation time, newest first.
- [x] Posts are read only through the data-access module — no inline queries in components — via `supabase-js` + TanStack Query.
- [x] `.env.example` documents `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; real values live in a gitignored `.env.local`.
- [x] `pnpm test` runs the `fast` suite (jsdom, no external deps) and includes a component test asserting the data state renders seeded Posts.
- [x] The domain term **Post** is used throughout (not "Article"/"Entry"/"Document").

## Blocked by

None - can start immediately.

## Comments

**Done (TDD, 2026-05-25).** Scaffolded `front/` (Vite + React + TS), file-based TanStack Router (`/`), TanStack Query + `supabase-js`, env-based client singleton. `supabase init` + migration (`posts` + RLS + public SELECT, no write policies) + `seed.sql` (5 Korean Posts). Data-access module maps DB rows → camelCase `Post` and orders newest-first. RED→GREEN on one fast component test (`PostsPage` renders Posts via a mocked data-access seam — never `supabase-js`, per ADR-0002).

Verified end-to-end: REST query under the publishable (anon) key returns 5 Posts newest-first (proves migration + seed + RLS read + ordering); browser smoke at `/` renders all 5 with no console errors; `pnpm test` green; `pnpm build` green.

Note: the local Supabase CLI uses the new key format — `sb_publishable_*` is the client key (carries the `anon` role for RLS); `sb_secret_*` replaces `service_role` (needed by issue 02).
