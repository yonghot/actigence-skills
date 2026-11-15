# business-case 변경 이력

## 1.1.0

기준: 개인 스킬 폴더 사본(SKILL.md, references/ 4개, scripts/unit_economics.py). 사본이 하나뿐이라 병합할 갈래 없음.

- references/pipeline.md: 정의 없이 쓰던 `LENSES` 를 lenses.md 의 8개 렌즈에서 정의하고, 첫 사용보다 아래에 선언돼 즉시 오류가 나던 `VERDICT_SCHEMA` 를 위로 옮겼다. 비어 있던 모델링·종합·비평 단계를 실제 agent 호출로 채웠고 비평 지적을 반영하는 단계를 추가했다. Claude Code Workflow 도구 전용임을 명시했다. 함수로 감싸 `node --check` 를 통과했고, 가짜 agent 로 끝까지 실행해 참조 오류가 없음을 확인했다.
- references/modeling.md: 4-b 절(구독·B2B 변형: 이탈률 LTV, 기대 수명 상한, NRR, CAC 회수기간)과 손으로 검산한 작업 예시 2개를 추가했다. lenses.md 렌즈 5·8 에 구독·B2B 질문을 추가했다.
- scripts/unit_economics.py: 결제 수수료 기준을 `--pg-on gross|net` 으로 선택하게 했고 기본은 부가세 포함 결제금액(gross)이다. 기존 동작(net)은 `--pg-on net` 으로 재현된다. `--llm-*` 가 `--variable` 을 덮어쓸 때 stderr 경고를 낸다. python3 대신 python 을 쓰는 방법을 안내했다.
- SKILL.md: 설명을 "무엇을 한다. Use when ... Do NOT use for ..." 형식으로 다시 썼고 정부지원사업 사업계획서(gov-startup-bizplan)를 제외로 명시했다. 마무리 체크리스트, 분석 기준일, 웹 도구 없을 때의 [미확인] 처리, 산출 파일 위치 문구를 추가했다.
