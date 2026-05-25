# 내정보

Status: done

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

로그인한 Member가 자기 프로필을 보고 편집한다.

- **`/me`**(보호): `fetchMyMember`로 본인 행 조회(profile_image_url 등 클레임에 없는 값 포함), ProfileForm으로 username·display_name·profile_image_url 편집 → `modifyMember` → modify_member RPC. 로그아웃 버튼.
- @tanstack/react-form + zod. 성공 시 갱신 반영(클레임/표시명이 다음 토큰 refresh에 반영됨은 ADR-0003 — UI는 낙관적/재조회로 즉시 표시).
- username 필수·≤50, display_name 필수·≤50, 중복 username 거부 오류.

## Acceptance criteria

- [ ] `/me`에서 현재 username·display_name·프로필 이미지가 보인다.
- [ ] 편집 후 저장하면 modify_member로 반영된다.
- [ ] 빈/50자 초과 username·display_name, 중복 username은 거부되고 오류가 보인다.
- [ ] roles·status·email은 이 화면에서 바뀌지 않는다.
- [ ] 로그아웃 버튼이 동작한다.
- [ ] 미인증 접근 시 로그인으로 보내진다.
- [ ] fast 테스트: ProfileForm 검증·제출, 로그아웃 — seam 모킹.

## Blocked by

- `01-auth-shell-and-login`
