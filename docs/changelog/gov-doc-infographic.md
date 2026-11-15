# gov-doc-infographic 변경 이력

## 1.2.0

- 기반: 데스크톱 설치본(SKILL.md + references/design-rules.md 완비). 웹사이트 v1.1 의 코워크 문구 일반화를 이어받음.
- 이식성(GDI-1): `/mnt/skills/user/...` 읽기를 SKILL.md 폴더 기준 상대 경로로, 출력을 작업 폴더로, "코워크" 를 "파일 접근이 가능한 에이전트 환경" 으로 변경. claude.ai 는 /mnt/user-data/outputs/ 폴백, present_files 는 도구가 있을 때만.
- 캡처 라벨 모순 해소(GDI-2): 10px #AAA 라벨이 스킬 자체 체크리스트("#000 외 텍스트 0건", "14px 미만 0건")를 실패시키던 문제를 `.cap-label`(12px #666, 인쇄 시 숨김, 검증 제외)로 해결. 개요 캡션 예외도 11px 에서 12px 로 정렬. SKILL.md 개요 HTML 예시도 같은 클래스로 교체.
- 검증·실패 모드 추가(GDI-3): 900px(전체)/700px(개요) 헤드리스 렌더 검사, 없으면 텍스트 린트, 숫자 원문 대조, 실행 여부 보고. 스캔 PDF, 사업 혼재, 개요 테이블 없음, 오프라인 폰트 폴백, 15개 미만 섹션.
- description 재작성: 제출 문서 트리거 유지, 일반 문서·마케팅·SNS·슬라이드는 infographic 으로 안내.
- design-rules.md 는 `shared/design-rules/design-rules.src.md` 에서 파생한 gov 사본(번호 1~14 전체). 파생 방법은 `shared/README.md`.
- 건너뜀(GDI-4, P2): SKILL.md 의 셀 유형 표와 design-rules.md 14번을 대조한 결과 동일하지 않았다. 14번은 SVG 아이콘·원형 마커·border-left·화살표 등 세부 규격을 더 담고 SKILL.md 표는 요약형이다. 감지 로직은 design-rules.md 를 읽기 전에 필요하므로 SKILL.md 에 남기고 중복 제거는 하지 않았다.
