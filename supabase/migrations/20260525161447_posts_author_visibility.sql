create type "public"."post_sort" as enum ('RELEVANCE', 'CREATED_AT_DESC', 'CREATED_AT_ASC', 'MODIFIED_AT_DESC', 'MODIFIED_AT_ASC');

create type "public"."post_visibility" as enum ('PUBLIC', 'UNLISTED', 'PRIVATE');


  create table "public"."posts" (
    "id" bigint generated always as identity not null,
    "author_id" bigint not null,
    "title" character varying(200) not null,
    "content" text not null,
    "visibility" public.post_visibility not null default 'PUBLIC'::public.post_visibility,
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now()
      );


alter table "public"."posts" enable row level security;

CREATE INDEX idx_posts_author_created_at ON public.posts USING btree (author_id, created_at DESC);

CREATE INDEX idx_posts_author_id ON public.posts USING btree (author_id);

CREATE INDEX idx_posts_created_at ON public.posts USING btree (created_at DESC);

CREATE INDEX idx_posts_public_created_at ON public.posts USING btree (created_at DESC) WHERE (visibility = 'PUBLIC'::public.post_visibility);

CREATE INDEX idx_posts_visibility ON public.posts USING btree (visibility);

CREATE UNIQUE INDEX posts_pkey ON public.posts USING btree (id);

alter table "public"."posts" add constraint "posts_pkey" PRIMARY KEY using index "posts_pkey";

alter table "public"."posts" add constraint "posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES public.members(id) not valid;

alter table "public"."posts" validate constraint "posts_author_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_post(p_post_id bigint)
 RETURNS TABLE(id bigint, author_id bigint, author_username character varying, author_display_name character varying, author_profile_image_url text, title character varying, content text, visibility public.post_visibility, created_at timestamp with time zone, modified_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_posts(p_keyword text DEFAULT NULL::text, p_author_id bigint DEFAULT NULL::bigint, p_sort public.post_sort DEFAULT 'CREATED_AT_DESC'::public.post_sort, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0)
 RETURNS TABLE(id bigint, author_id bigint, author_username character varying, author_display_name character varying, author_profile_image_url text, title character varying, content text, visibility public.post_visibility, created_at timestamp with time zone, modified_at timestamp with time zone, score double precision, total_count bigint)
 LANGUAGE sql
 STABLE
AS $function$
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
            null::double precision as score
        from public.posts p
        left join public.member_public_profiles mp
            on mp.id = p.author_id
        where
            p_author_id is null
            or p.author_id = p_author_id
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

grant delete on table "public"."posts" to "anon";

grant insert on table "public"."posts" to "anon";

grant references on table "public"."posts" to "anon";

grant select on table "public"."posts" to "anon";

grant trigger on table "public"."posts" to "anon";

grant truncate on table "public"."posts" to "anon";

grant update on table "public"."posts" to "anon";

grant delete on table "public"."posts" to "authenticated";

grant insert on table "public"."posts" to "authenticated";

grant references on table "public"."posts" to "authenticated";

grant select on table "public"."posts" to "authenticated";

grant trigger on table "public"."posts" to "authenticated";

grant truncate on table "public"."posts" to "authenticated";

grant update on table "public"."posts" to "authenticated";

grant delete on table "public"."posts" to "service_role";

grant insert on table "public"."posts" to "service_role";

grant references on table "public"."posts" to "service_role";

grant select on table "public"."posts" to "service_role";

grant trigger on table "public"."posts" to "service_role";

grant truncate on table "public"."posts" to "service_role";

grant update on table "public"."posts" to "service_role";


  create policy "posts_delete_blocked"
  on "public"."posts"
  as permissive
  for delete
  to public
using (false);



  create policy "posts_insert_blocked"
  on "public"."posts"
  as permissive
  for insert
  to public
with check (false);



  create policy "posts_select_policy"
  on "public"."posts"
  as permissive
  for select
  to public
using (((visibility = 'PUBLIC'::public.post_visibility) OR (author_id = public.current_member_id()) OR public.current_user_has_role('ADMIN'::text)));



  create policy "posts_update_blocked"
  on "public"."posts"
  as permissive
  for update
  to public
using (false)
with check (false);


CREATE TRIGGER trg_posts_modified_at BEFORE UPDATE OF title, content, visibility ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_modified_at();


