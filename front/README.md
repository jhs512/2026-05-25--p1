# front

The SPA for the public Post listing — Vite + React + TypeScript, TanStack Router
(file-based) + TanStack Query, Tailwind v4 + shadcn/ui, Pretendard. Reads Posts
directly from Supabase under the publishable (anon) key; RLS is the auth boundary
(see `../docs/adr/0001-*`). Fully static — deploys to Cloudflare Pages.

## Local development

1. Start the local Supabase stack from the repo root: `supabase start`.
2. Copy `.env.example` to `.env.local` and fill in the values from `supabase status`
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `SUPABASE_SECRET_KEY` for
   integration tests).
3. `pnpm install` then `pnpm dev`.

## Scripts

- `pnpm dev` — Vite dev server.
- `pnpm build` — type-check + production build to `dist/`.
- `pnpm preview` — serve the built `dist/` locally.
- `pnpm test` — fast suite (jsdom, no external deps).
- `pnpm test:integration` — integration suite; requires a running local Supabase
  stack (`supabase start`). See `../docs/adr/0002-testing-strategy.md`.

## Deploying to Cloudflare Pages

The build is static; nothing here is secret beyond the publishable key.

| Setting             | Value                                            |
| ------------------- | ------------------------------------------------ |
| Build command       | `pnpm build`                                     |
| Build output dir    | `dist`                                           |
| Root directory      | `front`                                          |

Set these as Pages environment variables (Production and Preview), injected at
build time — do **not** commit production values:

- `VITE_SUPABASE_URL` — the hosted Supabase project URL.
- `VITE_SUPABASE_ANON_KEY` — the hosted project's publishable (anon) key.

Client-side routing relies on `public/_redirects` (`/* /index.html 200`), which
Cloudflare Pages serves so deep links resolve to the app instead of 404ing.

> A hosted Supabase project and the actual deployment are out of scope for the
> first slice — this documents the wiring so deployment is unblocked later.
