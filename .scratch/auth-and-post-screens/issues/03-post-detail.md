# 상세 페이지

Status: done

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

누구나 Post 단건을 링크로 읽는 상세 화면. Visibility는 `get_post`(ADR-0004)가 데이터 레벨에서 강제한다.

- **`/posts/$id`**: `fetchPost(id)`=get_post로 단건 조회. PUBLIC·UNLISTED는 표시, PRIVATE(작성자·ADMIN 아님)는 "없음/권한 없음" 처리.
- 제목·내용·작성자(display_name·@username)·작성/수정 시각 표시.
- `currentMember`가 작성자이거나 ADMIN이면 수정·삭제 버튼 노출(실제 동작은 후속 슬라이스; 여기선 노출 + 라우팅 자리). 노출은 편의일 뿐, 경계는 서버 RPC.
- 로딩·에러·없음 상태.

## Acceptance criteria

- [ ] PUBLIC·UNLISTED Post의 상세가 링크(id)로 열린다.
- [ ] 비작성자/비ADMIN이 PRIVATE Post 상세에 접근하면 "없음/권한 없음"이 표시된다.
- [ ] 작성자·ADMIN에게만 수정·삭제 진입 버튼이 보인다(그 외엔 숨김).
- [ ] 작성자 표시정보·시각이 보인다.
- [ ] fast 테스트: 상태(로딩/에러/없음/표시), 작성자 여부에 따른 버튼 노출 — 데이터 seam 모킹.

## Blocked by

- `01-auth-shell-and-login`
