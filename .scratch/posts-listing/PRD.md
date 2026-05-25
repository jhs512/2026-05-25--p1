# PRD: Public Post listing at `/`

Status: ready-for-agent

## Problem Statement

There is no running application yet — only repo scaffolding and domain docs. We need a working, deployable slice that proves the whole pipeline end to end: a browser-only SPA reading real data from Supabase and rendering it, with a local development environment a developer can spin up from scratch. Concretely, a visitor has nowhere to see the **Post**s that exist.

## Solution

A fully client-side SPA (Vite + React + TypeScript, deployed to Cloudflare Pages) whose `/` route lists every **Post** read directly from Supabase under the anon key. A developer can clone the repo, start a local Supabase stack, seed sample Posts, and see them listed locally — with a clear path to deploy the same build to Cloudflare Pages later. This is the first vertical slice; it establishes the stack, the data-access pattern, the security boundary, and the testing approach for everything that follows.

## User Stories

1. As a visitor, I want to see a list of all Posts at `/`, so that I can browse the content that exists.
2. As a visitor, I want each Post in the list to show its title, so that I can tell Posts apart at a glance.
3. As a visitor, I want each Post to show a preview of its body, so that I get a sense of the content before reading more.
4. As a visitor, I want each Post to show when it was created, so that I can see how recent it is.
5. As a visitor, I want the newest Posts shown first, so that fresh content is easy to find.
6. As a visitor, I want a clear loading indication while Posts are being fetched, so that I know the page is working.
7. As a visitor, I want a friendly empty state when there are no Posts, so that I don't mistake an empty list for a broken page.
8. As a visitor, I want a clear error state if Posts fail to load, so that I understand something went wrong rather than seeing a blank screen.
9. As a visitor, I want the page text rendered in Pretendard with fast, lightweight font loading, so that Korean and Latin text looks right without slowing the page.
10. As a visitor on a slow connection, I want text to remain visible while the font loads, so that I'm never staring at invisible text.
11. As a developer, I want to start a local Supabase stack with the CLI, so that I can develop against a real database without a hosted project.
12. As a developer, I want a migration that creates `public.posts` with Row Level Security enabled and a public read policy, so that the security boundary is defined in version control.
13. As a developer, I want sample Posts loaded via seed, so that the listing has data to show immediately after a fresh start.
14. As a developer, I want the SPA configured by environment variables for the Supabase URL and anon key, so that the same build runs locally and against a hosted project later.
15. As a developer, I want a committed env example file, so that I know which variables to set without leaking secrets.
16. As a developer, I want a single Supabase client used across the app, so that configuration lives in one place.
17. As a developer, I want Post reads encapsulated behind a small data-access module, so that components don't construct queries directly and the read logic is testable.
18. As a developer, I want data fetched through TanStack Query, so that caching, loading, and error states are handled consistently.
19. As a developer, I want file-based routing with TanStack Router, so that adding routes later is just adding files.
20. As a developer, I want a fast test suite I can run on every save without external dependencies, so that my feedback loop stays tight.
21. As a developer, I want an integration test suite that runs against the local Supabase stack, so that the real RLS boundary and real queries are verified.
22. As a developer, I want a test proving anon can read Posts but cannot create, update, or delete them, so that the security boundary can't silently regress.
23. As a developer, I want component tests covering the listing's loading, empty, error, and data states, so that the UI contract is locked.
24. As a developer, I want a Cloudflare Pages SPA fallback configured, so that deep links resolve to the app instead of 404ing.
25. As a future developer, I want the deliberate testing deferrals (no supabase-js mocks, no pgTAP yet, no E2E yet) recorded, so that I don't "helpfully" reintroduce brittle or premature tests.

## Implementation Decisions

**Repo structure**
- Root holds `front/` (a standalone pnpm project — the SPA) and `supabase/` (Supabase CLI artifacts: config, migrations, seed). No workspace/monorepo tooling; `front/` is the only Node project.

**Frontend stack**
- Vite + React + TypeScript.
- TanStack Router, file-based routing (`@tanstack/router-plugin`, generated route tree). The listing lives at the `/` route.
- TanStack Query + `supabase-js` for data fetching (caching, loading/error states).
- Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui for components. A `@/` path alias is configured once (tsconfig + Vite) and shared by Router and shadcn.
- Pretendard font, self-hosted **variable + dynamic-subset** woff2, served from the same origin (Cloudflare Pages edge), with `font-display: swap`. No third-party font CDN.

