-- S01 pgTAP: Member 자동 프로비저닝 + JWT 인가 미러 + members RLS.
-- auth.uid()/auth.jwt()는 request.jwt.claims GUC를 읽으므로, RLS·헬퍼는
-- set local role + set local request.jwt.claims 로 역할/클레임을 흉내 낸다.

begin;
select plan(16);

-- 테스트용 User 1건 생성 (트리거가 Member를 만들어야 함). superuser 컨텍스트.
insert into auth.users (
    instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at
)
values (
    '00000000-0000-0000-0000-000000000000',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'authenticated', 'authenticated',
    'tester1@test.local',
    '{"name":"Tester One"}'::jsonb,
    now(), now()
);

-- 1. 프로비저닝: User insert가 Member 1건을 만든다.
select is(
    (select count(*)::int from public.members where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    1, 'User insert가 Member 1건을 자동 생성한다');

-- 2. 기본 roles = [MEMBER]
select is(
    (select roles from public.members where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    array['MEMBER']::public.role_type[], '기본 roles는 [MEMBER]');

-- 3. 기본 status = ACTIVE
select is(
    (select status from public.members where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    'ACTIVE'::public.member_status, '기본 status는 ACTIVE');

-- 4. username이 display_name 기반으로 생성된다 (정규화 + uuid 일부).
select alike(
    (select username from public.members where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')::text,
    'testerone%', 'username은 정규화된 display_name + uuid 일부');

-- 5~6. JWT 미러: roles/status 변경이 auth.users.raw_app_meta_data에 반영된다.
update public.members
set roles = array['ADMIN','MEMBER']::public.role_type[], status = 'BLOCKED'
where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

select is(
    (select raw_app_meta_data -> 'roles' from auth.users where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    '["ADMIN","MEMBER"]'::jsonb, 'roles 변경이 app_metadata로 미러링된다');

select is(
    (select raw_app_meta_data ->> 'status' from auth.users where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    'BLOCKED', 'status 변경이 app_metadata로 미러링된다');

-- 7~11. JWT 헬퍼 (claims만 읽음, 역할 전환 불필요).
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","app_metadata":{"member_id":42,"roles":["ADMIN","MEMBER"],"status":"ACTIVE"}}';

select is(public.current_member_id(), 42::bigint, 'current_member_id는 claim의 member_id를 반환');
select is(public.current_user_has_role('ADMIN'), true, 'has_role(ADMIN)=true');
select is(public.current_user_has_role('SYSTEM'), false, 'has_role(SYSTEM)=false');
select is(public.current_user_is_active(), true, 'is_active=true (ACTIVE)');

set local "request.jwt.claims" = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","app_metadata":{"member_id":42,"roles":["MEMBER"],"status":"BLOCKED"}}';
select is(public.current_user_is_active(), false, 'is_active=false (BLOCKED)');

-- 12. RLS: anon은 members를 못 본다.
set local role anon;
set local "request.jwt.claims" = '';
select is(
    (select count(*)::int from public.members where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    0, 'anon은 members를 조회할 수 없다');
reset role;

-- 13~14. RLS: 본인은 자기 행만, 남의 행은 못 본다.
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","app_metadata":{"member_id":42,"roles":["MEMBER"],"status":"ACTIVE"}}';
select is(
    (select count(*)::int from public.members where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    1, '본인은 자기 Member 행을 본다');
select is(
    (select count(*)::int from public.members where auth_user_id <> 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    0, '비-ADMIN은 남의 Member 행을 못 본다');
reset role;

-- 15. RLS: ADMIN은 남의 행도 본다.
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","app_metadata":{"member_id":42,"roles":["ADMIN","MEMBER"],"status":"ACTIVE"}}';
select cmp_ok(
    (select count(*)::int from public.members where auth_user_id <> 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
    '>', 0, 'ADMIN은 남의 Member 행도 본다');
reset role;

-- 16. RLS: authenticated의 직접 insert는 차단된다.
set local role authenticated;
set local "request.jwt.claims" = '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","app_metadata":{"member_id":42,"roles":["MEMBER"],"status":"ACTIVE"}}';
select throws_ok(
    $$ insert into public.members (auth_user_id, username, display_name)
       values (gen_random_uuid(), 'sneaky', 'Sneaky') $$,
    NULL, '직접 members insert는 RLS로 차단된다');
reset role;

select * from finish();
rollback;
