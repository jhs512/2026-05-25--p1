-- 리팩토링 가드의 인터페이스 직접 검증 (require_active_member / validate_post_text).

begin;
select plan(7);

-- require_active_member: ACTIVE면 member_id 반환.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', 42, 'roles', json_build_array('MEMBER'), 'status','ACTIVE'))::text, true);
select is(public.require_active_member(), 42::bigint, 'ACTIVE면 member_id를 반환');

-- 비로그인이면 raise.
select set_config('request.jwt.claims', '', true);
select throws_ok($$ select public.require_active_member() $$, 'P0001', NULL, '비로그인이면 거부');

-- BLOCKED면 raise.
select set_config('request.jwt.claims',
    json_build_object('sub','x','app_metadata', json_build_object(
        'member_id', 42, 'roles', json_build_array('MEMBER'), 'status','BLOCKED'))::text, true);
select throws_ok($$ select public.require_active_member() $$, 'P0001', NULL, 'BLOCKED면 거부');

-- validate_post_text.
select throws_ok($$ select public.validate_post_text('   ', '내용') $$, 'P0001', NULL, '빈 제목 거부');
select throws_ok($$ select public.validate_post_text(repeat('a',201), '내용') $$, 'P0001', NULL, '200자 초과 제목 거부');
select throws_ok($$ select public.validate_post_text('제목', '   ') $$, 'P0001', NULL, '빈 내용 거부');
select lives_ok($$ select public.validate_post_text('제목', '내용') $$, '유효한 입력은 통과');

select * from finish();
rollback;
