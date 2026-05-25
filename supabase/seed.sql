-- 로컬 개발용 샘플 데이터 (db reset 시 자동 로드).
-- 선언적 스키마(migra)는 DML을 추적하지 않으므로 데이터는 여기 둔다.
-- 단일 DO 블록으로 처리한다: CLI seed 러너가 문을 파이프라인으로 파싱하므로
-- 별도 함수 정의 후 호출은 "함수 없음" 오류가 난다. 한 문장이면 안전하다.
-- 샘플 Post는 posts 테이블이 생기는 슬라이스에서 추가한다.

do $$
declare
    u record;
    v_user_id uuid;
begin
    for u in
        select t.email, t.name, t.roles
        from (
            values
                ('system@no-reply.com', 'system', array['SYSTEM','ADMIN','MEMBER']::public.role_type[]),
                ('admin@no-reply.com',  'admin',  array['ADMIN','MEMBER']::public.role_type[]),
                ('user1@no-reply.com',  'user1',  array['MEMBER']::public.role_type[]),
                ('user2@no-reply.com',  'user2',  array['MEMBER']::public.role_type[]),
                ('user3@no-reply.com',  'user3',  array['MEMBER']::public.role_type[]),
                ('user4@no-reply.com',  'user4',  array['MEMBER']::public.role_type[])
        ) as t(email, name, roles)
    loop
        v_user_id := extensions.gen_random_uuid();

        insert into auth.users (
            instance_id, id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at,
            -- GoTrue가 문자열로 읽는 토큰 컬럼들. raw INSERT로 NULL로 두면 로그인 시
            -- "Database error querying schema"가 난다 → 빈 문자열로 채운다.
            confirmation_token, recovery_token, email_change, email_change_token_new
        )
        values (
            '00000000-0000-0000-0000-000000000000',
            v_user_id,
            'authenticated',
            'authenticated',
            u.email,
            extensions.crypt('lldj123414', extensions.gen_salt('bf')),
            now(),
            jsonb_build_object('provider', 'email', 'providers', array['email']),
            jsonb_build_object('name', u.name, 'nickname', u.name, 'avatar_url', null),
            now(),
            now(),
            '', '', '', ''
        );

        insert into auth.identities (
            id, user_id, identity_data, provider, provider_id,
            last_sign_in_at, created_at, updated_at
        )
        values (
            extensions.gen_random_uuid(),
            v_user_id,
            jsonb_build_object(
                'sub', v_user_id::text,
                'email', u.email,
                'email_verified', true,
                'phone_verified', false
            ),
            'email',
            u.email,
            now(),
            now(),
            now()
        );

        -- handle_new_user 트리거가 이미 Member를 만들었으므로 roles만 갱신.
        update public.members
        set roles = u.roles
        where auth_user_id = v_user_id;
    end loop;
end $$;

-- 샘플 Post (members 생성 후). author_id는 email로 Member를 찾아 연결.
insert into public.posts (author_id, title, content, visibility)
select
    m.id,
    p.title,
    p.content,
    p.visibility::public.post_visibility
from (
    values
        ('system@no-reply.com', '시스템 공지입니다', '서비스 점검 및 운영 관련 공지사항입니다.', 'PUBLIC'),
        ('system@no-reply.com', '정기 점검 안내', '매주 일요일 새벽 3시부터 5시까지 정기 점검이 진행됩니다. 점검 시간에는 게시판 이용이 불가합니다.', 'PUBLIC'),
        ('admin@no-reply.com', '관리자 안내 글', '게시판 이용 규칙과 기본 안내를 정리했습니다.', 'PUBLIC'),
        ('admin@no-reply.com', '신고 처리 정책 업데이트', '욕설과 광고 게시물에 대한 신고 처리 기준을 강화했습니다. 위반 시 즉시 제재됩니다.', 'PUBLIC'),
        ('admin@no-reply.com', '내부 운영 메모', '관리자끼리만 공유하는 운영 노트입니다. 외부 공개 금지.', 'PRIVATE'),
        ('user1@no-reply.com', '첫 번째 게시글입니다', '오늘 처음으로 게시판에 글을 남겨봅니다.', 'PUBLIC'),
        ('user1@no-reply.com', '자기소개 — 백엔드 개발자입니다', 'Spring Boot와 Kotlin으로 주로 작업하고 있습니다. 잘 부탁드립니다.', 'PUBLIC'),
        ('user1@no-reply.com', 'PostgreSQL 인덱스 정리', 'B-tree, GIN, GiST 인덱스의 차이를 정리해봤습니다. 전문 검색에는 GIN이 유리합니다.', 'PUBLIC'),
        ('user2@no-reply.com', 'Supabase 연습 중', '회원과 게시글 테이블을 연결해서 테스트하고 있습니다.', 'PUBLIC'),
        ('user2@no-reply.com', 'PGroonga 한글 검색 후기', 'TokenBigram 토크나이저로 한글 부분 매칭이 잘 됩니다. 영문 검색도 자연스럽게 동작.', 'PUBLIC'),
        ('user2@no-reply.com', 'RLS 학습 노트', 'auth.uid()와 policy 작성법을 정리한 노트입니다. 공유는 안 하고 링크 아는 사람만.', 'UNLISTED'),
        ('user3@no-reply.com', 'RLS 테스트', '본인 글만 수정하고 삭제할 수 있는지 확인하는 글입니다.', 'PRIVATE'),
        ('user3@no-reply.com', '오늘의 개발 일지', '리팩터링하면서 발견한 N+1 문제를 해결했습니다. fetch join이 답이었네요.', 'PUBLIC'),
        ('user3@no-reply.com', '비공개 메모 — 면접 준비', 'CS 면접 예상 질문 정리. 본인만 볼 글이라 PRIVATE.', 'PRIVATE'),
        ('user4@no-reply.com', '반갑습니다', '간단한 자기소개용 게시글입니다.', 'UNLISTED'),
        ('user4@no-reply.com', '책 추천 — 클린 아키텍처', '도메인 분리에 대해 다시 생각하게 만든 책이었습니다. 백엔드 개발자라면 한 번 읽어볼 만합니다.', 'PUBLIC'),
        ('user4@no-reply.com', '주말 러닝 기록', '한강에서 10km 달리고 왔습니다. 날씨가 좋아서 컨디션도 최고였습니다.', 'PUBLIC'),
        ('user4@no-reply.com', '플레이리스트 공유', '코딩할 때 듣는 lo-fi 모음입니다. 집중 잘 됩니다.', 'UNLISTED')
) as p(email, title, content, visibility)
join public.members m on m.email = p.email;
