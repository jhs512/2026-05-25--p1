# Cloudflare Pages deploy preparation

Status: ready-for-agent

## Parent

[posts-listing PRD](../PRD.md)

## What to build

Prepare for Cloudflare Pages deployment **without** deploying. Add an SPA fallback so client-side deep links resolve to the app instead of 404ing, verify the production build produces a working static bundle, and document which environment variables Cloudflare Pages must inject (Supabase URL + anon key) at deploy time. No hosted Supabase project and no actual deployment in this slice (per PRD scope).

## Acceptance criteria

- [x] An SPA fallback (`/* -> /index.html 200`) is in place so client-side routes don't 404 on Pages.
- [x] `pnpm build` produces a static bundle that serves the Post listing when previewed locally.
- [x] The required Pages environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are documented for deploy-time injection.
- [x] No hosted Supabase project is created and no deployment is performed (explicitly out of scope).

## Comments

**Done (2026-05-25).** Added `public/_redirects` (`/* /index.html 200`) — confirmed it is emitted to `dist/_redirects` on build. `pnpm build` produces a static bundle; `pnpm preview` at `:4173` serves the listing (5 Cards, newest-first, Pretendard loaded) against the local stack. Cloudflare Pages settings (build command `pnpm build`, output `dist`, root `front`, and the `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` env vars injected at build time) are documented in `front/README.md`. No hosted project created and no deploy performed, per scope.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-post-listing.md)
