# PRD — Member 도입과 Author·Visibility를 가진 Post

Status: ready-for-agent

## Problem Statement

지금 `/`의 Post 목록은 주인 없는 콘텐츠다. Post에는 Author가 없고, 공개/비공개 구분도 없으며, 글을 쓰거나 고칠 사람도 없다. 방문자는 모든 Post를 똑같이 보고, 누가 썼는지 알 수 없고, 검색할 수도 없다. 서비스가 "읽기 전용 게시판"을 넘어서려면, 로그인한 사람이 자기 글을 쓰고·고치고·지우고, 그 글의 도달 범위(누구나 / 링크 아는 사람 / 나만)를 정하고, 다른 사람이 그 글을 작성자와 함께 보고 검색할 수 있어야 한다.

## Solution

**User**(인증 신원)가 처음 로그인하는 순간 그에 1:1로 묶인 **Member**(도메인 프로필)가 자동으로 생긴다. Member는 **Post**의 **Author**가 되어 글을 작성·수정·삭제하고, 각 Post에 **Visibility**(PUBLIC / UNLISTED / PRIVATE)를 부여한다. 방문자는 PUBLIC 글을 목록에서 보고, UNLISTED 글은 링크를 알면 단건으로 읽으며, PRIVATE 글은 Author와 ADMIN만 본다. 모든 목록·단건 조회에 Author의 공개 프로필(username·display_name·프로필 이미지)이 함께 따라오고, 키워드 검색과 정렬·페이징을 지원한다.

인가는 ADR-0001(읽기=RLS, 쓰기=SQL 함수)·ADR-0003(JWT app_metadata 미러)·ADR-0004(visibility 읽기 분기)를 따른다. 스키마는 Supabase 선언적 스키마(`supabase/schemas/`)로 선언하고 `supabase db diff`로 마이그레이션을 생성하며, 샘플 데이터는 `seed.sql`에 둔다.

## User Stories

