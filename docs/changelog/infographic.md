# infographic 변경 이력

## 1.0.0

- 기반: 웹사이트 단일 파일 인포그래픽 스킬. 해당 파일이 요구하던 `references/design-rules.md` 가 어느 사본에도 없어 스킬이 동작하지 않던 문제를 해소(INF-1).
- `references/design-rules.md` 신규 포함: `shared/design-rules/design-rules.src.md` 에서 파생한 base 사본(번호 1~13, 개요 셀 규칙 제외). 파생 방법은 `shared/README.md`.
- 캡처 라벨 모순 해소: 라벨은 `.cap-label`(12px #666, `@media print` 에서 숨김)로 통일하고 컬러·크기 검증에서 제외. 기존 10px #AAA 는 "텍스트 검정·14px 미만 금지" 규칙과 충돌했다.
- 이식성(INF-2): `/mnt/skills/user/...` 읽기를 SKILL.md 폴더 기준 상대 경로로, 출력 위치를 작업 폴더로 변경. claude.ai 는 /mnt/user-data/outputs/ 폴백, present_files 는 도구가 있을 때만.
- description 재작성(INF-3): "반드시"·차트/도표 만들어줘·사업계획서 그림/이미지 트리거 제거, 정부지원사업 제출 문서는 gov-doc-infographic, 단일 차트·대시보드·SNS 카드는 제외로 명시.
- STEP 4 검증 구체화(INF-4): 헤드리스 브라우저 렌더 검사, 없으면 텍스트 린트(이모지·보라색·본문 16px 미만·max-height/overflow:hidden·텍스트 색), 숫자 원문 대조. 실행한 검사와 못 한 검사를 보고.
- 실패 모드 추가(INF-5): 스캔 PDF·이미지 원문, 15개 미만 섹션(채우지 않고 사유 보고), 정량 데이터 없음(수치 창작 금지), 오프라인 Pretendard 폴백 스택.
