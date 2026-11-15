# gmp 변경 이력

## 2.7.0

기준 본문: 계정 동기화 사본의 v2.6 본문(타깃 모델 축, ACCEPTANCE_CRITERIA, Thinking Steering). 설명은 짧은 변형을 기반으로 재작성.

- 설명을 `무엇 / Use when / Do NOT use` 형식으로 교체하고 "반드시" 강제 트리거와 긴 키워드 나열을 제거했다. skill-creator(성능 측정·벤치마크)와의 경계를 명시했다.
- 특정 제품명(Cowork)을 "파일 접근이 가능한 에이전트 환경(예: Claude Code)"으로 일반화했다.
- 낡은 모델 이름(Claude 4 계열, 4.7, GPT-5, Gemini 3)을 "Claude 5 계열 등 내장 추론 모델" 같은 범주어로 바꿨다. Thinking Steering 은 인용 문장 대신 원칙(CoT 틀을 두지 않고 사고량만 조절)으로 완화하고, 근거로 쓰던 연구 인용은 "보고가 있다" 수준으로 낮췄다.
- "스킬 산출 체크리스트"를 한 곳에 추가했다(폴더명 = name, description 1024자 이하, 본문 500줄 이하, 절대 경로 금지, 스크립트 의존성 명시). skill-creator 가 없을 때의 대체 규격이다.
- 산출 파일 위치와 참조 파일 읽는 법(환경 공통 문구)을 OUTPUT_RULE 에 추가했다.
- 의도적으로 하지 않은 것: FINAL_ANCHOR 와 Thinking Steering 중복 제거(이중 앵커링은 의도된 기법), 사이트 카드 라벨 수정.
- 제목의 버전(v2.7)은 plugin.json 의 버전과 맞춘 값이다. 버전의 단일 출처는 plugin.json 이다.
