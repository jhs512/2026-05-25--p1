-- Member -> JWT app_metadata 미러링 (ADR-0003).
-- roles·username·display_name·status 변경 시 해당 User의 raw_app_meta_data로
-- 동기화한다. 인가는 이 미러를 통해 JWT만으로 결정된다.
create or replace function public.sync_member_metadata_to_auth()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
begin
    update auth.users
    set raw_app_meta_data =
        coalesce(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object(
            'member_id', new.id,
            'roles', new.roles,
            'username', new.username,
            'display_name', new.display_name,
            'status', new.status
        )
    where id = new.auth_user_id;

    return new;
end;
$$;

create trigger trg_sync_member_metadata_to_auth
after insert or update of
    roles,
    username,
    display_name,
    status
on public.members
for each row
execute function public.sync_member_metadata_to_auth();
