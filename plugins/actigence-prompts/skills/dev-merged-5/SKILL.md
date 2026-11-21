---
name: dev-merged-5
description: "ACTIGENCE 프롬프트 카드 v1.11 — 버그가 발견됐을 때 3가지 가설을 병렬로 세워 근본 원인을 찾고 수정. 추측 수정 금지 — 재현 가능한 시나리오 확보 후에만 손댄다. 회귀 테스트 자동 추가. 사용 예 — \"로그인 후 가끔 빈 화면이 뜨는데 원인 찾아서 고쳐줘\"와 본 카드를 함께 입력."
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# Debugging: Root-Cause Analysis and Fix

ACTIGENCE 프롬프트 카드 `dev-merged-5` v1.11 (2026-08-20). 분류: 개발 · 품질·디버깅.

1. 이 스킬 폴더의 `references/prompt.md` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 `references/prompt.md` 를 다시 읽고 이어 간다.
