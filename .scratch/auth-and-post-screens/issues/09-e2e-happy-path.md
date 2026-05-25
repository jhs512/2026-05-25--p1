# E2E happy path (Playwright 도입)

Status: done

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

ADR-0002가 "첫 멀티스텝 인증·글쓰기 플로우와 함께 도입"이라 명시한 E2E를 이번에 들인다. integration이 데이터 경로를 덮으므로 E2E는 빌드/배선 충실도를 보는 **얇은 happy path 1개**.

- **Playwright 도입**: 의존성 + 설정(로컬 Supabase 스택 기동 전제, dev 서버 대상). 실행 명령(예: `pnpm test:e2e`) 정비.
- **happy path 시나리오**: 회원가입 → (자동 로그인) → 글쓰기(PUBLIC) → `/` 목록에서 방금 쓴 글 확인 → 상세 진입 확인. 작성자 표시·내용 검증.

## Acceptance criteria

- [ ] Playwright가 설정되고 단일 명령으로 E2E를 실행할 수 있다(로컬 스택 + dev 서버 전제).
- [ ] 가입 → 글쓰기 → 목록/상세 확인 happy path가 통과한다.
- [ ] 실패 시 어디서 깨졌는지 알 수 있다(스크린샷/트레이스).
- [ ] fast/integration 스위트와 분리되어 매 저장/CI를 막지 않는다(별도 명령).

## Blocked by

- `02-signup`
- `03-post-detail`
- `04-write-post`