1. 방문자로서, 나는 `/` 목록에서 PUBLIC Post만 최신순으로 보고 싶다. 그래야 공개된 글만 깔끔하게 둘러볼 수 있다.
2. 방문자로서, 나는 각 Post에 Author의 display_name과 username이 함께 보이길 원한다. 그래야 누가 썼는지 알 수 있다.
3. 방문자로서, 나는 UNLISTED Post의 링크(id)를 알면 그 글을 단건으로 읽고 싶다. 그래야 공유받은 글을 볼 수 있다.
4. 방문자로서, 나는 UNLISTED Post가 목록에는 절대 안 뜨길 원한다. 그래야 작성자가 의도한 "링크로만 공유"가 지켜진다.
5. 방문자로서, 나는 PRIVATE Post에는 목록·단건 어디서도 접근할 수 없길 원한다. 그래야 비공개가 실제로 보장된다.
6. 방문자로서, 나는 키워드로 Post를 검색하고 싶다(제목·본문 대상). 그래야 원하는 글을 찾을 수 있다.
7. 방문자로서, 나는 한글 키워드의 부분 매칭 검색이 잘 되길 원한다. 그래야 한국어 콘텐츠를 제대로 찾는다.
8. 방문자로서, 나는 목록을 최신순/오래된순/수정최신순 등으로 정렬하고 싶다. 그래야 보고 싶은 순서로 본다.
9. 방문자로서, 나는 검색 결과를 관련도(RELEVANCE)순으로 볼 수 있길 원한다. 그래야 가장 잘 맞는 글이 위에 온다.
10. 방문자로서, 나는 목록을 페이지 단위로(limit/offset) 받고 전체 개수도 알고 싶다. 그래야 페이징 UI를 만들 수 있다.
11. 신규 User로서, 나는 가입(첫 인증)하면 별도 절차 없이 내 Member가 자동 생성되길 원한다. 그래야 바로 활동할 수 있다.
12. 신규 Member로서, 나는 기본 username·display_name이 내 인증 정보에서 적당히 만들어지길 원한다. 그래야 비어 있지 않다.
13. Member로서, 나는 내 username·display_name·프로필 이미지를 수정하고 싶다. 그래야 내 프로필을 관리한다.
14. Member로서, 나는 roles·status·email은 프로필 수정으로 못 바꾸길 원한다. 그래야 권한·상태가 사용자 손에 노출되지 않는다.
15. Member로서, 나는 username이 비었거나 50자를 넘으면 거부되길 원한다. 그래야 잘못된 값이 안 들어간다.
16. Member로서, 나는 다른 Member가 쓰는 username으로는 못 바꾸길 원한다. 그래야 핸들이 유일하다.
17. Member로서, 나는 새 Post를 작성하면서 Visibility를 고르고 싶다(기본 PUBLIC). 그래야 도달 범위를 내가 정한다.
18. Member로서, 나는 제목 없는/200자 초과/본문 없는 Post는 거부되길 원한다. 그래야 빈 글이 안 들어간다.
19. Author로서, 나는 내 Post를 수정(제목·본문·Visibility)하고 싶다. 그래야 글을 고친다.
20. Author로서, 나는 내 Post를 삭제하고 싶다. 그래야 글을 내린다.
21. Author로서, 나는 남의 Post는 수정·삭제할 수 없길 원한다. 그래야 소유권이 지켜진다.
22. Author로서, 나는 내 UNLISTED·PRIVATE Post가 내 목록 조회에는 보이길 원한다. 그래야 내가 쓴 모든 글을 관리한다.
23. Author로서, 나는 특정 Author의 글만 필터링해 목록을 보고 싶다. 그래야 한 사람의 글만 모아 본다.
24. BLOCKED Member로서, 나는 글 작성·수정·삭제와 프로필 수정이 차단되길(읽기는 가능) 원한다. 그래야 제재가 작동한다.
25. ADMIN으로서, 나는 모든 Member의 모든 Post를 목록·단건에서 볼 수 있길 원한다. 그래야 운영할 수 있다.
26. ADMIN으로서, 나는 다른 Member의 Post를 수정·삭제할 수 있길 원한다. 그래야 부적절한 글을 처리한다.
27. 시스템으로서, 나는 Member의 roles·status·username·display_name 변경이 JWT app_metadata로 자동 미러링되길 원한다. 그래야 인가가 토큰만으로 결정된다.
28. 개발자로서, 나는 `supabase db reset`으로 스키마 재적용 + 샘플 데이터 시드가 한 번에 되길 원한다. 그래야 로컬을 깨끗이 재현한다.
29. 개발자로서, 나는 스키마를 선언적으로 한 곳에서 보고 `db diff`로 마이그레이션을 생성하고 싶다. 그래야 변경이 흩어지지 않는다.

## Implementation Decisions

### 스키마 관리 방식 (선언적)
- Supabase 선언적 스키마 사용: `supabase/schemas/*.sql`에 최종 상태를 선언하고 `supabase db diff -f <name>`로 마이그레이션 생성. `config.toml`의 `[db.migrations].schema_paths`를 의존성 순서대로 설정(예: `10_enums` → `20_members` → `30_members_rls` → `40_member_profile` → `50_posts` → `60_posts_rls` → `70_post_rpc` → `80_search`).
- 기존 `20260525061812_create_posts.sql`(구 posts 스키마)은 prod이 없으므로 **폐기 후 재생성**한다(누적 ALTER 대신 깨끗한 마이그레이션).
- `drop`/`truncate` 프리앰블은 작성하지 않는다 — `db reset`이 재구축을 담당.
- migra가 못 잡는 항목은 보정한다: **샘플 데이터(DML)는 `seed.sql`로**, `auth.users`의 `on_auth_user_created` 트리거는 `db diff` 결과에 실제로 포함됐는지 1회 확인 후 빠지면 수동 마이그레이션으로, view의 `security_invoker`는 PG 기본값(false)이라 옵션을 생략해도 동작 동일.

