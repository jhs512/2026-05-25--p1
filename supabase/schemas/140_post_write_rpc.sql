-- 게시글 쓰기 RPC (ADR-0001: 쓰기는 SECURITY DEFINER 함수, search_path 고정 + 자체 인가).
-- 직접 테이블 DML은 posts RLS에서 차단됨.

-- 생성
create or replace function public.create_post(
    p_title text,
    p_content text,
    p_visibility public.post_visibility default 'PUBLIC'
)
returns public.posts
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    v_member_id bigint;
    v_post public.posts;
begin
    v_member_id := public.current_member_id();

    if v_member_id is null then
        raise exception '로그인이 필요합니다.';
    end if;

    if not public.current_user_is_active() then
        raise exception 'ACTIVE 회원만 글을 작성할 수 있습니다.';
    end if;

    if nullif(trim(p_title), '') is null then
        raise exception '제목은 필수입니다.';
    end if;

    if length(trim(p_title)) > 200 then
        raise exception '제목은 200자를 넘을 수 없습니다.';
    end if;

    if nullif(trim(p_content), '') is null then
        raise exception '내용은 필수입니다.';
    end if;

    insert into public.posts (author_id, title, content, visibility)
    values (v_member_id, trim(p_title), trim(p_content), p_visibility)
    returning * into v_post;

    return v_post;
end;
$$;

grant execute on function
public.create_post(text, text, public.post_visibility)
to authenticated;

-- 수정 (작성자 본인 또는 ADMIN)
create or replace function public.modify_post(
    p_post_id bigint,
    p_title text,
    p_content text,
    p_visibility public.post_visibility
)
returns public.posts
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    v_member_id bigint;
    v_is_admin boolean;
    v_post public.posts;
begin
    v_member_id := public.current_member_id();
    v_is_admin := public.current_user_has_role('ADMIN');

    if v_member_id is null then
        raise exception '로그인이 필요합니다.';
    end if;

    if not public.current_user_is_active() then
        raise exception 'ACTIVE 회원만 글을 수정할 수 있습니다.';
    end if;

    if nullif(trim(p_title), '') is null then
        raise exception '제목은 필수입니다.';
    end if;

    if length(trim(p_title)) > 200 then
        raise exception '제목은 200자를 넘을 수 없습니다.';
    end if;

    if nullif(trim(p_content), '') is null then
        raise exception '내용은 필수입니다.';
    end if;

    update public.posts
    set
        title = trim(p_title),
        content = trim(p_content),
        visibility = p_visibility
    where id = p_post_id
      and (author_id = v_member_id or v_is_admin)
    returning * into v_post;

    if not found then
        raise exception '수정할 수 있는 게시글이 없거나 권한이 없습니다.';
    end if;

    return v_post;
end;
$$;

grant execute on function
public.modify_post(bigint, text, text, public.post_visibility)
to authenticated;

-- 삭제 (작성자 본인 또는 ADMIN)
create or replace function public.delete_post(
    p_post_id bigint
)
returns bigint
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
    v_member_id bigint;
    v_is_admin boolean;
    v_deleted_id bigint;
begin
    v_member_id := public.current_member_id();
    v_is_admin := public.current_user_has_role('ADMIN');

    if v_member_id is null then
        raise exception '로그인이 필요합니다.';
    end if;

    if not public.current_user_is_active() then
        raise exception 'ACTIVE 회원만 글을 삭제할 수 있습니다.';
    end if;

    delete from public.posts
    where id = p_post_id
      and (author_id = v_member_id or v_is_admin)
    returning id into v_deleted_id;

    if not found then
        raise exception '삭제할 수 있는 게시글이 없거나 권한이 없습니다.';
    end if;

    return v_deleted_id;
end;
$$;

grant execute on function public.delete_post(bigint) to authenticated;
