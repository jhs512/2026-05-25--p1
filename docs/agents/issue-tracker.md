# 이슈 트래커: 로컬 마크다운

이 저장소의 이슈와 PRD는 `.scratch/` 안에 마크다운 파일로 존재한다.

## 규약

- 디렉터리당 기능 하나: `.scratch/<feature-slug>/`
- PRD는 `.scratch/<feature-slug>/PRD.md`
- 구현 이슈는 `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, `01`부터 번호 매김
- 트리아지 상태는 각 이슈 파일 상단 근처의 `Status:` 줄에 기록한다(역할 문자열은 `triage-labels.md` 참고)
- 코멘트와 대화 이력은 파일 하단의 `## Comments` 제목 아래에 덧붙인다

## 스킬이 "이슈 트래커에 게시"하라고 할 때

`.scratch/<feature-slug>/` 아래에 새 파일을 만든다(필요하면 디렉터리도 생성).

## 스킬이 "관련 티켓을 가져오라"고 할 때

참조된 경로의 파일을 읽는다. 보통 사용자가 경로나 이슈 번호를 직접 넘겨준다.
