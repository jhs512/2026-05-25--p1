# 프론트 목록을 get_posts RPC로 전환

Status: done

## Parent

`.scratch/members-authored-posts/PRD.md`

## What to build

`/` 목록의 읽기 경로를 직접 테이블 쿼리에서 `get_posts` RPC로 전환한다(ADR-0004). 목록에 Author 표시 정보와 Visibility가 함께 실린다.

- `fetchPosts`를 `supabase.from('posts').select(...)`에서 `supabase.rpc('get_posts', ...)` 호출로 교체.
- `Post` 도메인 타입에 `author`(username·displayName·profileImageUrl)와 `visibility`를 추가하고, `content`를 non-null로 좁힌다. PostgREST 행 → camelCase 매핑 유지.
- 목록 컴포넌트가 Author 표시 정보를 렌더(필요한 최소한). 검색·정렬 UI는 범위 밖 — 데이터 경로 전환까지.

## Acceptance criteria

- [ ] `/` 목록이 `get_posts` RPC를 통해 PUBLIC Post를 최신순으로 보여준다.
- [ ] 각 Post에 Author의 display_name·username이 표시된다.
- [ ] `Post` 타입이 author·visibility를 포함하고 content가 non-null이다.
- [ ] 컴포넌트 테스트는 데이터 접근 seam을 모킹한다(`supabase-js`는 모킹 안 함 — ADR-0002). 로딩·에러·빈 상태 포함.
- [ ] integration이 `fetchPosts`가 새 shape(author·visibility)를 반환함을 검증한다.
- [ ] `pnpm test`(fast)와 `pnpm test:integration`이 통과한다.

## Blocked by

- `03-post-author-visibility-reads`
