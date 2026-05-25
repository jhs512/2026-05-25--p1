# PRD — 인증과 Post 화면 (auth-and-post-screens)

Status: ready-for-agent

## Problem Statement

백엔드에는 Member·인증·Post 작성/수정/삭제·검색·visibility가 모두 있지만, 사용자가 만날 화면이 없다. 지금 SPA는 `/`에서 PUBLIC Post 목록만 보여줄 뿐, 로그인할 수도, 글을 쓸 수도, 내 글이나 프로필을 관리할 수도 없다. 방문자는 게시판을 "읽기"만 할 수 있고 "참여"할 수 없다.

## Solution

SPA에 인증 계층과 Post 화면들을 올린다. 방문자는 이메일+비밀번호로 **회원가입**(가입 즉시 로그인)하고 **로그인/로그아웃**한다. 로그인한 **Member**는 **글쓰기/수정/삭제**, **내정보**(username·display_name·프로필 이미지) 편집, **내글 보기**(UNLISTED·PRIVATE 포함)를 할 수 있다. 누구나 **상세 페이지**로 Post를 읽고(visibility는 `get_post`가 게이트), `/` 목록에서 **검색**·정렬한다. 인증은 `supabase.auth`(anon 키), 인가 경계는 RLS와 SQL 함수 그대로(ADR-0001).

## User Stories

1. 방문자로서, 나는 이메일·비밀번호·표시이름으로 회원가입하고 싶다. 그래야 게시판에 참여할 수 있다.
2. 신규 User로서, 나는 가입하면 확인메일 없이 바로 로그인 상태가 되길 원한다. 그래야 즉시 글을 쓸 수 있다.
3. 신규 Member로서, 나는 가입 시 정한 표시이름이 내 글에 보이길 원한다. 그래야 처음부터 의미 있는 이름이 뜬다.
4. 방문자로서, 나는 이메일·비밀번호로 로그인하고 싶다. 그래야 내 계정으로 활동한다.
5. 방문자로서, 나는 잘못된 자격증명·중복 이메일·약한 비밀번호에 명확한 오류 메시지를 보고 싶다. 그래야 무엇이 틀렸는지 안다.
6. Member로서, 나는 로그아웃하고 싶다. 그래야 세션을 끝낸다.
7. 사용자로서, 나는 헤더에서 로그인 상태에 따라 알맞은 메뉴(비로그인: 로그인·회원가입 / 로그인: 글쓰기·내글·내정보·로그아웃)를 보고 싶다.
8. 이미 로그인한 사용자로서, 나는 `/login`·`/signup`에 가면 `/`로 되돌아가길 원한다.
9. Member로서, 나는 인증이 필요한 화면(`/me`, `/posts/new`, 수정, `/me/posts`)에 비로그인으로 접근하면 로그인 화면으로 보내지고, 로그인 후 원래 가려던 곳으로 복귀하길 원한다.
10. Member로서, 나는 내정보 페이지에서 username·display_name·프로필 이미지를 수정하고 싶다. 그래야 프로필을 관리한다.
11. Member로서, 나는 username이 비었거나 50자 초과거나 이미 쓰는 값이면 거부되는 걸 알고 싶다. 그래야 고칠 수 있다.
12. Member로서, 나는 글쓰기 화면에서 제목·내용을 쓰고 Visibility(공개/링크 공개/비공개)를 골라 게시하고 싶다.
13. Member로서, 나는 제목이 비었거나 200자 초과거나 내용이 비면 거부되는 걸 알고 싶다.
14. Author로서, 나는 내 글을 수정(제목·내용·Visibility)하고 싶다.
15. Author로서, 나는 내 글을 삭제하고 싶고, 실수 방지를 위해 확인 절차를 원한다.
16. Author로서, 나는 상세·내글 화면에서 내 글에만 수정·삭제 버튼이 보이길 원한다.
17. 일반 Member로서, 나는 남의 글에는 수정·삭제 버튼이 안 보이고, 설령 시도해도 거부되길 원한다.
18. ADMIN으로서, 나는 임의 글의 수정·삭제를 할 수 있길 원한다.
19. 방문자로서, 나는 상세 페이지에서 PUBLIC·UNLISTED Post를 링크로 읽고 싶다.
20. 방문자로서, 나는 PRIVATE Post의 상세에 접근하면 "없음/권한 없음"으로 처리되길 원한다.
21. 사용자로서, 나는 상세 페이지에서 제목·내용·작성자(display_name·@username)·작성/수정 시각을 보고 싶다.
22. 방문자로서, 나는 `/` 목록에서 키워드로 검색하고 싶다(제목·본문, 한글 부분매칭). 그래야 원하는 글을 찾는다.
23. 방문자로서, 나는 검색·정렬 상태가 URL(`?q=&sort=`)에 남아 공유·새로고침해도 유지되길 원한다.
24. 방문자로서, 나는 정렬(최신/오래된/수정순/관련도)을 고르고 싶다.
25. Member로서, 나는 내글 보기에서 내가 쓴 모든 글(UNLISTED·PRIVATE 포함)을 visibility 표시와 함께 보고 싶다.
26. Member로서, 나는 내글·상세에서 수정/삭제로 바로 이동하고 싶다.
27. 사용자로서, 나는 로딩·에러·빈 상태가 모든 화면에서 명확히 보이길 원한다.

## Implementation Decisions

