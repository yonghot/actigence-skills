# oneshot-prototyping 변경 이력

## 2.2.0

- 갈라져 있던 두 계보(카드 v2.1 / 옛 카드에 보강 파일을 얹은 판)를 하나로 통합. `references/prompt.md` 는 ACTIGENCE 프롬프트 카드 `setup-fullstack-prototype` v2.2 와 byte-exact 이며 이 저장소에서 편집하지 않는다.
- 규칙은 전부 카드에 있다. 보강 파일은 구현 레시피(`design-recipes.md`, `image-recipes.md`), 실측 스크립트(`design-gate.mjs`), 하위 세션 절차(`session-parallel.md`)뿐이고, 없어도 카드만으로 동작한다. 이전의 `design-uplift.md` 는 규칙은 카드로, 구현 예시는 두 레시피 파일로 나뉘었다.
- 호스트 능력표와 1회 프로브: 셸·서브에이전트·하위 세션·브라우저·playwright·이미지 도구·gcloud·네트워크·git·사람 유무를 한 번 조사해 이후 분기를 그 표로 결정한다. 셸도 파일 쓰기도 없는 호스트는 바로 종료 신호를 낸다.
- 게이트 D 를 D-0..D-7 로 단계화: 스크립트 실측(파일·토큰·`design-gate.mjs` 규칙 R0–R21·접근성)이 먼저, 모델 판정(충실도·비평)은 그 뒤. 측정 도구가 없으면 해당 행은 N/A 이고 모델 판정이 전 축을 맡는다.
- 살아 있는 화면(주 행동 피드백, 상태 변화·전환 연출, 데이터 시각화, 빈·로딩·성공 상태)과 모션 등급(반응 200 ms 이하, 장면·배경은 등급별)을 카드 규칙으로 흡수.
- SKILL.md 에 카드 블록 색인을 두어 필요한 블록만 읽는다(시작 약 87K, 전체 약 168K). 읽은 블록은 `.ralph-fullstack-state` 의 `loaded_blocks` 에 기록.
- PRD `## Ralph Loop` 와이어와 종료 신호 4종은 v2.1 과 같다.
- description 을 "무엇을 한다 / Use when / Do NOT use for" 형식으로 정리. 발동 조건(「프로토타이핑」 단어 + PRD)은 그대로다.
