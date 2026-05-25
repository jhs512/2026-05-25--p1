-- JWT 인가 프리미티브 (ADR-0003). auth.jwt()의 app_metadata만 읽는다.
-- 요청 시점에 members 행을 조회하지 않는다.
create or replace function public.current_member_id()
returns bigint
language sql
stable
as $$
    select nullif(
        auth.jwt() -> 'app_metadata' ->> 'member_id',
        ''
    )::bigint;
$$;

create or replace function public.current_user_has_role(p_role text)
returns boolean
language sql
stable
as $$
    select coalesce(
        (auth.jwt() -> 'app_metadata' -> 'roles') ? p_role,
        false
    );
$$;

create or replace function public.current_user_is_active()
returns boolean
language sql
stable
as $$
    select coalesce(
        auth.jwt() -> 'app_metadata' ->> 'status' = 'ACTIVE',
        false
    );
$$;
