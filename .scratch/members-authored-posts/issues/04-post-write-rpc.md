# Post 작성·수정·삭제 RPC

Status: done

## Parent

`.scratch/members-authored-posts/PRD.md`

## What to build

로그인한 ACTIVE Member가 Post를 작성·수정·삭제할 수 있게 한다. 모든 쓰기는 `SECURITY DEFINER` 함수로만 가능하며(ADR-0001), 직접 테이블 DML은 슬라이스 3에서 이미 차단돼 있다.

- `create_post(title, content, visibility=PUBLIC)`: 로그인·ACTIVE 검사, 제목(필수·≤200)·본문(필수) 검증, Author=현재 Member로 생성, 생성된 Post 반환.
- `modify_post(post_id, title, content, visibility)`: 동일 검증 + Author 본인 또는 ADMIN만 수정. 대상 없거나 권한 없으면 에러.
- `delete_post(post_id)`: 로그인·ACTIVE 검사 + Author 본인 또는 ADMIN만 삭제, 삭제된 id 반환. 대상 없거나 권한 없으면 에러.
- 모두 `search_path` 고정 + 자체 인가 + 사용자 향 한국어 에러 메시지.

## Acceptance criteria

- [ ] 로그인한 ACTIVE Member가 PUBLIC·UNLISTED·PRIVATE Post를 작성할 수 있고, Author가 본인으로 설정된다.
- [ ] 제목이 비었거나 200자 초과, 본문이 비면 작성·수정이 거부된다.
- [ ] Author 본인은 자기 Post를 수정·삭제할 수 있다.
- [ ] 다른 Member의 Post는 수정·삭제할 수 없다(에러).
- [ ] ADMIN은 임의 Member의 Post를 수정·삭제할 수 있다.
- [ ] 비로그인·BLOCKED Member의 작성·수정·삭제는 모두 거부된다.
- [ ] `delete_post`는 삭제된 Post의 id를 반환한다.
- [ ] pgTAP가 검증·소유권·ADMIN 우회·BLOCKED 차단을, integration이 로그인 클라이언트의 end-to-end 작성→조회를 커버한다.

## Blocked by

- `01-member-provisioning-jwt-authz`
- `03-post-author-visibility-reads`
