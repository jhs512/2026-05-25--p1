-- S02 pgTAP: member_public_profiles view + modify_member RPC.

begin;
select plan(13);

-- 테스트용 Member 준비 (트리거가 생성).
insert into auth.users (
    instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at
)
values (
    '00000000-0000-0000-0000-000000000000',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'authenticated', 'authenticated',
    'tester2@test.local',
    '{"name":"Tester Two"}'::jsonb,
    now(), now()
);

-- ── view: 공개 컬럼만 노출 ────────────────────────────────────────────
-- 1. view는 정확히 4개 컬럼.
select is(
    (select count(*)::int from information_schema.columns
     where table_schema='public' and table_name='member_public_profiles'),
    4, 'member_public_profiles는 4개 컬럼만 가진다');

-- 2. 민감 컬럼(roles/status/email/auth_user_id)은 노출되지 않는다.
select is(
    (select count(*)::int from information_schema.columns
     where table_schema='public' and table_name='member_public_profiles'
       and column_name in ('roles','status','email','auth_user_id')),
    0, 'view는 민감 컬럼을 노출하지 않는다');

-- 3. view는 RLS를 우회해 모든 Member의 공개 프로필을 보여준다.
select is(
    (select count(*)::int from public.member_public_profiles),
    (select count(*)::int from public.members),
    'view는 모든 Member의 공개 프로필을 노출한다');

-- ── modify_member: 정상 수정 ──────────────────────────────────────────
select set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'app_metadata', json_build_object(
            'member_id', (select id from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
            'roles', json_build_array('MEMBER'),
            'status', 'ACTIVE'
        )
    )::text,
    true
);

-- 4~6. username/display_name/profile_image_url 수정.
select is(
    (public.modify_member('tester2_new', 'Tester Two Renamed', 'https://img/2.png')).username::text,
    'tester2_new', 'modify_member가 username을 수정한다');
select is(
    (select display_name from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')::text,
    'Tester Two Renamed', 'modify_member가 display_name을 수정한다');
select is(
    (select profile_image_url from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    'https://img/2.png', 'modify_member가 profile_image_url을 수정한다');

-- 7~8. roles/status는 modify_member로 바뀌지 않는다.
select is(
    (select roles from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    array['MEMBER']::public.role_type[], 'modify_member는 roles를 바꾸지 않는다');
select is(
    (select status from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
    'ACTIVE'::public.member_status, 'modify_member는 status를 바꾸지 않는다');

-- ── modify_member: 거부 케이스 ────────────────────────────────────────
-- 9. 비로그인(claims 없음) → 거부.
select set_config('request.jwt.claims', '', true);
select throws_ok(
    $$ select public.modify_member('x', 'x', null) $$,
    'P0001', NULL, '비로그인은 거부된다');

-- 10. BLOCKED → 거부.
select set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'app_metadata', json_build_object(
            'member_id', (select id from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
            'roles', json_build_array('MEMBER'),
            'status', 'BLOCKED'
        )
    )::text,
    true
);
select throws_ok(
    $$ select public.modify_member('x', 'x', null) $$,
    'P0001', NULL, 'BLOCKED 회원은 거부된다');

-- 다시 ACTIVE claims로.
select set_config(
    'request.jwt.claims',
    json_build_object(
        'sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'app_metadata', json_build_object(
            'member_id', (select id from public.members where auth_user_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
            'roles', json_build_array('MEMBER'),
            'status', 'ACTIVE'
        )
    )::text,
    true
);

-- 11. 빈 username → 거부.
select throws_ok(
    $$ select public.modify_member('   ', 'Valid Name', null) $$,
    'P0001', NULL, '빈 username은 거부된다');

-- 12. 50자 초과 username → 거부.
select throws_ok(
    $$ select public.modify_member(repeat('a', 51), 'Valid Name', null) $$,
    'P0001', NULL, '50자 초과 username은 거부된다');

-- 13. 다른 Member가 이미 쓰는 username → unique 위반으로 거부.
-- seed username은 'admin'이 아니라 'admin_<hex>'라, 실제 존재하는 값을 집어온다.
select set_config(
    'test.dupname',
    (select username from public.members
     where auth_user_id <> 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' limit 1),
    true
);
select throws_ok(
    $$ select public.modify_member(current_setting('test.dupname'), 'Valid Name', null) $$,
    '23505', NULL, '중복 username은 거부된다');

select * from finish();
rollback;
