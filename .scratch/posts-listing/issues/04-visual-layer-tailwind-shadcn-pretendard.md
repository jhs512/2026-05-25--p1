# Visual layer — Tailwind v4 + shadcn/ui + Pretendard

Status: ready-for-agent

## Parent

[posts-listing PRD](../PRD.md)

## What to build

Apply the visual layer to the listing. Set up Tailwind CSS v4 via its Vite plugin and initialize shadcn/ui (with the shared `@/` path alias used by TanStack Router), rendering the **Post** list with a shadcn component (e.g. Card). Self-host Pretendard as a **variable, dynamic-subset** woff2 served from the app's own origin (Cloudflare Pages edge), with `font-display: swap`, so Korean and Latin text render in Pretendard with lightweight, fast loading and no third-party font CDN.

## Acceptance criteria

- [x] Tailwind v4 is configured via the Vite plugin and utility classes work.
- [x] shadcn/ui is initialized with the `@/` alias; the Post list renders with a shadcn component.
- [x] Pretendard renders for both Korean and Latin text.
- [x] The font is self-hosted (no third-party CDN), variable + dynamic-subset, with `font-display: swap` (text visible during load).
- [x] Only the glyph subsets actually used are fetched (dynamic subset), keeping transfer small.

## Blocked by

- [01 — Walking skeleton](./01-walking-skeleton-post-listing.md)

## Comments

**Done (2026-05-25).** Tailwind v4 wired via `@tailwindcss/vite`; `index.css` is `@import "tailwindcss"` + the shadcn neutral token set (oklch `:root`/`.dark`, `@theme inline`). shadcn configured (since the current CLI is scaffold-oriented and risky on an existing project, set up by hand to the same result): `components.json`, `cn` in `@/lib/utils`, and a `Card` under `@/components/ui`. `PostList` now renders each Post as a Card.

Pretendard self-hosted from the `pretendard` npm package — `pretendardvariable-dynamic-subset.css` imported in `main.tsx`, so Vite bundles the variable woff2 subsets (build emits `PretendardVariable.subset.*.woff2`). 92 `unicode-range` faces, `font-weight: 45 920`, `font-display: swap`; the browser fetches only the subsets whose glyphs render. `--font-sans` in `@theme` makes it the default family.

Verified: `pnpm test` 4/4; `pnpm build` green; browser at `/` shows 5 styled Cards, computed `font-family` resolves to "Pretendard Variable" and `document.fonts.check('16px "Pretendard Variable"')` is true.
