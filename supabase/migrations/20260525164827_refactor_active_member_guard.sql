set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.require_active_member()
 RETURNS bigint
 LANGUAGE plpgsql
 STABLE
AS $function$
declare
    v_member_id bigint;
begin
    v_member_id := public.current_member_id();

    if v_member_id is null then
        raise exception '로그인이 필요합니다.';
    end if;

    if not public.current_user_is_active() then
        raise exception 'ACTIVE 회원만 이용할 수 있습니다.';
    end if;

    return v_member_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.validate_post_text(p_title text, p_content text)
 RETURNS void
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
begin
    if nullif(trim(p_title), '') is null then
        raise exception '제목은 필수입니다.';
    end if;

    if length(trim(p_title)) > 200 then
        raise exception '제목은 200자를 넘을 수 없습니다.';
    end if;

    if nullif(trim(p_content), '') is null then
        raise exception '내용은 필수입니다.';
    end if;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.create_post(p_title text, p_content text, p_visibility public.post_visibility DEFAULT 'PUBLIC'::public.post_visibility)
 RETURNS public.posts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
    v_member_id bigint;
    v_post public.posts;
begin
    v_member_id := public.require_active_member();
    perform public.validate_post_text(p_title, p_content);

    insert into public.posts (author_id, title, content, visibility)
    values (v_member_id, trim(p_title), trim(p_content), p_visibility)
    returning * into v_post;

    return v_post;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_post(p_post_id bigint)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
    v_member_id bigint;
    v_is_admin boolean;
    v_deleted_id bigint;
begin
    v_member_id := public.require_active_member();
    v_is_admin := public.current_user_has_role('ADMIN');

    delete from public.posts
    where id = p_post_id
      and (author_id = v_member_id or v_is_admin)
    returning id into v_deleted_id;

    if not found then
        raise exception '삭제할 수 있는 게시글이 없거나 권한이 없습니다.';
    end if;

    return v_deleted_id;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.modify_member(p_username character varying, p_display_name character varying, p_profile_image_url text DEFAULT NULL::text)
 RETURNS public.members
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
    v_member_id bigint;
    v_member public.members;
begin
    v_member_id := public.require_active_member();

    if nullif(trim(p_username), '') is null then
        raise exception 'username은 필수입니다.';
    end if;

    if length(trim(p_username)) > 50 then
        raise exception 'username은 50자를 넘을 수 없습니다.';
    end if;

    if nullif(trim(p_display_name), '') is null then
        raise exception 'display_name은 필수입니다.';
    end if;

    if length(trim(p_display_name)) > 50 then
        raise exception 'display_name은 50자를 넘을 수 없습니다.';
    end if;

    update public.members
    set
        username = trim(p_username),
        display_name = trim(p_display_name),
        profile_image_url = p_profile_image_url
    where id = v_member_id
      and status = 'ACTIVE'
    returning * into v_member;

    if not found then
        raise exception '수정할 수 있는 회원 정보가 없습니다.';
    end if;

    return v_member;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.modify_post(p_post_id bigint, p_title text, p_content text, p_visibility public.post_visibility)
 RETURNS public.posts
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
    v_member_id bigint;
    v_is_admin boolean;
    v_post public.posts;
begin
    v_member_id := public.require_active_member();
    v_is_admin := public.current_user_has_role('ADMIN');
    perform public.validate_post_text(p_title, p_content);

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
$function$
;


