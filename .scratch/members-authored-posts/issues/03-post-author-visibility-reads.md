# Post Author·Visibility + 기본 목록/단건 읽기

Status: done

## Parent

`.scratch/members-authored-posts/PRD.md`

## What to build

Post에 Author와 Visibility를 도입하고, Visibility 규칙을 반영한 목록·단건 읽기를 제공한다(검색은 후속 슬라이스). 읽기 분기는 ADR-0004를 따른다.

- `post_visibility(PUBLIC,UNLISTED,PRIVATE)`, `post_sort(RELEVANCE,CREATED_AT_DESC,CREATED_AT_ASC,MODIFIED_AT_DESC,MODIFIED_AT_ASC)` enum.
- `posts` 테이블 재정의: `author_id`(not null, Member 참조), `title varchar(200)`(not null), `content`(not null), `visibility`(기본 PUBLIC), 타임스탬프. author_id·visibility·created_at·복합(author+created)·PUBLIC 부분 인덱스. modified_at 자동 갱신 트리거(title·content·visibility 변경 시).
- `posts` RLS: SELECT는 `PUBLIC OR author_id=current_member_id() OR ADMIN`. 직접 INSERT/UPDATE/DELETE는 전면 차단(쓰기는 후속 슬라이스의 함수로만).
- `get_post(id)` (`SECURITY DEFINER`, `search_path` 고정): RLS를 우회해 PUBLIC·UNLISTED는 누구에게나, PRIVATE는 Author·ADMIN에게만 단건 반환. `member_public_profiles` 조인으로 Author 표시 정보 포함.
- `get_posts(author_id, sort, limit, offset)` (`SECURITY DEFINER` 아님 → RLS 그대로): author 조인, sort 분기, limit/offset 페이징, 윈도우 함수로 `total_count` 반환. (keyword·RELEVANCE 스코어 경로는 후속 슬라이스에서 채움 — 시그니처에 자리는 두되 검색 미동작.)
- `seed.sql`에 다양한 Visibility의 샘플 Post 추가(슬라이스 1의 샘플 Member들에 연결).

## Acceptance criteria

- [ ] anon의 `get_posts` 목록은 PUBLIC만 반환한다(UNLISTED·PRIVATE 제외).
- [ ] Author의 `get_posts`는 자기 UNLISTED·PRIVATE도 목록에 포함한다. ADMIN은 전체를 본다.
- [ ] `author_id`로 특정 Author의 글만 필터링할 수 있다.
- [ ] `get_post`는 PUBLIC·UNLISTED를 누구에게나 반환하고, PRIVATE는 Author·ADMIN에게만 반환한다(그 외엔 빈 결과).
- [ ] 목록·단건 모두 Author의 username·display_name·profile_image_url을 포함한다.
- [ ] sort 옵션(생성/수정 오름·내림차순)과 limit/offset 페이징이 동작하고 `total_count`가 함께 온다.
- [ ] anon의 posts 직접 INSERT/UPDATE/DELETE는 거부된다.
- [ ] integration이 visibility 경계(목록·단건)를, pgTAP가 `get_post`의 분기를 커버한다. 깨진 기존 통합 픽스처는 author_id를 채우도록 갱신한다.

## Blocked by

- `01-member-provisioning-jwt-authz`
