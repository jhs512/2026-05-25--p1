# p1

Supabase에서 콘텐츠를 직접 읽어 공개적으로 렌더링하는 완전 클라이언트 사이드 SPA. 애플리케이션 백엔드는 없으며, 브라우저가 anon 키로 Supabase와 직접 통신하고 Row Level Security가 유일한 인가 경계다.

## 용어

### 신원과 사람

**User**:
인증 신원 — 로그인·세션·자격증명의 주체이며 Supabase Auth가 관리한다. 인증에 필요한 것 외에는 아무것도 갖지 않는다.
_지양_: Account, login

**Member**:
**User**에 1:1로 붙는 도메인 프로필. User가 처음 나타나는 순간 자동으로 생성된다. 사용자용 신원(**username**, **display_name**)과 도메인 지위(Role, Status)를 갖는다. 어떤 행위의 도메인상 "누가"가 중요할 때, 그것은 User가 아니라 Member다.
_지양_: User(인증 신원 전용으로 남겨둘 것), Account, Profile

**username**:
Member의 고유 핸들 — 모든 Member에 걸쳐 안정적이고 유일하며, 멘션·링크에 쓰인다(예: `@user1`).
_지양_: handle, name, id

**display_name**:
화면에 노출되는 Member의 표시명. 자유롭게 정하며 유일하지 않다.
_지양_: nickname, name

**Role**:
확장된 권한 범위를 부여하는 Member의 지위. Member는 다음 중 하나 이상을 가진다:
- **MEMBER** — 모든 Member가 가지는 기본 지위. 본인 콘텐츠를 작성·관리한다.
- **ADMIN** — 모든 Member의 Post를 읽기·수정·삭제할 수 있고, 평소 숨겨진 것도 볼 수 있다.
- **SYSTEM** — 플랫폼 자체의 최상위 지위. 시드된 서비스 계정이 보유한다.
_지양_: permission, grant, group

**Status**:
Member가 행위할 수 있는지 여부. 다음 중 하나:
- **ACTIVE** — 완전한 참여 가능.
- **BLOCKED** — 공개 콘텐츠 읽기는 가능하나, 어떤 쓰기도 불가(Post 생성·수정·삭제, 본인 프로필 수정 모두 차단).
_지양_: banned, suspended, disabled

### 콘텐츠

**Post**:
Member가 작성한 텍스트 콘텐츠의 단위. 제목, 본문, **Author**, **Visibility**, 타임스탬프를 가진다.
_지양_: Article, Entry, Document

**Author**:
**Post**를 작성한 **Member**. 모든 Post에는 정확히 한 명의 Author가 있다.
_지양_: Owner, Writer, Poster

**Visibility**:
Post의 공유 레벨 — draft/published 라이프사이클이 아니라 3단계 도달성(reachability) 설정. 다음 중 하나:
- **PUBLIC** — 목록에 노출되고 누구나 읽을 수 있다.
- **UNLISTED** — 공개 목록에는 절대 나타나지 않지만, 링크를 아는 사람은 누구나 읽을 수 있다.(Author와 ADMIN은 자신의 목록에서는 여전히 본다.)
- **PRIVATE** — Author와 ADMIN만 읽을 수 있다(목록·직접 접근 모두).
_지양_: draft, published, hidden, secret, 2단 플래그식 공개/비공개

## 예시 대화

> **개발자**: `user1`이 Post를 쓰면 Author는 누구죠 — User인가요 Member인가요?
> **도메인 전문가**: Member예요. User는 그 뒤의 로그인일 뿐이고, 우리가 보여주는 모든 것 — 핸들, 이름, 작성한 Post — 은 Member에 매달려요.
> **개발자**: `username`이랑 `display_name`은요?
> **도메인 전문가**: `username`은 URL이나 `@`멘션에 넣을 고유 핸들이고, `display_name`은 그냥 화면에 보이는 이름이에요. 두 Member가 같은 display_name을 가질 수 있어요.
> **개발자**: Member 없는 User가 있을 수 있나요?
> **도메인 전문가**: 없어요. User가 생기는 순간 그것을 위한 Member가 만들어져요. 항상 1:1이에요.
> **개발자**: UNLISTED Post는 draft인가요?
> **도메인 전문가**: 아니요, draft는 없어요. UNLISTED는 완성돼서 공유 가능한 글이고, 단지 공개 목록에 안 뜰 뿐이에요. 링크를 아는 사람은 읽어요. 닫힌 건 PRIVATE — Author와 ADMIN만요.
