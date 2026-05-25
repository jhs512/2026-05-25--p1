# CLAUDE.md

## 작업지침
- 모든 문서는 한글로 작성
- codegraph 활용
- 소스코드 수정은 세레나 mcp
- 최대한 matt pocock의 스킬을 활용한다.
- 항상 /caveman 사용

## 유용한 명령어

> 프론트 명령(`pnpm …`)은 모두 `front/` 에서, Supabase 명령은 저장소 루트에서 실행한다.

### 0. 최초 1회 셋업
```bash
# 저장소 루트
supabase start                       # 로컬 Supabase 스택 기동 (Docker 필요)
supabase status                      # API URL / anon key / secret key 출력

cd front
cp .env.example .env.local           # 그리고 supabase status 값으로 채운다
pnpm install
```

### 1. 로컬 Supabase 스택 (저장소 루트)
```bash
supabase start                       # 기동 — API:54321 DB:54322 Studio:54323 Mail:54324
supabase status                      # 접속 정보·키 다시 출력
supabase stop                        # 정지
supabase db reset                    # 마이그레이션 재적용 + seed.sql 재시드 (db.seed enabled)
supabase migration new <name>        # 새 마이그레이션 생성 → supabase/migrations/ 에 추가
```
- 마이그레이션: `supabase/migrations/*.sql` (예: `*_create_posts.sql`)
- 시드: `supabase/seed.sql` — `db reset` 시 자동 로드
- Studio(웹 콘솔): http://127.0.0.1:54323

### 2. 프론트 (`front/`)
```bash
pnpm dev                # Vite 개발 서버
pnpm build              # tsc -b && vite build → dist/
pnpm preview            # 빌드된 dist/ 로컬 서빙
pnpm lint               # eslint
pnpm test               # fast 스위트 (jsdom, 외부 의존 없음) — 매 저장/CI
pnpm test:watch         # fast 스위트 watch 모드
pnpm test:integration   # 통합 스위트 — 사전에 `supabase start` 필수 (ADR-0002)
```

### 3. 환경변수 (`front/.env.local`, `supabase status` 값)
- `VITE_SUPABASE_URL` — 로컬 기본값 `http://127.0.0.1:54321`
- `VITE_SUPABASE_ANON_KEY` — publishable(anon) key. 공개 전제, RLS가 인가 경계 (ADR-0001)
- `SUPABASE_SECRET_KEY` — 통합 테스트 전용(service_role). `VITE_` 미접두 → 번들 미포함

## Standard workflow

Features normally move through these skills in order:

1. `/grill-with-docs` — interrogate the plan; resolve domain terms into `CONTEXT.md` and decisions into `docs/adr/`.
2. `/to-prd` — turn the grilled context into a PRD on the issue tracker.
3. `/to-issues` — break the PRD into independently-grabbable tracer-bullet issues.
4. `/tdd` **or** `/diagnose` — build features test-first, or run the diagnosis loop for hard bugs/regressions.
5. `/improve-codebase-architecture` — find refactoring/deepening opportunities once the work lands.

## Agent skills

### Issue tracker

Issues and PRDs live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage roles using their default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
