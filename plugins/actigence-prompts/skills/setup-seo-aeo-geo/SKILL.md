---
name: setup-seo-aeo-geo
description: "ACTIGENCE 프롬프트 카드 v1.14 — 이미 운영 중인 Next.js 사이트에 검색 노출 최적화 3종(전통 SEO + AI 답변엔진 AEO + 지역 GEO)을 한 번에 적용. 안전한 격리 브랜치에서 작업 후 PR 자동 생성. 자동 롤백 포함. 색인 제거 신호(noindex·canonical·Disallow·리다이렉트)는 증거 확인 후 라우트 단위로만 적용하고, 변경 전 베이스라인을 캡처해 크롤 도달성·Core Web Vitals 회귀를 실측 비교한다. 사용 예 —…"
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# Apply SEO · AEO · GEO to a Live Site

ACTIGENCE 프롬프트 카드 `setup-seo-aeo-geo` v1.14 (2026-08-31). 분류: 마무리·배포 · 자동 적용 (v3).

1. 이 스킬 폴더의 `references/prompt.md` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 `references/prompt.md` 를 다시 읽고 이어 간다.
