---
status: accepted
---

# Testing strategy: don't mock supabase-js; test each concern at the level that proves it

Because the app talks to Supabase directly (see [ADR-0001](./0001-client-direct-reads-rls-sql-functions-for-writes.md)), most data code is thin glue around a remote service. We test each concern at the level where the test proves something real, and we **never mock `supabase-js`** — mocking its fluent query builder (`.from().select().order()`) only verifies that the mock returns what we told it to, not that the query or RLS behaves.

## Decisions

- **Mock only at our own seam.** UI/component tests mock the data-access module (e.g. `fetchPosts`), not `supabase-js`. The seam we own is stable; the client's builder is not.
- **RLS is the security boundary, so it is tested for real.** JS integration tests (Vitest) hit the local stack with a real anon key and assert: anon can `SELECT`; anon's `INSERT/UPDATE/DELETE` are rejected. A `service_role` client is used only for setup/teardown. This exercises the exact PostgREST + JWT + RLS path the SPA uses.
- **Two suites, split by dependency.** `fast` (jsdom, no external deps — unit + component) runs on every save and in CI. `integration` (needs `supabase start`) runs locally now; an integration CI job is deferred until it earns its setup cost.

## Considered options / deliberate deferrals

- **pgTAP (`supabase test db`) — deferred.** Worth it for the *internal* logic of the CUD SQL functions, which don't exist yet (ADR-0001). Introduce it alongside the first write function, not before.
- **E2E (Playwright) — deferred.** integration + component already cover the read-only listing end to end; E2E only adds build/env-wiring fidelity, caught for now by a manual smoke. Introduce it with the first real multi-step user flow (auth, create-post).

## Consequences

- A future engineer should **not** "fix" the absence of supabase-js mock unit tests, pgTAP, or E2E — each is a deliberate, dated deferral, not an oversight.
- The `integration` suite requires the local Supabase stack; developers run `supabase start` before it. The fast suite never does.
