-- User 생성 시 Member 자동 프로비저닝 (1:1).
-- auth.users insert마다 members 행 1건을 만든다. username은 display_name을
-- 정규화하고 User id 일부를 붙여 생성한다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
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
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
