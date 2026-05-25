# Member 자동 프로비저닝 + JWT 인가 미러

Status: done

## Parent

`.scratch/members-authored-posts/PRD.md`

## What to build

User(인증 신원)가 처음 생기는 순간 그에 1:1로 묶인 Member(도메인 프로필)가 자동으로 만들어지고, Member의 roles·status·username·display_name이 해당 User의 JWT `app_metadata`로 미러링되어 이후 모든 인가가 토큰만으로 결정되도록 한다(ADR-0003). 이 슬라이스는 동시에 **선언적 스키마 워크플로를 부트스트랩**한다.

- `role_type(SYSTEM,ADMIN,MEMBER)`, `member_status(ACTIVE,BLOCKED)` enum.
- `members` 테이블: User에 대한 unique 연결, username unique, display_name, profile_image_url, roles(기본 `[MEMBER]`)·status(기본 `ACTIVE`), 타임스탬프. roles·status 인덱스, modified_at 자동 갱신 트리거.
- `handle_new_user` 트리거: `auth.users` insert마다 Member 1건 생성. username은 display_name 정규화 + User id 일부로, 비면 인증 정보에서 적당히 생성.
- `sync_member_metadata_to_auth` 트리거: roles·username·display_name·status 변경 시 User의 `raw_app_meta_data`로 미러링.
- JWT 헬퍼: `current_member_id()`, `current_user_has_role(text)`, `current_user_is_active()` — `auth.jwt() -> 'app_metadata'`만 읽음.
- `members` RLS: 본인 또는 ADMIN만 SELECT, 직접 INSERT/UPDATE/DELETE는 전면 차단.

선언적 부트스트랩:
- `supabase/schemas/`에 위 객체를 의존성 순서 파일로 선언하고 `config.toml`의 `[db.migrations].schema_paths`를 그 순서로 설정.
- 기존 `20260525061812_create_posts.sql`은 폐기하고 `supabase db diff`로 새 마이그레이션 생성.
- `seed.sql`을 테스트 유저 생성 방식으로 교체(샘플 글은 후속 슬라이스에서 추가).
- `db diff` 결과에 `auth.users` 트리거가 실제 포함됐는지 확인하고, 빠졌으면 그 트리거만 수동 마이그레이션으로 보정.

## Acceptance criteria

- [ ] `supabase db reset`이 선언적 스키마 + seed로 깨끗이 재구축된다(`drop`/`truncate` 프리앰블 없이).
- [ ] User가 생성되면 대응하는 `members` 행이 자동으로 1건 생긴다(roles 기본 `[MEMBER]`, status 기본 `ACTIVE`).
- [ ] Member의 roles·status·username·display_name을 바꾸면 그 User의 JWT `app_metadata`에 반영된다.
- [ ] JWT 클레임에 따라 `current_member_id`/`current_user_has_role`/`current_user_is_active`가 올바른 값을 반환한다(로그인 안 됨·ADMIN·BLOCKED 케이스 포함).
- [ ] anon 및 타인은 `members`를 직접 SELECT할 수 없고, 본인·ADMIN만 가능하다. 직접 INSERT/UPDATE/DELETE는 모두 거부된다.
- [ ] pgTAP 테스트가 위 트리거·헬퍼 동작을 커버한다(`supabase test db`).
- [ ] `db diff`가 `auth.users` 트리거를 포함하는지 검증된 결과가 마이그레이션에 반영돼 있다.

## Blocked by

None - can start immediately
