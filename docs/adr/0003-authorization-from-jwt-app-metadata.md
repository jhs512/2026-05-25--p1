---
status: accepted
---

# 인가는 JWT에서 읽고, Member로부터 미러링한다

Member의 `roles`와 `status`는 해당 컬럼이 바뀔 때마다 동작하는 트리거에 의해 배후 User의 JWT `app_metadata`로 미러링된다. 모든 인가 검사 — RLS `SELECT` 정책과 `SECURITY DEFINER` 쓰기/읽기 함수 모두 — 는 현재 Member id·roles·status를 요청 시점에 `members` 행을 조회하는 대신 JWT(`auth.jwt() -> 'app_metadata'`)에서 가져온다. 이로써 인가는 stateless하고 요청당 DB 읽기가 없으며, 백엔드 없이 RLS를 경계로 삼는 설계(ADR-0001)와 일관된다. 이미 스코프에 있는 `auth.jwt()` 한 번의 호출이 "이게 누구이고 무엇을 할 수 있는가"에 답한다.

## 검토한 대안

- **요청당 `members` 조회** (각 정책·함수에서) — 기각: 모든 인가 작업에 읽기(및 조인)를 추가하고, JWT 미러링이 없애려던 "인가가 테이블 쿼리에 결합되는" 문제를 다시 끌어들인다.

## 결과

- **인가는 토큰만큼만 최신이다.** 권한 부여(예: Member를 `ADMIN`으로 승격)나 `BLOCKED` 상태 변경은 해당 User의 **다음 토큰 refresh** 시점 — 최대 액세스 토큰 수명만큼 지연 — 에야 반영된다. 트리거는 `app_metadata`를 즉시 갱신하지만, 이미 발급된 JWT는 refresh 전까지 옛 클레임을 유지한다.
- 이 지연은 **수용**한다: `BLOCKED`는 쓰기만 막고(읽기는 어차피 공개 콘텐츠, CONTEXT.md 참고), 즉각적 권한 회수는 요구사항이 아니다. 만약 그것이 요구사항이 된다면, 탈출구는 강제 토큰 폐기 또는 민감 경로에서의 요청당 status 검사이지, 공통 경로의 재설계가 아니다.
