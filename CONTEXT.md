# p1

A fully client-side SPA that reads content directly from Supabase and renders it for the public. There is no application backend; the browser talks to Supabase under the anon key, with Row Level Security as the only authorization boundary.

## Language

**Post**:
A unit of user-authored textual content shown in the public listing. Currently a Post has only a title, body, and timestamps — there is no author or publication-status concept yet, because no User exists to attach them to.
_Avoid_: Article, Entry, Document

## Flagged ambiguities

- **Author / publication status** — not modeled. A Post has no owner and no draft/published lifecycle until a **User** concept is introduced. Until then, every Post is implicitly public and unowned.

## Example dialogue

> **Dev**: The listing at `/` shows every Post — should it hide drafts?
> **Domain expert**: There are no drafts yet. A Post exists or it doesn't, and if it exists it's public. We'll only get a draft/published split once people can sign in and own their Posts.
> **Dev**: So right now a Post is just title + body + when it was created and last changed?
> **Domain expert**: Right. Authorship comes with Users, later.
