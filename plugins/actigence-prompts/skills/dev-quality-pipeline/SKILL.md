---
name: dev-quality-pipeline
description: "ACTIGENCE 프롬프트 카드 v1.12 — 테스트 보강 → 코드 리뷰 → 정리 3단계 통합. 새 기능을 만든 후 안정화하거나 오래된 코드를 다듬을 때 사용. 사용 예 — \"결제 모듈 안정화 — 테스트 보강 + 리뷰 + 정리 한 번에 해줘\"와 본 카드를 함께 입력."
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# Quality Pipeline — Test Reinforcement → Code Review → Code Cleanup (Autonomous)

ACTIGENCE 프롬프트 카드 `dev-quality-pipeline` v1.12 (2026-08-20). 분류: 개발 · 품질·디버깅.

1. 이 스킬 폴더의 `references/prompt.md` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 `references/prompt.md` 를 다시 읽고 이어 간다.
