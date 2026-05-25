-- S04 pgTAP: create_post / modify_post / delete_post.
-- 모두 SECURITY DEFINER라 claims만으로 분기한다(role 전환 불필요).
-- current_member_id()는 app_metadata.member_id를 읽으므로 sub는 임의여도 된다.

begin;
select plan(15);

select set_config('test.u1_mid', (select id::text from public.members where email='user1@no-reply.com'), true);
select set_config('test.u2_mid', (select id::text from public.members where email='user2@no-reply.com'), true);
select set_config('test.ad_mid', (select id::text from public.members where email='admin@no-reply.com'), true);

-- claims 설정 헬퍼 대용: 매번 set_config로 갱신.
-- u1 ACTIVE
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.u1_mid')::bigint, 'roles', json_build_array('MEMBER'), 'status','ACTIVE'))::text, true);

-- 1. create: 작성자 = 현재 Member.
select is(
    (public.create_post('제목1','내용1','PUBLIC')).author_id,
    current_setting('test.u1_mid')::bigint, 'create_post는 author를 현재 Member로 설정');

-- 2. create: visibility 반영.
select is(
    (public.create_post('제목2','내용2','PRIVATE')).visibility,
    'PRIVATE'::public.post_visibility, 'create_post는 visibility를 반영');

-- 3~5. 검증.
select throws_ok($$ select public.create_post('   ','내용','PUBLIC') $$, 'P0001', NULL, '빈 제목 거부');
select throws_ok($$ select public.create_post(repeat('a',201),'내용','PUBLIC') $$, 'P0001', NULL, '200자 초과 제목 거부');
select throws_ok($$ select public.create_post('제목','   ','PUBLIC') $$, 'P0001', NULL, '빈 내용 거부');

-- 6. 비로그인 거부.
select set_config('request.jwt.claims', '', true);
select throws_ok($$ select public.create_post('제목','내용','PUBLIC') $$, 'P0001', NULL, '비로그인 작성 거부');

-- 7. BLOCKED 거부.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.u1_mid')::bigint, 'roles', json_build_array('MEMBER'), 'status','BLOCKED'))::text, true);
select throws_ok($$ select public.create_post('제목','내용','PUBLIC') $$, 'P0001', NULL, 'BLOCKED 작성 거부');

-- 수정/삭제용 글 준비 (u1 ACTIVE).
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.u1_mid')::bigint, 'roles', json_build_array('MEMBER'), 'status','ACTIVE'))::text, true);
select set_config('test.p_mod',      (public.create_post('수정대상','본문','PUBLIC')).id::text, true);
select set_config('test.p_del',      (public.create_post('삭제대상','본문','PUBLIC')).id::text, true);
select set_config('test.p_admindel', (public.create_post('관리자삭제대상','본문','PUBLIC')).id::text, true);

-- 8. 작성자 본인 수정.
select is(
    (public.modify_post(current_setting('test.p_mod')::bigint, '수정됨','본문2','UNLISTED')).title::text,
    '수정됨', '작성자는 자기 글을 수정한다');

-- 9. 타인(u2)은 수정 불가.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.u2_mid')::bigint, 'roles', json_build_array('MEMBER'), 'status','ACTIVE'))::text, true);
select throws_ok(
    format($$ select public.modify_post(%s, 'x','y','PUBLIC') $$, current_setting('test.p_mod')),
    'P0001', NULL, '타인은 남의 글을 수정 못 한다');
-- 12. 타인(u2)은 삭제 불가.
select throws_ok(
    format($$ select public.delete_post(%s) $$, current_setting('test.p_del')),
    'P0001', NULL, '타인은 남의 글을 삭제 못 한다');

-- 10. ADMIN은 남의 글 수정.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.ad_mid')::bigint, 'roles', json_build_array('ADMIN','MEMBER'), 'status','ACTIVE'))::text, true);
select is(
    (public.modify_post(current_setting('test.p_mod')::bigint, '관리자수정','본문3','PUBLIC')).title::text,
    '관리자수정', 'ADMIN은 남의 글을 수정한다');

-- 11. BLOCKED는 수정 불가.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.u1_mid')::bigint, 'roles', json_build_array('MEMBER'), 'status','BLOCKED'))::text, true);
select throws_ok(
    format($$ select public.modify_post(%s, 'x','y','PUBLIC') $$, current_setting('test.p_mod')),
    'P0001', NULL, 'BLOCKED는 수정 못 한다');

-- 13~14. 작성자 본인 삭제 → id 반환 + 행 제거.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.u1_mid')::bigint, 'roles', json_build_array('MEMBER'), 'status','ACTIVE'))::text, true);
select is(
    public.delete_post(current_setting('test.p_del')::bigint),
    current_setting('test.p_del')::bigint, '작성자 삭제는 삭제된 id를 반환');
select is(
    (select count(*)::int from public.posts where id = current_setting('test.p_del')::bigint),
    0, '삭제된 글은 사라진다');

-- 15. ADMIN은 남의 글 삭제.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', current_setting('test.ad_mid')::bigint, 'roles', json_build_array('ADMIN','MEMBER'), 'status','ACTIVE'))::text, true);
select is(
    public.delete_post(current_setting('test.p_admindel')::bigint),
    current_setting('test.p_admindel')::bigint, 'ADMIN은 남의 글을 삭제한다');

select * from finish();
rollback;
