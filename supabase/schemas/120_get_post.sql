-- 게시글 단건 조회 (ADR-0004). SECURITY DEFINER로 테이블 RLS를 우회한다.
-- 이유: 테이블 RLS는 anon에게 PUBLIC만 열지만, UNLISTED는 id를 알면 누구나
-- 읽을 수 있어야 한다 — RLS만으로는 표현 불가.
-- PUBLIC·UNLISTED: 누구나 / PRIVATE: 작성자·ADMIN.
create or replace function public.get_post(
    p_post_id bigint
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
    modified_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth, extensions
as $$
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
        p.modified_at
    from public.posts p
    left join public.member_public_profiles mp
        on mp.id = p.author_id
    where p.id = p_post_id
      and (
          p.visibility in ('PUBLIC', 'UNLISTED')
          or p.author_id = public.current_member_id()
          or public.current_user_has_role('ADMIN')
      );
$$;

grant execute on function public.get_post(bigint) to anon, authenticated;