### 모듈
- **M1 JWT 인가 프리미티브** — `current_member_id()`, `current_user_has_role(text)`, `current_user_is_active()`는 `auth.jwt() -> 'app_metadata'`만 읽는다(ADR-0003). `sync_member_metadata_to_auth` 트리거가 Member의 roles·username·display_name·status 변경 시 해당 User의 `raw_app_meta_data`로 미러링. 인가의 단일 진실원.
- **M2 Member 자동 프로비저닝** — `handle_new_user`가 `auth.users` insert마다 `members` 행 1건을 만든다(1:1). username은 display_name 정규화 + User id 일부로 생성. `members` 테이블: roles 기본 `['MEMBER']`, status 기본 `ACTIVE`, username/auth_user_id unique.
- **M3 Member 프로필** — `modify_member(username, display_name, profile_image_url)` `SECURITY DEFINER`. 로그인·ACTIVE 검사, 길이/필수 검증, 본인 행만 수정. roles·status·email·auth_user_id는 불변. `member_public_profiles` view(공개 컬럼만: id·username·display_name·profile_image_url)를 anon·authenticated에 노출.
- **M4 Post 작성 RPC** — `create_post`/`modify_post`/`delete_post` 모두 `SECURITY DEFINER`. 로그인·ACTIVE 검사, 제목(≤200)·본문 필수 검증. modify/delete는 Author 본인 또는 ADMIN만. delete는 삭제된 id 반환.
- **M5 Visibility 읽기** — `posts` 테이블 RLS `SELECT` 정책: `PUBLIC OR author_id=current_member_id() OR ADMIN`. 쓰기 정책은 전면 차단(쓰기는 M4 함수로만). `get_post(id)`는 `SECURITY DEFINER`로 RLS 우회해 PUBLIC+UNLISTED를 누구에게나 열고 PRIVATE는 Author/ADMIN만(ADR-0004). `get_posts(...)`는 `SECURITY DEFINER` 아님 → RLS 그대로. 둘 다 `member_public_profiles`를 조인해 Author 표시 정보 포함.
- **M6 검색** — `posts`에 pgroonga 인덱스(title+content 배열, TokenBigram). `get_posts(keyword, author_id, sort, limit, offset)`가 keyword 있으면 `&@~`로 필터하고 RELEVANCE 정렬 시 `pgroonga_score` 사용. `post_sort` enum(RELEVANCE / CREATED_AT_DESC/ASC / MODIFIED_AT_DESC/ASC). `total_count`를 윈도우 함수로 함께 반환.
- **M7 posts-data 어댑터(프론트)** — `fetchPosts`를 `supabase.rpc('get_posts', ...)`로 전환(ADR-0004). `Post` 타입에 `author`(username·displayName·profileImageUrl), `visibility` 추가, `content`를 non-null로. PostgREST 행 → camelCase 매핑 유지.

### enum / 스키마 변경
- 신규 enum: `role_type(SYSTEM,ADMIN,MEMBER)`, `member_status(ACTIVE,BLOCKED)`, `post_visibility(PUBLIC,UNLISTED,PRIVATE)`, `post_sort(...)`.
- `members` 신규 테이블 + gin(roles)·status 인덱스.
- `posts` 재정의: `author_id`(not null), `title varchar(200)`, `content`(not null), `visibility`(기본 PUBLIC) 추가. author_id·visibility·created_at·복합·PUBLIC 부분 인덱스 + pgroonga 인덱스.
- 확장: `pgcrypto`(extensions 스키마), `pgroonga`.

### 함수 규약
- RLS 우회 함수(`SECURITY DEFINER`)는 ADR-0001대로 `search_path` 고정 + 자체 인가 검사.
- 에러는 사용자 향 한국어 메시지로 `raise exception`.

## Testing Decisions

