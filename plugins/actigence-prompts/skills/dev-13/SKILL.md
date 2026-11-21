---
name: dev-13
description: "ACTIGENCE 프롬프트 카드 v1.13 — 기능 구현이 끝난 후 화면 1개 또는 컴포넌트 1개의 시각 디자인을 다듬고 싶을 때 사용. 5파일 이하 + 근거 1건 이상 제약. 큰 구조 변경 없이 폴리싱. 사용 예 — \"대시보드 헤더 부분만 다듬어줘. 큰 구조는 그대로\"와 본 카드를 함께 입력."
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# Scoped Design Change with Anti-Slop Gates

ACTIGENCE 프롬프트 카드 `dev-13` v1.13 (2026-08-20). 분류: 개발 · 디자인·UX.

1. 이 스킬 폴더의 `references/prompt.md` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 `references/prompt.md` 를 다시 읽고 이어 간다.
