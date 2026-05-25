-- 쓰기 RPC 공통 가드 (deepening: 로그인+ACTIVE 검사를 한 곳에 모은다).
-- 통과 시 현재 Member id를 반환하고, 아니면 raise. modify_member·create_post·
-- modify_post·delete_post가 모두 이 한 줄로 시작한다.
create or replace function public.require_active_member()
returns bigint
language plpgsql
stable
as $$
declare
    v_member_id bigint;
begin
    v_member_id := public.current_member_id();

    if v_member_id is null then
        raise exception '로그인이 필요합니다.';
    end if;

    if not public.current_user_is_active() then
        raise exception 'ACTIVE 회원만 이용할 수 있습니다.';
    end if;

    return v_member_id;
end;
$$;
