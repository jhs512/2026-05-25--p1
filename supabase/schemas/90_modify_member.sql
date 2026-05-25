-- 회원 수정 RPC (ADR-0001: 쓰기는 SECURITY DEFINER 함수).
-- 사용자가 수정 가능한 필드: username, display_name, profile_image_url.
-- roles, status, auth_user_id, email은 이 함수로 수정하지 않는다.
create or replace function public.modify_member(
    p_username varchar,
    p_display_name varchar,
    p_profile_image_url text default null
)
returns public.members
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    v_member_id bigint;
    v_member public.members;
begin
    v_member_id := public.require_active_member();

    if nullif(trim(p_username), '') is null then
        raise exception 'username은 필수입니다.';
    end if;

    if length(trim(p_username)) > 50 then
        raise exception 'username은 50자를 넘을 수 없습니다.';
    end if;

    if nullif(trim(p_display_name), '') is null then
        raise exception 'display_name은 필수입니다.';
    end if;

    if length(trim(p_display_name)) > 50 then
        raise exception 'display_name은 50자를 넘을 수 없습니다.';
    end if;

    update public.members
    set
        username = trim(p_username),
        display_name = trim(p_display_name),
        profile_image_url = p_profile_image_url
    where id = v_member_id
      and status = 'ACTIVE'
    returning * into v_member;

    if not found then
        raise exception '수정할 수 있는 회원 정보가 없습니다.';
    end if;

    return v_member;
end;
$$;

grant execute on function public.modify_member(varchar, varchar, text) to authenticated;
