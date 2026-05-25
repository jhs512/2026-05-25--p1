# 내글 보기

Status: done

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

로그인한 Member가 자기가 쓴 모든 글(UNLISTED·PRIVATE 포함)을 한눈에 본다.

- **`/me/posts`**(보호): `fetchPosts`에 `authorId=currentMember.member_id`를 넘겨 호출. 작성자라 RLS가 본인의 UNLISTED·PRIVATE도 반환한다.
- 각 글에 Visibility 뱃지(공개/링크 공개/비공개) 표시, 수정·삭제 진입 링크(동작은 슬라이스 05).
- 로딩·에러·빈("아직 쓴 글이 없습니다") 상태.

## Acceptance criteria

- [ ] 본인이 쓴 글이 visibility와 무관하게 모두(PUBLIC·UNLISTED·PRIVATE) 보인다.
- [ ] 각 글에 visibility 뱃지가 표시된다.
- [ ] 글이 없으면 빈 상태가 보인다.
- [ ] 미인증 접근 시 로그인으로 보내진다.
- [ ] 수정·삭제로 이동하는 링크가 있다.
- [ ] fast 테스트: 목록·뱃지·빈 상태 — 데이터 seam 모킹.

## Blocked by

- `01-auth-shell-and-login`
