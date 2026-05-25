# 인증 골격 + 로그인

Status: ready-for-agent

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

SPA에 인증 계층의 뼈대를 세우고 로그인/로그아웃을 동작시킨다. 로그인하면 헤더 메뉴가 바뀌고, 보호 라우트 진입 시 미인증이면 로그인으로 보내진다.

- **Session 모듈(M1)**: `supabase.auth`를 감싸 `signInWithPassword`/`signOut`/`getSession`/`onAuthStateChange`를 노출하고, JWT app_metadata 클레임에서 `currentMember`(member_id·username·display_name·roles·status)를 도출(DB 조회 없음, ADR-0003). 라우터 구동 전 세션 초기화 + onAuthStateChange로 갱신해 라우터 context에 주입.
- **auth-guard(M2)**: `beforeLoad`용 `requireSession`(미인증 → `/login?redirect=`), `redirectIfAuthed`(로그인 상태면 `/`). 방식은 ADR-0006.
- **루트 레이아웃 + Nav**: 세션 상태에 따라 메뉴 전환(비로그인: 로그인·회원가입 / 로그인: 글쓰기·내글·내정보·로그아웃).
- **`/login`**: 이메일+비밀번호 폼(@tanstack/react-form + zod), 로그인 후 `redirect` 또는 `/`로. 자격증명 오류 메시지 표시. 이미 로그인 상태면 `/`로.

## Acceptance criteria

- [ ] 시드 사용자(예: user1@no-reply.com)로 로그인하면 세션이 생기고 Nav가 로그인 메뉴로 바뀐다.
- [ ] 로그아웃하면 세션이 사라지고 Nav가 비로그인 메뉴로 돌아간다.
- [ ] 잘못된 자격증명은 명확한 오류 메시지를 보인다.
- [ ] 보호 라우트(placeholder 또는 후속 화면)에 미인증 접근 시 `/login?redirect=`로 이동하고, 로그인 후 원래 경로로 복귀한다.
- [ ] 이미 로그인 상태에서 `/login` 접근 시 `/`로 보내진다.
- [ ] `currentMember`가 별도 DB 조회 없이 JWT 클레임에서 도출된다.
- [ ] fast 테스트: LoginForm(검증·오류·성공 시 seam 호출), Nav 상태 전이 — Session/데이터 seam 모킹, supabase-js 모킹 안 함(ADR-0002).

## Blocked by

None - can start immediately
