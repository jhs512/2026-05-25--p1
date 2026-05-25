-- 검색 슬라이스. migra가 (a) 확장이 이미 만드는 pgroonga 내부 타입을 중복 생성하고
-- (b) index의 연산자 클래스를 누락해, 생성분을 의도대로 정리한 버전이다.
-- 선언적 스키마(10_extensions / 100_posts / 130_get_posts)와 동일 상태를 만든다.

create extension if not exists "pgroonga";

-- 제목+본문 배열에 대한 pgroonga 전문검색 인덱스. &@~ 연산자를 위해
-- pgroonga_text_array_full_text_search_ops_v2 연산자 클래스를 명시한다.
create index idx_posts_title_content_pgroonga
on public.posts
using pgroonga (
    (array[title::text, content::text])
    pgroonga_text_array_full_text_search_ops_v2
)
with (tokenizer = 'TokenBigram');

set check_function_bodies = off;

create or replace function public.get_posts(
    p_keyword text default null,
    p_author_id bigint default null,
    p_sort public.post_sort default 'CREATED_AT_DESC'::public.post_sort,
    p_limit integer default 20,
    p_offset integer default 0
)
returns table(
    id bigint,
    author_id bigint,
    author_username character varying,
    author_display_name character varying,
    author_profile_image_url text,
    title character varying,
    content text,
    visibility public.post_visibility,
    created_at timestamp with time zone,
    modified_at timestamp with time zone,
    score double precision,
    total_count bigint
)
language sql
stable
as $function$
    with visible_posts as (
        select
            p.id,
            p.author_id,
            mp.username as author_username,
            mp.display_name as author_display_name,
            mp.profile_image_url as author_profile_image_url,
            p.title,
            p.content,
            p.visibility,
            p.created_at,
            p.modified_at,
            case
                when nullif(trim(coalesce(p_keyword, '')), '') is null then null::double precision
                else pgroonga_score(p.tableoid, p.ctid)
            end as score
        from public.posts p
        left join public.member_public_profiles mp
            on mp.id = p.author_id
        where
            (
                p_author_id is null
                or p.author_id = p_author_id
            )
            and
            (
                nullif(trim(coalesce(p_keyword, '')), '') is null
                or array[p.title::text, p.content::text] &@~ trim(p_keyword)
            )
    )
    select
        vp.id,
        vp.author_id,
        vp.author_username,
        vp.author_display_name,
        vp.author_profile_image_url,
        vp.title,
        vp.content,
        vp.visibility,
        vp.created_at,
        vp.modified_at,
        vp.score,
        count(*) over () as total_count
    from visible_posts vp
    order by
        case when p_sort = 'RELEVANCE'        then vp.score end desc nulls last,
        case when p_sort = 'CREATED_AT_DESC'  then vp.created_at end desc,
        case when p_sort = 'CREATED_AT_ASC'   then vp.created_at end asc,
        case when p_sort = 'MODIFIED_AT_DESC' then vp.modified_at end desc,
        case when p_sort = 'MODIFIED_AT_ASC'  then vp.modified_at end asc,
        vp.created_at desc,
        vp.id desc
    limit greatest(p_limit, 0)
    offset greatest(p_offset, 0);
$function$
;
