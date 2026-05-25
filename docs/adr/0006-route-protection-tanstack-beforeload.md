---
status: accepted
---

# 보호 라우트는 TanStack Router `beforeLoad` + 라우터 context로 게이트한다

인증이 필요한 화면(`/me`, `/posts/new`, `/posts/$id/edit`, `/me/posts`)은 TanStack Router의 `beforeLoad`에서 라우터 context의 인증 상태를 확인하고, 미인증이면 `throw redirect({ to: '/login', search: { redirect } })`로 로그인 화면으로 보낸다(로그인 후 원래 경로로 복귀). 인증 상태의 출처는 `supabase.auth`(getSession + onAuthStateChange)를 감싼 모듈이며, 라우터 생성 시 context로 주입하고 onAuthStateChange로 갱신한다.

공개 화면(`/`, `/posts/$id`, `/signup`, `/login`, 검색)은 라우트 게이트가 없다 — 상세의 Visibility는 라우트가 아니라 `get_post`가 데이터 레벨에서 강제한다(ADR-0004).

## 검토한 대안

- **컴포넌트 레벨 가드**(각 페이지에서 `useEffect`로 세션 확인 후 리다이렉트) — 기각: 라우트 진입 전에 막지 못해 보호 화면이 잠깐 깜빡이고, 가드 로직이 페이지마다 중복된다.

## 결과

- 라우터 context에 인증을 주입해야 하므로, 라우터 구동 전에 세션 초기화(getSession)가 선행되어야 한다.
- onAuthStateChange 발생 시 라우터 context를 갱신·무효화해 보호 라우트 판정이 최신 세션을 따르게 한다.
- 로그인/회원가입 화면은 반대로, 이미 세션이 있으면 `/`로 되돌린다.
