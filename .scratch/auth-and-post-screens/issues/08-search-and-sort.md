# 검색·정렬

Status: ready-for-agent

## Parent

`.scratch/auth-and-post-screens/PRD.md`

## What to build

`/` 목록에 키워드 검색과 정렬을 더한다. 검색·정렬 상태는 URL에 남아 공유·새로고침에도 유지된다.

- **`/` 확장**: SearchBar(키워드 입력) + 정렬 선택(최신/오래된/수정최신/수정오래된/관련도). `fetchPosts`를 keyword·sort·limit·offset로 일반화(현재 하드코딩 제거).
- URL 검색 파라미터 `?q=&sort=`와 동기화(TanStack Router search params). get_posts가 keyword/sort/paging을 한 함수로 처리(검색도 RLS를 타 anon은 PUBLIC만).
- 빈 키워드는 전체 목록으로 회귀.

## Acceptance criteria

- [ ] 키워드로 제목·본문을 검색하고 결과가 목록에 반영된다(한글 부분 매칭 동작).
- [ ] 정렬 옵션 선택이 반영된다(관련도 정렬은 키워드 검색 시 의미).
- [ ] `?q=&sort=`가 URL에 남고, 새로고침·링크 공유 시 같은 결과가 재현된다.
- [ ] 빈 키워드는 전체 목록을 보인다.
- [ ] anon 검색은 PUBLIC만 반환한다.
- [ ] fast 테스트: SearchBar 입력→쿼리 파라미터 반영, 정렬 변경 — 데이터 seam 모킹.

## Blocked by

None - can start immediately
