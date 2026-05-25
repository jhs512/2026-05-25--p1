-- 게시글 목록 조회 (ADR-0004). SECURITY DEFINER가 "아니다" → 테이블 RLS를 그대로 탄다.
--   anon: PUBLIC만 / 작성자: 자기 글 포함 / ADMIN: 전체.
-- 작성자 표시 정보는 member_public_profiles를 조인.
-- p_keyword가 있으면 pgroonga(&@~)로 제목·본문을 검색하고, RELEVANCE 정렬 시
-- pgroonga_score로 정렬한다. 검색도 RLS를 그대로 타므로 anon은 PUBLIC 안에서만 검색된다.
create or replace function public.get_posts(
    p_keyword text default null,
    p_author_id bigint default null,
    p_sort public.post_sort default 'CREATED_AT_DESC',
    p_limit integer default 20,
    p_offset integer default 0
)
returns table (
    id bigint,
    author_id bigint,
    author_username varchar,
    author_display_name varchar,
    author_profile_image_url text,
    title varchar,
    content text,
    visibility public.post_visibility,
    created_at timestamptz,
    modified_at timestamptz,
    score double precision,
    total_count bigint
)
language sql
stable
as $$
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
$$;

grant execute on function
public.get_posts(text, bigint, public.post_sort, integer, integer)
to anon, authenticated;
