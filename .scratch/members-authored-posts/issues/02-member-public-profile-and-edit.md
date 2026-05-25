# Member 공개 프로필 + 프로필 수정

Status: done

## Parent

`.scratch/members-authored-posts/PRD.md`

## What to build

Member의 민감하지 않은 공개 컬럼만 누구에게나 노출하고, Member 본인이 자기 프로필을 안전하게 수정할 수 있게 한다.

- `member_public_profiles` view: `members`의 공개 컬럼(id·username·display_name·profile_image_url)만 노출하고 anon·authenticated에 읽기 허용. members 테이블의 RLS를 우회해 공개 컬럼을 열어준다(view 소유자 권한; PG 기본 동작이라 별도 옵션 불필요).
- `modify_member(username, display_name, profile_image_url)` RPC(`SECURITY DEFINER`, `search_path` 고정, 자체 인가 — ADR-0001): 로그인·ACTIVE 검사, username·display_name 필수·길이(≤50) 검증, 본인 행만 수정. roles·status·email·auth_user_id는 이 함수로 절대 바뀌지 않는다. 중복 username은 거부된다.

## Acceptance criteria

- [ ] anon이 `member_public_profiles`에서 공개 컬럼을 읽을 수 있고, 그 외 민감 컬럼(roles·status·email·auth_user_id)은 노출되지 않는다.
- [ ] 로그인한 ACTIVE Member가 `modify_member`로 자기 username·display_name·profile_image_url을 수정할 수 있다.
- [ ] 비로그인·BLOCKED 호출은 거부된다.
- [ ] username/display_name이 비었거나 50자를 넘으면 거부된다.
- [ ] 다른 Member가 쓰는 username으로의 변경은 거부된다.
- [ ] `modify_member`로 roles·status·email·auth_user_id는 변경되지 않는다.
- [ ] pgTAP가 검증·불변필드·본인한정·BLOCKED 차단을, integration이 anon의 공개 프로필 읽기를 커버한다.

## Blocked by

- `01-member-provisioning-jwt-authz`
