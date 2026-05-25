-- 확장 기능 (선언적 스키마).
-- pgcrypto: create_test_user(seed)의 gen_random_uuid·crypt·gen_salt에 필요.
create extension if not exists pgcrypto with schema extensions;

-- pgroonga: 한글 친화 전문 검색(posts 제목·본문).
create extension if not exists pgroonga;
