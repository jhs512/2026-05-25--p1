-- Create public.posts: a Post is a unit of user-authored textual content shown
-- in the public listing (see CONTEXT.md). No author or publication status yet.
create table public.posts (
  id          bigint generated always as identity primary key,
  title       text not null,
  content     text,
  created_at  timestamptz not null default now(),
  modified_at timestamptz not null default now()
);

-- RLS is the only authorization boundary for reads (ADR-0001). It is NOT
-- auto-enabled for tables created via SQL, so enable it explicitly.
alter table public.posts enable row level security;

-- Public read: anyone (anon or authenticated) may select Posts. There are no
-- INSERT/UPDATE/DELETE policies, so writes are blocked from the client; writes
-- will go through SQL functions later (ADR-0001).
create policy "Posts are publicly readable"
  on public.posts
  for select
  to anon, authenticated
  using (true);
