---
status: accepted
---

# RLS로 표현 못 하는 읽기는 SQL 함수로: 목록은 RLS, 단건은 SECURITY DEFINER

ADR-0001은 읽기를 "RLS로만 인가되는 직접 테이블 쿼리"로 규정했다. Post의 **Visibility**(PUBLIC/UNLISTED/PRIVATE, CONTEXT.md 참고)에는 테이블 RLS 단독으로 깔끔히 표현할 수 없는 부분이 있어, 읽기 일부를 SQL 함수로 캡슐화하며 그 클로즈를 보완한다.

- **목록(`get_posts`)** — `SECURITY DEFINER`가 **아니다**. 따라서 테이블 RLS를 그대로 타며(anon은 PUBLIC만, Author는 자기 글, ADMIN은 전체) 인가 경계는 변하지 않는다. 다만 직접 `.from('posts')` 쿼리 대신 **RPC**로 한 이유는 pgroonga 검색·Author 프로필 조인·페이징·`total_count`를 한 곳에 캡슐화하기 위해서다.
- **단건(`get_post`)** — `SECURITY DEFINER`로 테이블 RLS를 **우회한다**. UNLISTED는 "링크(id)를 알면 누구나 읽힘"인데, 테이블 RLS는 anon에게 PUBLIC만 열어두므로 RLS만으로는 이 규칙을 표현할 수 없다. 그래서 함수가 PUBLIC+UNLISTED를 열고, PRIVATE는 자체 `WHERE`(Author 또는 ADMIN)로 인가한다. RLS를 우회하므로 ADR-0001의 `SECURITY DEFINER` 규칙(`search_path` 고정 + 자체 인가)을 그대로 따른다.

이에 맞춰 프론트의 `/` 목록 읽기도 직접 테이블 쿼리에서 **`get_posts` RPC로 전환**한다 — ADR-0001의 "direct table queries"에서 의도적으로 이동하는 지점이다.

## 검토한 대안

- **Visibility 규칙 전체를 RLS로** — 기각: UNLISTED의 "목록엔 숨기되 단건은 누구나"라는 비대칭은 같은 테이블·같은 역할에 대해 `SELECT` 정책 하나로 표현하기 어렵다. 목록과 단건의 노출 규칙이 다르기 때문이다.
- **UNLISTED를 추측 불가능한 토큰/슬러그로** — 기각(현재): id 기반으로 충분하고, 별도 비밀 토큰 컬럼·발급 흐름은 지금 범위를 넘어선다.

## 결과

- 읽기 경로가 두 갈래다: RLS를 타는 목록(`get_posts`)과 RLS를 우회하는 단건(`get_post`). 후자는 "왜 read가 `SECURITY DEFINER`인가?"라는 의문을 부르므로 이 ADR이 그 이유(UNLISTED 도달성)를 박아둔다.
- 미래 엔지니어는 `get_post`의 `SECURITY DEFINER`를 "실수"로 보고 RLS로 되돌리려 하면 안 된다 — UNLISTED 규칙이 깨진다.
