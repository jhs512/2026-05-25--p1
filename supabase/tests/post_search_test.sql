-- S05 pgTAP: pgroonga 검색 (get_posts의 keyword 경로).
-- get_posts는 RLS를 타므로 role을 전환해 anon/작성자/ADMIN을 흉내 낸다.

begin;
select plan(9);

select set_config('test.u2_mid', (select id::text from public.members where email='user2@no-reply.com'), true);
select set_config('test.u2_sub', (select auth_user_id::text from public.members where email='user2@no-reply.com'), true);
select set_config('test.ad_mid', (select id::text from public.members where email='admin@no-reply.com'), true);
select set_config('test.ad_sub', (select auth_user_id::text from public.members where email='admin@no-reply.com'), true);

-- anon 컨텍스트.
select set_config('request.jwt.claims', '', true);
set local role anon;

-- 1. 한글 키워드 매칭 (PUBLIC 'PGroonga 한글 검색 후기').
select is(
    (select count(*)::int from public.get_posts('한글', null, 'RELEVANCE', 100, 0)),
    1, '한글 키워드가 매칭된다');

-- 2. 한글 부분 매칭 ('검색'은 PUBLIC 2건 이상).
select cmp_ok(
    (select count(*)::int from public.get_posts('검색', null, 'RELEVANCE', 100, 0)),
    '>=', 2, '한글 부분 매칭이 동작한다');

-- 3. 영문 키워드 매칭.
select cmp_ok(
    (select count(*)::int from public.get_posts('PostgreSQL', null, 'RELEVANCE', 100, 0)),
    '>=', 1, '영문 키워드가 매칭된다');

-- 4. 키워드가 있으면 score가 채워진다.
select isnt(
    (select score from public.get_posts('한글', null, 'RELEVANCE', 100, 0) limit 1),
    null, '키워드 검색은 score를 채운다');

-- 5. RELEVANCE 정렬은 가장 관련도 높은 글을 먼저 둔다.
-- ('PGroonga 한글 검색 후기'가 'PostgreSQL 인덱스 정리'보다 '검색' 관련도 높음)
select is(
    (select title from public.get_posts('검색', null, 'RELEVANCE', 100, 0) limit 1)::text,
    'PGroonga 한글 검색 후기',
    'RELEVANCE 정렬은 가장 관련도 높은 글을 먼저 둔다');

-- 6. 빈 키워드는 필터 없이 전체 목록(anon: PUBLIC 12).
select is(
    (select count(*)::int from public.get_posts('', null, 'CREATED_AT_DESC', 100, 0)),
    12, '빈 키워드는 전체 목록으로 회귀한다');

-- 7. 검색도 RLS를 탄다: anon은 UNLISTED('RLS 학습 노트')를 검색 결과에서 못 본다.
select is(
    (select count(*)::int from public.get_posts('학습', null, 'RELEVANCE', 100, 0)),
    0, 'anon 검색은 UNLISTED를 포함하지 않는다');
reset role;

-- 8. 작성자(user2)는 자기 UNLISTED를 검색 결과에서 본다.
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.u2_sub'),
        'app_metadata', json_build_object('member_id', current_setting('test.u2_mid')::bigint,
            'roles', json_build_array('MEMBER'), 'status','ACTIVE'))::text, true);
set local role authenticated;
select is(
    (select count(*)::int from public.get_posts('학습', null, 'RELEVANCE', 100, 0)),
    1, '작성자는 자기 UNLISTED를 검색에서 본다');
reset role;

-- 9. ADMIN도 UNLISTED를 검색에서 본다.
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.ad_sub'),
        'app_metadata', json_build_object('member_id', current_setting('test.ad_mid')::bigint,
            'roles', json_build_array('ADMIN','MEMBER'), 'status','ACTIVE'))::text, true);
set local role authenticated;
select cmp_ok(
    (select count(*)::int from public.get_posts('학습', null, 'RELEVANCE', 100, 0)),
    '>=', 1, 'ADMIN은 UNLISTED를 검색에서 본다');
reset role;

select * from finish();
rollback;
