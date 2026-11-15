# paper-quality-enhancer 변경 이력

## 1.1.0

- references/rubrics.md 신규 작성: 8축 테스트, 분야별 엄밀성, 티어, Reviewer 2 패턴, 개정 카드, 리포트 골격, 환각 방지·CoV, 점검 목록을 한 파일로 제공. 이전 SKILL.md 가 가리키던 존재하지 않는 파일 트리(axes/, field-standards/, templates/, checklists/, workflows/)를 제거하고 리소스 매핑·필독 목록을 이 파일 하나로 재작성.
- 산출 계약 명확화: PDF 입력은 .docx/.md/.tex 개선본, 저장 위치(작업 폴더, claude.ai 는 /mnt/user-data/outputs/), mammoth 선택 사항과 대체 경로, Python 실행 규칙.
- 역할 수를 12개 논리 역할로 정정하고, 서브에이전트가 없거나 간극이 Small 이면 경량 순차 모드 추가.
- 웹 검색 도구가 없을 때의 대체 동작과 미공개 원고 보호(검색어에 문단 통째로 넣지 않음) 추가.
- description 을 "무엇을 한다 / Use when / Do NOT use for" 형식으로 정리하고 타인 논문 읽기·요약, 사실 검증(factcheck)을 제외 대상으로 명시.
