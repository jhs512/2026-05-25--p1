-- 도메인 enum (CONTEXT.md 참고).
-- Role: Member의 지위. Status: Member가 행위할 수 있는지 여부.
create type public.role_type as enum (
    'SYSTEM',
    'ADMIN',
    'MEMBER'
);

create type public.member_status as enum (
    'ACTIVE',
    'BLOCKED'
);

-- Visibility: Post의 도달성 (CONTEXT.md). draft/published 라이프사이클 아님.
create type public.post_visibility as enum (
    'PUBLIC',
    'UNLISTED',
    'PRIVATE'
);

-- 목록 정렬 기준. RELEVANCE는 검색 슬라이스에서 의미를 가진다.
create type public.post_sort as enum (
    'RELEVANCE',
    'CREATED_AT_DESC',
    'CREATED_AT_ASC',
    'MODIFIED_AT_DESC',
    'MODIFIED_AT_ASC'
);
