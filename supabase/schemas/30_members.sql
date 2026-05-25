-- Member: User(auth.users)에 1:1로 붙는 도메인 프로필 (CONTEXT.md).
create table public.members (
    id bigint generated always as identity primary key,

    auth_user_id uuid not null unique,

    email text,

    username varchar(50) not null unique,

    display_name varchar(50) not null,

    profile_image_url text,

    roles public.role_type[]
        not null
        default array['MEMBER']::public.role_type[],

    status public.member_status
        not null
        default 'ACTIVE',

    created_at timestamptz not null default now(),
    modified_at timestamptz not null default now()
);

-- auth_user_id는 unique라 별도 일반 index를 만들지 않음.
create index idx_members_roles
on public.members using gin (roles);

create index idx_members_status
on public.members(status);

create trigger trg_members_modified_at
before update on public.members
for each row
execute function public.update_modified_at();