**Data access architecture** (per ADR-0001)
- Reads are client-direct via `supabase-js`, authorized solely by an RLS `SELECT` policy.
- Writes (create/update/delete) are out of scope here; the agreed pattern is Postgres SQL functions (RPC), implemented later once a User concept exists.
- The anon key is public by design and injected via `VITE_`-prefixed env vars; production values are injected by Cloudflare Pages at deploy time. Local development uses the CLI's local URL and anon key.

**Modules**
- **DB schema (A)** — a migration creating `public.posts`, explicitly enabling Row Level Security, and adding a single `SELECT` policy for `anon`/`authenticated`. No write policies. Plus a `seed.sql` with sample Korean Posts.
- **Supabase client (B)** — a single client instance built from env vars; shallow glue.
- **Post data-access (C)** — a small, deep module encapsulating the Post read (column selection, ordering by creation time newest-first, row→Post mapping) and exposing TanStack Query options. The only place queries are constructed.
- **Listing route (D)** — the `/` route rendering loading, empty, error, and data states using shadcn components.
- **App shell (E)** — router, `QueryClientProvider`, Tailwind/font bootstrap; shallow wiring.

**`public.posts` schema**

```
id           bigint generated always as identity primary key
title        text not null
content      text
created_at   timestamptz not null default now()
modified_at  timestamptz not null default now()
```

- Timestamp columns are named `created_at` and `modified_at` (canonical; `modified_at` is used in place of the conventional `updated_at`).
- `modified_at` auto-update on row change is deferred — no client writes exist yet, so it changes only via seed/migration. A trigger will be added when editing arrives.
- A **Post** currently has no author and no draft/published status (see CONTEXT.md); those arrive with a User concept.

## Testing Decisions

**What makes a good test here**: it proves something real about external behavior, not the shape of a mock. We **never mock `supabase-js`** — mocking its fluent builder verifies only the mock. We mock only at our own seam (the Post data-access module) for UI tests. (See ADR-0002.)

**Two suites, split by dependency**
- `fast` — jsdom, no external deps; runs on every save and in CI.
- `integration` — requires a running local Supabase stack (`supabase start`); runs locally now. An integration CI job is deferred.

**Modules tested**
- **Post data-access (C)** — integration test against the local stack with seeded data: returns the seeded Posts, newest first, with the expected shape. (No mock-based unit test, since we don't mock the client.)
- **RLS boundary (A)** — integration test using a real anon client and a `service_role` client (latter for setup/teardown): anon `SELECT` succeeds; anon `INSERT`/`UPDATE`/`DELETE` are rejected.
- **Listing route (D)** — component tests (fast suite) mocking the data-access module, asserting the loading, empty, error, and data states render correctly.
- **Not tested directly**: the Supabase client (B) and app shell (E) are shallow wiring.

**Prior art**: none — this slice establishes the patterns (Vitest fast vs integration split, anon/service_role integration tests, component tests mocking the data-access seam) that later work will follow.

## Out of Scope

- Creating, updating, or deleting Posts (and the SQL/RPC functions that will back them).
- Any authentication / User concept, Post authorship, or draft/published lifecycle.
- A hosted (production) Supabase project and the actual Cloudflare Pages deployment — local development only; prod is wired at deploy time. The SPA fallback config is included so deployment is unblocked later.
- pgTAP database tests (arrive with the first SQL write function).
- E2E / Playwright tests (arrive with the first multi-step user flow).
- Integration tests in CI (deferred until they earn their setup cost).
- Pagination, search, filtering, sorting controls, and individual Post detail pages.
- `modified_at` auto-update trigger.

## Further Notes

- This is the first vertical slice; its real value is establishing the stack, the read-direct/RLS pattern (ADR-0001), and the testing approach (ADR-0002) for everything after.
- Domain vocabulary follows CONTEXT.md — the entity is a **Post** (avoid "Article", "Entry", "Document").
- A manual smoke (run the app, confirm Posts render) substitutes for automated E2E for this slice.
