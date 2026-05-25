-- posts RLS (ADR-0001, ADR-0004).
-- 테이블 RLS: PUBLIC은 누구나, 본인 글은 작성자, 전체는 ADMIN.
-- UNLISTED는 테이블 RLS에서 직접 열지 않는다 — 단건 조회는 get_post가 담당.
alter table public.posts enable row level security;

create policy "posts_select_policy"
on public.posts
for select
using (
    visibility = 'PUBLIC'
    or author_id = public.current_member_id()
    or public.current_user_has_role('ADMIN')
);

-- 직접 CUD 금지 (쓰기는 create_post/modify_post/delete_post 함수만 — S04).
create policy "posts_insert_blocked"
on public.posts
for insert
with check (false);

create policy "posts_update_blocked"
on public.posts
for update
using (false)
with check (false);

create policy "posts_delete_blocked"
on public.posts
for delete
using (false);

grant select on public.posts to anon;
grant select on public.posts to authenticated;