좋은 테스트는 **외부 동작만** 검증한다(함수 입출력·인가 결과·RLS 경계·반환 shape). 구현 디테일(특정 인덱스 사용 여부, 내부 변수)은 검증하지 않는다. ADR-0002가 명시한 "pgTAP는 첫 쓰기 함수와 함께 도입"의 시점이 바로 이 feature다.

- **pgTAP (신규 도입)** — SQL 함수·트리거 내부 로직: M1(JWT 헬퍼가 클레임을 올바른 id/boolean으로), M2(User insert → Member 1건·기본 roles/status), M3(modify_member 검증·불변 필드·본인만), M4(create/modify/delete의 검증·소유권·BLOCKED 차단·ADMIN 우회). 서로 다른 JWT 클레임을 set 해 역할/상태별 분기를 단언.
- **integration (Vitest, 로컬 스택)** — RLS는 보안 경계이므로 실제로(ADR-0002): anon이 PUBLIC만 목록 조회, UNLISTED는 목록에 없으나 `get_post`로 단건 가능, PRIVATE는 양쪽 차단, Author는 자기 UNLISTED/PRIVATE를 목록에서 봄, anon의 직접 INSERT/UPDATE/DELETE 거부. M6 검색(한글 부분 매칭·정렬·페이징·total_count). M7 `fetchPosts`가 새 shape(author·visibility) 반환. setup/teardown은 `service_role` 클라이언트.
- **fast (jsdom)** — 컴포넌트는 데이터 접근 seam(`fetchPosts`/RPC 래퍼)을 모킹(`supabase-js`는 모킹 안 함). 목록·로딩·에러·빈 상태 렌더.
- **기존 픽스처 수정** — `posts-access.integration.test.ts`의 `admin.from('posts').insert({title,content})`는 `author_id NOT NULL` 때문에 깨지므로, 시드된 Member id를 author_id로 넣도록 갱신.
- 프론트 테스트 명령: fast=`pnpm test`, integration=`pnpm test:integration`(사전 `supabase start`). pgTAP=`supabase test db`.

## Out of Scope

- 인증 UI(가입·로그인·로그아웃·세션) 화면 — 백엔드 신원/프로비저닝만. 첫 멀티스텝 인증 플로우는 별도 wave(ADR-0002의 E2E 보류와 연동).
- Post 작성·수정·삭제 **UI 폼** — 본 PRD는 백엔드 RPC + 목록 읽기 어댑터까지. 쓰기 화면은 후속.
- 프로필 페이지·Author별 목록 **UI**.
- UNLISTED의 추측 불가능 토큰/슬러그(현재 id 기반, ADR-0004).
- 즉시 권한 회수(JWT 지연 수용, ADR-0003). 강제 토큰 폐기 흐름.
- 댓글·신고·모더레이션 워크플로, 실시간 구독, 첨부/이미지 업로드, 페이지네이션 UI.
- E2E(Playwright) — ADR-0002대로 보류.

## Further Notes

- 행동 변화: 새 RLS에서 anon의 `/` 목록은 **PUBLIC만** 반환한다(현 시드의 UNLISTED/PRIVATE는 목록에서 사라짐). 의도된 변경.
- 프론트는 현재 RPC를 전혀 안 쓴다 — M7 전환이 읽기 경로의 첫 RPC 사용.
- pgroonga는 `config.toml`에 명시되어 있지 않다(Supabase postgres 이미지에 번들). pgroonga vs native FTS의 정식 선택 근거는 검색 슬라이스(S3) 시점에 ADR로 남길지 결정(현재 보류).
- 슬라이싱: S1(M1·M2·M3) → S2(M4·M5) → S3(M6), M7은 읽기 경로가 준비되는 S2/S3에 맞춰 전환. `/to-issues`에서 tracer-bullet 수직 슬라이스로 분해.
- 관련 결정: ADR-0001(읽기 RLS·쓰기 함수), ADR-0002(테스트 전략·pgTAP 도입 시점), ADR-0003(JWT 인가·지연), ADR-0004(visibility 읽기 분기·목록 RPC 전환). 용어: CONTEXT.md.
