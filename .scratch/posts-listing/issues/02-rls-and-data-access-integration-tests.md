# RLS boundary + data-access integration tests

Status: ready-for-agent

## Parent

[posts-listing PRD](../PRD.md)

## What to build

An `integration` test suite that proves the security boundary and read behavior against a **real** local Supabase stack — never mocking `supabase-js` (per ADR-0002).

Stand up the `integration` Vitest suite, separate from the `fast` suite, that requires `supabase start`. Using a real anon client and a `service_role` client (the latter only for setup/teardown), assert that an anon client can read **Post**s but cannot create, update, or delete them, and that the data-access module returns seeded Posts newest-first with the expected shape. This exercises the exact PostgREST + JWT + RLS path the SPA uses.

## Acceptance criteria

- [x] `pnpm test:integration` runs a suite separate from the `fast` suite and targets the running local stack.
- [x] A test asserts an anon client can `SELECT` Posts.
- [x] Tests assert an anon client's `INSERT`, `UPDATE`, and `DELETE` on `posts` are each rejected by RLS.
- [x] A test asserts the data-access module returns seeded Posts ordered newest-first, with `title`, `content`, `created_at`, and `modified_at` present.
- [x] No `supabase-js` mocks are introduced; `service_role` is used only for setup/teardown.
- [x] The integration suite is intentionally not wired into CI yet, and this deferral is noted (per ADR-0002).

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-post-listing.md)

## Comments

**Done (2026-05-25).** Added a dedicated `integration` Vitest suite (`vitest.integration.config.ts`, node env, includes only `*.integration.test.*`, loads all env via Vite `loadEnv` so both the publishable and secret keys reach the tests). `pnpm test:integration` runs 5 tests; `pnpm test` (fast) stays isolated at 1.

Tests: anon `SELECT` succeeds; anon `INSERT` returns an RLS error; anon `UPDATE`/`DELETE` have no effect (re-read via the secret-key admin client confirms the row is unchanged / still present); `fetchPosts()` returns Posts newest-first in the camelCase shape. No `supabase-js` mocks; the secret (`sb_secret_*`, service_role) client is used only for fixture setup/teardown. CI wiring intentionally deferred (ADR-0002).
