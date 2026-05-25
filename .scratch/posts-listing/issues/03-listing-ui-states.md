# Listing UI states — loading / empty / error

Status: ready-for-agent

## Parent

[posts-listing PRD](../PRD.md)

## What to build

Complete the listing's UI state contract. Beyond the data state from the skeleton, the `/` route should render a loading indication while **Post**s are fetched, a friendly empty state when there are no Posts, and a clear error state when the fetch fails — so a visitor never sees a blank or broken-looking page. Add `fast`-suite component tests covering all four states (loading, empty, error, data) by mocking the Post data-access seam — not `supabase-js` (per ADR-0002).

## Acceptance criteria

- [x] `/` shows a loading indication while Posts are being fetched.
- [x] `/` shows a friendly empty state when there are zero Posts.
- [x] `/` shows a clear error state when the fetch fails.
- [x] Component tests in the `fast` suite cover the loading, empty, error, and data states, mocking the data-access module.
- [x] No state renders a blank screen; text stays visible throughout.

## Comments

**Done (2026-05-25).** `PostsPage` now branches on `useQuery`'s `isPending` → `role="status"` loading text, `isError` → `role="alert"` error text, `data.length === 0` → empty message, else the `PostList`. Four `fast`-suite component tests cover each state, mocking the `posts-data` seam (never supabase-js): loading via a never-resolving promise, empty via `[]`, error via a rejected promise (`retry: false`), data via sample Posts. `pnpm test` → 4/4 green.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-post-listing.md)
