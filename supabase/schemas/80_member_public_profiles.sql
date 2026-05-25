-- 공개 회원 프로필 view (CONTEXT.md: Member의 공개 컬럼만 노출).
-- members 테이블은 민감 정보가 섞여 있어 anon에게 직접 열지 않는다.
-- 공개 컬럼만 view로 노출한다.
--
-- security_invoker 옵션은 생략한다: PostgreSQL 기본값이 security_invoker=false
-- (view 소유자 권한으로 실행 = members RLS 우회)라 의도와 동일하고,
-- db diff가 security_invoker 속성을 추적하지 못하는 known-fail도 피한다.
create or replace view public.member_public_profiles as
select
    id,
    username,
    display_name,
    profile_image_url
from public.members;

grant select on public.member_public_profiles to anon;
grant select on public.member_public_profiles to authenticated;
