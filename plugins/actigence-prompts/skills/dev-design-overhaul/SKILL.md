---
name: dev-design-overhaul
description: "ACTIGENCE 프롬프트 카드 v1.4 — Claude Code로 만든 프로젝트의 디자인을 단일 토큰 시스템 기반으로 전면 재설계하는 카드. 기능·인터랙션·데이터 흐름은 보존하고 IA·레이아웃·유저플로우까지 재설계한다. PHASE 0 감사(읽기 전용·기능 베이스라인) → PHASE 1 방향 확정·승인 체크포인트 → PHASE 2 토큰·프리미티브 정의 → PHASE 3 그룹별 적용 → PHASE 4 회귀·일관성·접근성·반응형 검증. 크림+세리프+테라코타 같은 AI 기본형을 피하고 제품 성격에서 시각 정체성을 도출하며, 실제 렌더 확인 후에만 완료로 판단한다. 사용 예 —…"
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# 디자인 전면 재설계

ACTIGENCE 프롬프트 카드 `dev-design-overhaul` v1.4 (2026-08-20). 분류: 디자인·시각화 · 디자인 전면 재설계.

1. 이 스킬 폴더의 `references/prompt.md` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 `references/prompt.md` 를 다시 읽고 이어 간다.
