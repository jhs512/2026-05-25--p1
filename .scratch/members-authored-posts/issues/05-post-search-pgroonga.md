# Post 검색 (pgroonga)

Status: done

## Parent

`.scratch/members-authored-posts/PRD.md`

## What to build

`get_posts`에 키워드 검색을 추가한다. 제목·본문을 대상으로 한글 부분 매칭이 잘 되어야 하고, 관련도 정렬을 지원한다.

- `pgroonga` 확장 + `posts`의 title·content 배열에 대한 pgroonga 인덱스(TokenBigram 토크나이저).
- `get_posts`의 `keyword` 경로: keyword가 있으면 `&@~`로 필터하고, sort가 RELEVANCE일 때 `pgroonga_score`로 정렬(없을 땐 null score). 기존 sort·페이징·`total_count`·Author 조인·RLS 동작은 그대로 유지.
- 검색은 슬라이스 3의 `get_posts` RLS를 그대로 타므로, anon은 PUBLIC 안에서만 검색된다.

## Acceptance criteria

- [ ] keyword로 제목·본문을 검색할 수 있다.
- [ ] 한글 키워드의 부분 매칭이 동작한다(예: "검색" → "한글 검색 후기").
- [ ] 영문 키워드 검색도 자연스럽게 동작한다.
- [ ] sort=RELEVANCE일 때 관련도 높은 순으로 정렬된다.
- [ ] keyword가 비면 기존 목록 동작(전체, sort/paging)으로 회귀한다.
- [ ] 검색 결과도 RLS를 따른다(anon은 PUBLIC만).
- [ ] integration이 한글 부분 매칭·관련도 정렬·RLS 적용 검색을 커버한다.

## Blocked by

- `03-post-author-visibility-reads`
