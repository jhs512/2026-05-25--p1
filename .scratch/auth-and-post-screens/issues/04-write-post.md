# 글쓰기

Status: ready-for-agent

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

로그인한 Member가 제목·내용·Visibility를 정해 새 Post를 작성한다.

- **`/posts/new`**(보호 라우트): PostForm 생성 모드 + Visibility 셀렉터(공개/링크 공개/비공개). @tanstack/react-form + zod.
- `createPost(title, content, visibility)` mutation(react-query) → create_post RPC. 성공 시 목록 쿼리 무효화 + 작성된 글 상세(또는 `/`)로 이동.
- 제목 필수·≤200, 내용 필수 검증(클라이언트 1차, 권위는 서버).

## Acceptance criteria

- [ ] 로그인 Member가 PUBLIC/UNLISTED/PRIVATE Post를 작성하면 저장되고 작성자가 본인으로 설정된다.
- [ ] 빈 제목·200자 초과·빈 내용은 거부되고 오류가 보인다.
- [ ] 미인증으로 `/posts/new` 접근 시 로그인으로 보내진다.
- [ ] 작성 성공 후 목록/상세에 반영된다(쿼리 무효화).
- [ ] fast 테스트: PostForm(생성) 검증·Visibility 선택·성공 시 seam 호출.

## Blocked by

- `01-auth-shell-and-login`
