-- S03 pgTAP: posts RLS + get_post(단건, definer) + get_posts(목록, RLS).
-- get_posts는 SECURITY INVOKER라 RLS가 적용되려면 role을 전환해야 한다
-- (superuser는 RLS 우회). get_post는 definer라 claims만으로 분기한다.
-- 제한된 role에서는 members를 못 읽으므로, 필요한 id는 superuser 상태에서
-- 미리 GUC로 잡아두고 jwt claims도 superuser 상태에서 만든 뒤 role을 바꾼다.

begin;
select plan(14);

-- ── seed 식별자 캡처 (superuser) ──────────────────────────────────────
select set_config('test.u1_mid', (select id::text from public.members where email='user1@no-reply.com'), true);
select set_config('test.u2_mid', (select id::text from public.members where email='user2@no-reply.com'), true);
select set_config('test.u2_sub', (select auth_user_id::text from public.members where email='user2@no-reply.com'), true);
select set_config('test.u3_mid', (select id::text from public.members where email='user3@no-reply.com'), true);
select set_config('test.u3_sub', (select auth_user_id::text from public.members where email='user3@no-reply.com'), true);
select set_config('test.ad_mid', (select id::text from public.members where email='admin@no-reply.com'), true);
select set_config('test.ad_sub', (select auth_user_id::text from public.members where email='admin@no-reply.com'), true);
select set_config('test.public_pid',   (select id::text from public.posts where title='첫 번째 게시글입니다'), true);
select set_config('test.unlisted_pid', (select id::text from public.posts where title='RLS 학습 노트'), true);
select set_config('test.private_pid',  (select id::text from public.posts where title='비공개 메모 — 면접 준비'), true);

-- ── get_posts: 목록 RLS ───────────────────────────────────────────────
-- 1. anon은 PUBLIC만 (12).
select set_config('request.jwt.claims', '', true);
set local role anon;
select is(
    (select count(*)::int from public.get_posts(null, null, 'CREATED_AT_DESC', 1000, 0)),
    12, 'anon get_posts는 PUBLIC만 본다 (12)');
-- 5. total_count는 limit과 무관하게 전체(12).
select is(
    (select total_count::int from public.get_posts(null, null, 'CREATED_AT_DESC', 5, 0) limit 1),
    12, 'total_count는 limit과 무관하게 전체를 반영한다');
-- 6. limit 적용.
select is(
    (select count(*)::int from public.get_posts(null, null, 'CREATED_AT_DESC', 5, 0)),
    5, 'limit이 반환 행 수를 제한한다');
-- 4. author_id 필터 (anon, user1의 PUBLIC 3건).
select is(
    (select count(*)::int from public.get_posts(null, current_setting('test.u1_mid')::bigint, 'CREATED_AT_DESC', 1000, 0)),
    3, 'author_id 필터로 특정 작성자 글만 (anon: user1 PUBLIC 3)');
reset role;

-- 2. 작성자(user2)는 자기 UNLISTED도 목록에서 본다 (12 PUBLIC + 자기 UNLISTED 1).
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.u2_sub'),
        'app_metadata', json_build_object('member_id', current_setting('test.u2_mid')::bigint,
            'roles', json_build_array('MEMBER'), 'status', 'ACTIVE'))::text, true);
set local role authenticated;
select is(
    (select count(*)::int from public.get_posts(null, null, 'CREATED_AT_DESC', 1000, 0)),
    13, '작성자는 자기 UNLISTED를 목록에서 본다 (12+1)');
reset role;

-- 3. ADMIN은 전체 (18).
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.ad_sub'),
        'app_metadata', json_build_object('member_id', current_setting('test.ad_mid')::bigint,
            'roles', json_build_array('ADMIN','MEMBER'), 'status', 'ACTIVE'))::text, true);
set local role authenticated;
select is(
    (select count(*)::int from public.get_posts(null, null, 'CREATED_AT_DESC', 1000, 0)),
    18, 'ADMIN은 모든 글을 목록에서 본다 (18)');
reset role;

-- ── get_post: 단건 (definer, claims 기반) ─────────────────────────────
-- 7~9. anon: PUBLIC·UNLISTED는 보이고 PRIVATE는 안 보인다.
select set_config('request.jwt.claims', '', true);
select is((select count(*)::int from public.get_post(current_setting('test.public_pid')::bigint)),   1, 'anon은 PUBLIC 단건을 본다');
select is((select count(*)::int from public.get_post(current_setting('test.unlisted_pid')::bigint)), 1, 'anon은 UNLISTED 단건을 링크로 본다');
select is((select count(*)::int from public.get_post(current_setting('test.private_pid')::bigint)),  0, 'anon은 PRIVATE를 못 본다');

-- 10. 작성자(user3)는 자기 PRIVATE를 본다.
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.u3_sub'),
        'app_metadata', json_build_object('member_id', current_setting('test.u3_mid')::bigint,
            'roles', json_build_array('MEMBER'), 'status', 'ACTIVE'))::text, true);
select is((select count(*)::int from public.get_post(current_setting('test.private_pid')::bigint)), 1, '작성자는 자기 PRIVATE 단건을 본다');

-- 11. ADMIN은 남의 PRIVATE도 본다.
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.ad_sub'),
        'app_metadata', json_build_object('member_id', current_setting('test.ad_mid')::bigint,
            'roles', json_build_array('ADMIN','MEMBER'), 'status', 'ACTIVE'))::text, true);
select is((select count(*)::int from public.get_post(current_setting('test.private_pid')::bigint)), 1, 'ADMIN은 남의 PRIVATE 단건을 본다');

-- 12. 다른 일반 Member(user1)는 남의 PRIVATE를 못 본다.
select set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-000000000000',
        'app_metadata', json_build_object('member_id', current_setting('test.u1_mid')::bigint,
            'roles', json_build_array('MEMBER'), 'status', 'ACTIVE'))::text, true);
select is((select count(*)::int from public.get_post(current_setting('test.private_pid')::bigint)), 0, '다른 Member는 남의 PRIVATE를 못 본다');

-- ── posts 직접 쓰기 차단 ──────────────────────────────────────────────
select set_config('request.jwt.claims',
    json_build_object('sub', current_setting('test.u1_mid'),
        'app_metadata', json_build_object('member_id', current_setting('test.u1_mid')::bigint,
            'roles', json_build_array('MEMBER'), 'status', 'ACTIVE'))::text, true);
set local role authenticated;
-- 13. 직접 insert는 RLS로 차단.
select throws_ok(
    format($$ insert into public.posts (author_id, title, content) values (%s, 'x', 'y') $$, current_setting('test.u1_mid')),
    NULL, NULL, 'posts 직접 insert는 차단된다');
-- 14. 직접 update는 RLS로 차단되어 행이 바뀌지 않는다.
update public.posts set title='hacked' where id = current_setting('test.public_pid')::bigint;
select is(
    (select title from public.posts where id = current_setting('test.public_pid')::bigint)::text,
    '첫 번째 게시글입니다',
    'posts 직접 update는 차단된다(행 불변)');
reset role;

select * from finish();
rollback;
