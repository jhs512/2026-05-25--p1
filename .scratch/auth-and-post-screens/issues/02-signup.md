# 회원가입

Status: ready-for-agent

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

방문자가 이메일·비밀번호·표시이름으로 가입하고, 확인메일 없이 즉시 로그인 상태가 되어 메인으로 진입한다(ADR-0005).

- **`/signup`**: 이메일+비밀번호+표시이름 폼(@tanstack/react-form + zod). `signUp({ email, password, options: { data: { name: displayName } } })`로 가입 → 표시이름이 Member에 반영(handle_new_user). username은 자동 생성.
- 가입 성공 → 세션이 생기고 `/`로 이동. 이미 로그인 상태면 `/`로.
- 중복 이메일·약한 비밀번호(최소 6자) 등 오류 메시지 표시.

## Acceptance criteria

- [ ] 새 이메일로 가입하면 대응 Member가 생기고(자동 프로비저닝), 입력한 표시이름이 display_name으로 반영된다.
- [ ] 가입 직후 로그인 상태가 되어 `/`로 이동하고, 바로 글쓰기 등 인증 동작이 가능하다(JWT에 member_id 존재).
- [ ] 이미 쓰는 이메일·6자 미만 비밀번호는 거부되고 오류가 보인다.
- [ ] 이미 로그인 상태에서 `/signup` 접근 시 `/`로 보내진다.
- [ ] fast 테스트: SignupForm 검증(이메일 형식·비밀번호 길이·표시이름 필수)·성공 시 seam 호출.

## Blocked by

- `01-auth-shell-and-login`
