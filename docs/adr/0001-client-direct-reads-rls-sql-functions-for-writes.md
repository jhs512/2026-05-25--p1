---
status: accepted
---

# 클라이언트 직접 읽기는 RLS로, 쓰기는 SQL 함수로

이 앱은 애플리케이션 백엔드가 없는 완전 정적 SPA(Vite → Cloudflare Pages)이므로, 브라우저가 anon 키로 Supabase와 직접 통신한다. 데이터 접근을 작업 종류로 나눈다: **읽기**는 `supabase-js`를 통한 직접 테이블 쿼리이며 오직 Postgres **Row Level Security**의 `SELECT` 정책으로만 인가된다. **쓰기(생성/수정/삭제)**는 결코 직접 테이블 DML이 아니라, RPC로 호출되는 Postgres **SQL 함수**를 거치며, 이 함수가 검증을 캡슐화하고 상승된 권한으로 실행된다.

## 검토한 대안

- 데이터베이스 앞단의 **Edge API 레이어**(Cloudflare Workers / Supabase Edge Functions) — 현재로선 기각: 읽기 전용 공개 목록에는 정당화되지 않는 배포 표면과 비용이 추가된다.
- **클라이언트에서 직접 테이블 DML로 쓰기** — 기각: anon 키에 `INSERT/UPDATE/DELETE`를 노출하면 쓰기 규칙이 하나의 감사 가능한 함수 대신 흩어진 RLS 정책에 살게 되고, 검증이 어렵다.

## 결과

- **읽기의 인가 경계는 RLS가 유일하다.** `ENABLE ROW LEVEL SECURITY` + 명시적 `SELECT` 정책이 없는 테이블은 구멍이다. 마이그레이션은 RLS를 명시적으로 켜야 한다(SQL로 생성한 테이블에는 자동으로 켜지지 *않는다*).
- **anon 키는 설계상 공개**이며 SPA 번들에 실려 나간다. 이 키는 RLS 정책과 `GRANT EXECUTE`된 함수가 허용하는 것 이상은 아무것도 부여하지 않는다.
- **쓰기 함수는 `SECURITY DEFINER`** 로 권한 있는 쓰기를 수행한다. 따라서 각 함수는 RLS를 우회하므로 반드시 `search_path`를 고정하고 내부에서 자체 인가 검사를 해야 한다.
- **오늘의 범위:** 읽기(`/`의 `public.posts` 목록)만 구현되어 있고, 샘플 데이터는 `seed.sql`로 로드한다. 쓰기 함수 패턴은 여기 기록하되, 인가 대상이 될 **User** 개념이 생긴 뒤 나중에 구현한다.
