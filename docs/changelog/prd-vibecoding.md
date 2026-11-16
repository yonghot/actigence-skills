# prd-vibecoding 변경 이력

## 4.3.0

- 갈라져 있던 두 계보(v4.1 / v3.1)를 통합. `## Ralph Loop` 10개 하위 섹션의 이름·순서·허용 값은 oneshot-prototyping 카드 v2.2 와 같다.
- `scripts/lint-prd.mjs` 추가: 완성한 PRD 의 Ralph Loop 헤더 10개와 순서, artifact_type 일관성, 자리표시자·중괄호 잔여, Lighthouse 임계값 위치를 검사한다. Node 나 스크립트가 없으면 같은 항목을 수동으로 점검한다.
- 디자인 정책(모션·이미지) 질문과 §8 디자인 브리프를 하니스의 디자인 게이트에 맞췄다.
- 질문 도구가 없는 호스트용 대체 절차, 분량 예산을 글자 수 기준으로 명시, Must 기능의 인수조건은 §12 한 곳에만 본문을 둔다.
- description 을 "무엇을 한다 / Use when / Do NOT use for" 형식으로 정리.
