-- members RLS (ADR-0001: 읽기는 RLS, 직접 쓰기는 차단).
alter table public.members enable row level security;

-- 본인 또는 ADMIN만 조회 가능.
create policy "members_select_self_or_admin"
on public.members
for select
using (
    auth.uid() = auth_user_id
    or public.current_user_has_role('ADMIN')
);

-- 직접 insert 금지 (프로비저닝은 handle_new_user 트리거만).
create policy "members_insert_blocked"
on public.members
for insert
with check (false);

-- 직접 update 금지 (회원 수정은 modify_member 함수만 — 후속 슬라이스).
create policy "members_update_blocked"
on public.members
for update
using (false)
with check (false);

-- 직접 delete 금지.
create policy "members_delete_blocked"
on public.members
for delete
using (false);

grant usage on schema public to anon;
grant usage on schema public to authenticated;

grant select on public.members to authenticated;
