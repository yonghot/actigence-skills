---
name: dev-merged-3
description: "ACTIGENCE 프롬프트 카드 v1.11 — 새 기능을 만들기 전, 비슷한 경쟁 사이트나 오픈소스 라이브러리를 분석해 '뭘 가져올지·뭘 안 할지' 추출. 무작정 만들기보다 검증된 패턴부터 가져오는 단계. 사용 예 — \"리뷰 사이트 만들기 전에 yelp.com·trustpilot.com 분석해서 차용할 패턴 추출해줘\"와 본 카드를 함께 입력."
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# Reference Analysis (참고 분석)

ACTIGENCE 프롬프트 카드 `dev-merged-3` v1.11 (2026-08-20). 분류: 개발 · 기능 추가.

1. 이 스킬 폴더의 `references/prompt.md` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 `references/prompt.md` 를 다시 읽고 이어 간다.
