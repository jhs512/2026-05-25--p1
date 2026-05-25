# CLAUDE.md

## Standard workflow

Features normally move through these skills in order:

1. `/grill-with-docs` — interrogate the plan; resolve domain terms into `CONTEXT.md` and decisions into `docs/adr/`.
2. `/to-prd` — turn the grilled context into a PRD on the issue tracker.
3. `/to-issues` — break the PRD into independently-grabbable tracer-bullet issues.
4. `/tdd` **or** `/diagnose` — build features test-first, or run the diagnosis loop for hard bugs/regressions.
5. `/improve-codebase-architecture` — find refactoring/deepening opportunities once the work lands.

## Agent skills

### Issue tracker

Issues and PRDs live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles using their default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
