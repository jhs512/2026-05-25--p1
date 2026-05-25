-- Post: Member가 작성한 텍스트 콘텐츠 (CONTEXT.md).
-- author_id는 Member(members.id)를 참조한다. content는 not null.
create table public.posts (
    id bigint generated always as identity primary key,

    author_id bigint not null references public.members(id),

    title varchar(200) not null,

    content text not null,

    visibility public.post_visibility
        not null
        default 'PUBLIC',

    created_at timestamptz not null default now(),
    modified_at timestamptz not null default now()
);

create index idx_posts_author_id
on public.posts(author_id);

create index idx_posts_visibility
on public.posts(visibility);

create index idx_posts_created_at
on public.posts(created_at desc);

create index idx_posts_author_created_at
on public.posts(author_id, created_at desc);

create index idx_posts_public_created_at
on public.posts(created_at desc)
where visibility = 'PUBLIC';

-- 전문 검색: 제목+본문을 배열로 묶어 pgroonga 인덱스. TokenBigram으로 한글 부분 매칭.
create index idx_posts_title_content_pgroonga
on public.posts
using pgroonga (
    (array[title::text, content::text])
    pgroonga_text_array_full_text_search_ops_v2
)
with (tokenizer = 'TokenBigram');

create trigger trg_posts_modified_at
before update of title, content, visibility
on public.posts
for each row
execute function public.update_modified_at();
