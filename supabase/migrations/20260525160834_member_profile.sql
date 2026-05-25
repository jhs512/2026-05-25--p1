set check_function_bodies = off;

create or replace view "public"."member_public_profiles" as  SELECT id,
    username,
    display_name,
    profile_image_url
   FROM public.members;


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
    v_member_id := public.current_member_id();

    if v_member_id is null then
        raise exception '로그인이 필요합니다.';
    end if;

    if not public.current_user_is_active() then
        raise exception 'ACTIVE 회원만 회원 정보를 수정할 수 있습니다.';
    end if;

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


