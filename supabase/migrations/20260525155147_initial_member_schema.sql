create type "public"."member_status" as enum ('ACTIVE', 'BLOCKED');

create type "public"."role_type" as enum ('SYSTEM', 'ADMIN', 'MEMBER');


  create table "public"."members" (
    "id" bigint generated always as identity not null,
    "auth_user_id" uuid not null,
    "email" text,
    "username" character varying(50) not null,
    "display_name" character varying(50) not null,
    "profile_image_url" text,
    "roles" public.role_type[] not null default ARRAY['MEMBER'::public.role_type],
    "status" public.member_status not null default 'ACTIVE'::public.member_status,
    "created_at" timestamp with time zone not null default now(),
    "modified_at" timestamp with time zone not null default now()
      );


alter table "public"."members" enable row level security;

CREATE INDEX idx_members_roles ON public.members USING gin (roles);

CREATE INDEX idx_members_status ON public.members USING btree (status);

CREATE UNIQUE INDEX members_auth_user_id_key ON public.members USING btree (auth_user_id);

CREATE UNIQUE INDEX members_pkey ON public.members USING btree (id);

CREATE UNIQUE INDEX members_username_key ON public.members USING btree (username);

alter table "public"."members" add constraint "members_pkey" PRIMARY KEY using index "members_pkey";

alter table "public"."members" add constraint "members_auth_user_id_key" UNIQUE using index "members_auth_user_id_key";

alter table "public"."members" add constraint "members_username_key" UNIQUE using index "members_username_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.current_member_id()
 RETURNS bigint
 LANGUAGE sql
 STABLE
AS $function$
    select nullif(
        auth.jwt() -> 'app_metadata' ->> 'member_id',
        ''
    )::bigint;
$function$
;

CREATE OR REPLACE FUNCTION public.current_user_has_role(p_role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
    select coalesce(
        (auth.jwt() -> 'app_metadata' -> 'roles') ? p_role,
        false
    );
$function$
;

CREATE OR REPLACE FUNCTION public.current_user_is_active()
 RETURNS boolean
 LANGUAGE sql
 STABLE
AS $function$
    select coalesce(
        auth.jwt() -> 'app_metadata' ->> 'status' = 'ACTIVE',
        false
    );
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
declare
    generated_display_name text;
    generated_username text;
begin
    generated_display_name :=
        coalesce(
            new.raw_user_meta_data ->> 'name',
            new.raw_user_meta_data ->> 'nickname',
            split_part(coalesce(new.email, 'user'), '@', 1),
            'user'
        );

    generated_username :=
        lower(
            regexp_replace(
                generated_display_name,
                '\s+',
                '',
                'g'
            )
        )
        || '_'
        || substr(new.id::text, 1, 8);

    insert into public.members (
        auth_user_id,
        email,
        username,
        display_name,
        profile_image_url
    )
    values (
        new.id,
        new.email,
        generated_username,
        generated_display_name,
        new.raw_user_meta_data ->> 'avatar_url'
    );

    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.sync_member_metadata_to_auth()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
begin
    update auth.users
    set raw_app_meta_data =
        coalesce(raw_app_meta_data, '{}'::jsonb)
        || jsonb_build_object(
            'member_id', new.id,
            'roles', new.roles,
            'username', new.username,
            'display_name', new.display_name,
            'status', new.status
        )
    where id = new.auth_user_id;

    return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
    new.modified_at = now();
    return new;
end;
$function$
;

grant delete on table "public"."members" to "anon";

grant insert on table "public"."members" to "anon";

grant references on table "public"."members" to "anon";

grant select on table "public"."members" to "anon";

grant trigger on table "public"."members" to "anon";

grant truncate on table "public"."members" to "anon";

grant update on table "public"."members" to "anon";

grant delete on table "public"."members" to "authenticated";

grant insert on table "public"."members" to "authenticated";

grant references on table "public"."members" to "authenticated";

grant select on table "public"."members" to "authenticated";

grant trigger on table "public"."members" to "authenticated";

grant truncate on table "public"."members" to "authenticated";

grant update on table "public"."members" to "authenticated";

grant delete on table "public"."members" to "service_role";

grant insert on table "public"."members" to "service_role";

grant references on table "public"."members" to "service_role";

grant select on table "public"."members" to "service_role";

grant trigger on table "public"."members" to "service_role";

grant truncate on table "public"."members" to "service_role";

grant update on table "public"."members" to "service_role";


  create policy "members_delete_blocked"
  on "public"."members"
  as permissive
  for delete
  to public
using (false);



  create policy "members_insert_blocked"
  on "public"."members"
  as permissive
  for insert
  to public
with check (false);



  create policy "members_select_self_or_admin"
  on "public"."members"
  as permissive
  for select
  to public
using (((auth.uid() = auth_user_id) OR public.current_user_has_role('ADMIN'::text)));



  create policy "members_update_blocked"
  on "public"."members"
  as permissive
  for update
  to public
using (false)
with check (false);


CREATE TRIGGER trg_members_modified_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_modified_at();

CREATE TRIGGER trg_sync_member_metadata_to_auth AFTER INSERT OR UPDATE OF roles, username, display_name, status ON public.members FOR EACH ROW EXECUTE FUNCTION public.sync_member_metadata_to_auth();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


