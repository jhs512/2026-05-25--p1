# 수정·삭제

Status: done

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

작성자(또는 ADMIN)가 자기 Post를 수정·삭제한다. PostForm을 생성/수정 공유 모드로 확장한다.

- **`/posts/$id/edit`**(보호): PostForm 수정 모드 — 기존 값 프리필(get_post), `modifyPost(id, title, content, visibility)` → modify_post RPC. 성공 시 상세로 복귀 + 쿼리 무효화.
- **삭제**: 상세/내글에서 삭제 버튼 → 확인 후 `deletePost(id)` → delete_post RPC. 성공 시 목록/내글로 이동 + 무효화.
- 권한: 버튼 노출은 `currentMember`(작성자·ADMIN)로 제어하되 실제 강제는 modify/delete_post. 비권한 시도는 서버가 거부 → 오류 표시.

## Acceptance criteria

- [ ] 작성자가 자기 글을 수정(제목·내용·Visibility)하면 반영된다.
- [ ] 작성자가 자기 글을 삭제하면(확인 후) 사라지고 목록/내글에서 빠진다.
- [ ] 타인은 수정·삭제 버튼이 안 보이고, 강제 시도해도 서버가 거부한다.
- [ ] ADMIN은 임의 글을 수정·삭제할 수 있다.
- [ ] 삭제는 확인 절차를 거친다.
- [ ] fast 테스트: PostForm(수정) 프리필·제출, 삭제 확인 흐름 — seam 모킹.

## Blocked by

- `03-post-detail`
- `04-write-post`