### 인증·세션
- 이메일+비밀번호만, 확인메일 off(ADR-0005). 가입 직후 JWT에 `member_id`·roles·status가 실림(실증 확인) → 가입 직후 글쓰기에 토큰 갱신 불필요.
- **M1 Session**: `supabase.auth`를 감싸는 앱 소유 seam — signUp/signInWithPassword/signOut/getSession/onAuthStateChange. 현재 사용자(`currentMember`: member_id·username·display_name·roles·status)는 **JWT app_metadata 클레임에서 도출**(DB 조회 없음, ADR-0003). 라우터 구동 전 세션 초기화, onAuthStateChange로 갱신.
- **M2 auth-guard**: `beforeLoad`용 `requireSession`(미인증→`/login?redirect=`), `redirectIfAuthed`(로그인 상태면 `/`). 라우트 게이트 방식은 ADR-0006.

### 라우트
- 공개: `/`(목록+검색), `/posts/$id`(상세), `/signup`, `/login`.
- 인증 필요: `/me`(내정보+로그아웃), `/posts/new`, `/posts/$id/edit`, `/me/posts`.
- 상세의 Visibility는 라우트가 아니라 `get_post`(ADR-0004)가 데이터 레벨에서 강제.

### 데이터 접근
- **M3 members-data**: `fetchMyMember`(본인 행 — profile_image_url 등 클레임에 없는 값), `modifyMember(username, display_name, profile_image_url)` mutation.
- **M4 posts-data(확장)**: `fetchPosts`를 keyword·sort·authorId·limit·offset로 일반화(현재 하드코딩 제거), `fetchPost(id)`=get_post, `createPost`/`modifyPost`/`deletePost` mutation. 모두 기존 매핑(snake→camel) 유지.
- 쓰기는 **@tanstack/react-query mutation**, 읽기는 queryOptions 패턴. 성공 시 관련 쿼리 무효화.

### UI
- **M5 zod 스키마**: signup/login/profile/post 입력 검증(클라이언트 1차; 권위는 서버 RPC/제약).
- **M6**: 루트 레이아웃+세션 반응형 Nav, SignupForm, LoginForm, ProfileForm, **PostForm(생성·수정 공유, 모드 분기)**, PostDetail, MyPosts, SearchBar.
- 폼은 **@tanstack/react-form + zod 검증 어댑터**. Visibility 셀렉터 라벨: 공개(PUBLIC)/링크 공개(UNLISTED)/비공개(PRIVATE) + 설명 문구.
- 작성자/ADMIN 판정은 `currentMember`로 버튼 노출을 제어하되, 실제 강제는 modify/delete_post가 담당(노출은 편의, 경계는 서버).

## Testing Decisions

좋은 테스트는 외부 동작만 본다(폼이 유효/무효를 가르는 결과, 데이터 접근이 올바른 shape·인가 결과를 반환하는지, 화면의 상태 전이). 내부 구현(특정 훅·상태 모양)은 보지 않는다. `supabase-js`는 모킹하지 않는다(ADR-0002) — 우리 seam(M1/M3/M4)만 모킹한다.

- **fast (jsdom)**: M5 스키마(유효/무효 파싱), M6 폼·Nav·상태(로딩/에러/빈/데이터) — M1/M3/M4 seam 모킹. 작성자 여부에 따른 버튼 노출. prior art: `PostsPage.test.tsx`(seam 모킹 패턴).
- **integration (실제 스택, Vitest)**: M3·M4를 실제 RPC에 대해 — 인증 클라이언트로 signUp→세션→create_post→get_post→modify_post→delete_post, modify_member 검증·중복, get_post의 PUBLIC/UNLISTED/PRIVATE 분기. service_role은 setup/teardown. prior art: `posts-access.integration.test.ts`.
- **E2E (Playwright, 신규 도입)**: ADR-0002가 "첫 멀티스텝 인증·글쓰기 플로우와 함께 도입"이라 명시 — 이번이 그 시점. **얇은 happy path 1개**: 회원가입 → 글쓰기 → `/` 목록/상세에서 확인. 빌드/배선 충실도까지 본다.

## Out of Scope

- 소셜/OAuth 로그인, 비밀번호 재설정·찾기, MFA, 이메일 변경(ADR-0005).
- 가입 시 username 직접 선택(백엔드 변경 필요 — username은 자동 생성, `/me`에서 편집).
- 댓글, 실시간 구독, 이미지/첨부 업로드, 알림.
- 본격 페이지네이션 UI(데이터 경로는 limit/offset·total_count 지원, UI는 기본 수준).
- ADMIN 전용 운영/모더레이션 화면(권한은 동작하되 별도 UI 없음).

## Further Notes

- **Playwright 신규 의존성**: E2E 도입에 Playwright + 설정(로컬 스택 기동 전제)이 추가된다. integration이 데이터 경로를 덮으므로 E2E는 happy path 최소.
- `currentMember`는 JWT 클레임에서 읽는다 — 신원 표시·버튼 노출에 별도 members 조회 불필요(profile_image_url 등 편집용 값만 `fetchMyMember`).
- 가입 후 `/`로 이동(로그인 상태 메인). `/login`·`/signup`은 이미 로그인 시 `/`로.
- 행동 변화 없음(읽기 경로는 S06에서 이미 get_posts RPC). 이번엔 쓰기·인증 경로 신설.
- 관련 결정: ADR-0001(읽기 RLS·쓰기 함수), ADR-0002(테스트 전략·E2E 도입 시점), ADR-0003(JWT 인가), ADR-0004(visibility 읽기), ADR-0005(이메일+비번 인증), ADR-0006(라우트 보호). 용어: CONTEXT.md.
- 슬라이싱: `/to-issues`에서 화면별(또는 인증→상세→쓰기→내정보→내글→검색→E2E) tracer-bullet으로 분해.
