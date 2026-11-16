---
name: oneshot-prototyping
description: "PRD 하나로 빈 폴더에서 production 배포까지 한 세션에 끝내는 원샷 프로토타이핑. 로그인 없이 전 기능을 체험하는 데모 빌드를 만들고 게이트 4단(데모 기능 초안 → 디자인 고도화 → 보안 강화 → 배포·검증)을 자율 반복으로 통과한다. 디자인은 실측 게이트와 독립 검증자 채점으로 판정하고, 저장소는 구글 시트를 이 패스 안에서 프로비저닝한다. Use when 사용자 메시지에 「프로토타이핑」이 그대로 있고, PRD 가 첨부됐거나 작업 폴더에 PRD 파일(PRD.md 등)이 있을 때 — 두 조건을 모두 충족해야 한다. Do NOT use for 「프로토타입 만들어줘」·「MVP 한 번에」·「이 PRD로 만들어줘」처럼 그 단어가 없는 요청, PRD 없이 「프로토타이핑 하자」라고만 한 경우, 기능 추가·버그 수정·디자인 단독 요청."
---

# 원샷 프로토타이핑 v2.2 (2026-11-16)

- v2.2: 디자인 고도화 규칙·실측 게이트·세션 병렬을 카드에 통합했다. 보강 파일은 레시피·스크립트·세션 절차뿐이다.
- 카드는 블록 단위로 읽는다(아래 색인).

## 발동 조건 (자동 발동 시 먼저 확인)

두 조건을 **모두** 충족할 때만 진행한다.

1. 사용자 메시지에 `프로토타이핑` 이라는 단어가 그대로 있다.
2. 이번 요청에 PRD가 첨부됐거나, 작업 폴더에 PRD 파일이 이미 존재한다 (`PRD.md` 등 — 확실하지 않으면 폴더를 확인한다).

미충족이면 **즉시 중단**하고 어느 조건이 빠졌는지 알린다. PRD 를 지어내지 않는다. `/oneshot-prototyping` 명시 호출은 조건 1을 만족한 것으로 보고 조건 2만 확인한다. PRD 가 없으면 카드 Bootstrap 3단계의 PRD 첨부 게이트([A]/[B] 선택지, `PRD_REQUIRED` 상태 줄)를 따르고, `prd-vibecoding` 안내는 그에 더하는 것이지 대체가 아니다. `## Ralph Loop` 이 없으면 카드의 기본값으로 진행한다.

## 카드 읽기 (`references/prompt.md`)

카드가 유일한 규칙 정본이며 이 문서는 덮어쓰지 않는다. 블록 읽기: `grep -n` 으로 앵커 줄을 찾고 `sed -n 'A,Bp'` 로 다음 앵커 직전까지 자른다.

**시작 세트(약 87K)** — 첫 응답 전에 읽는다: 표에서 "시작" 칸에 ● 가 있는 블록(Gate 1·실패 처리·비정지 신호·Exit signals·Tail-Run 줄 포함). 나머지는 해당 모드에 들어갈 때 읽는다. 읽은 블록은 `.ralph-fullstack-state` 의 `loaded_blocks` 에 적고, 핸드오프 뒤 새 컨텍스트는 자기 단계 블록을 다시 읽는다. 애매하면 카드 전체를 읽는다.

모드별 추가 읽기 — Bootstrap: ARTIFACT_TYPE_MATRIX 첫 단락(artifact_type 판정)·ENVIRONMENT_SKILLS(노출 스킬이 없어도 S9·Design system of record) · PREPARING 시작: DESIGN_ELEVATION 의 Design files·Images and brand assets·Design-QA rubric·Probe contract, ENVIRONMENT_SKILLS S9·Capture surface, DATA_LAYER · DESIGNING: DESIGN_ELEVATION 전체 + Gate D · SECURING: Gate 2 · DEPLOYING: Gate 3 + STORE_PROVISIONING Cutover · 약속 직전: SELF_VERIFICATION 과 Autonomous Tail-Run 단락.
STORE_PROVISIONING: 저장소가 google-sheets 이고 호스트 표 gcloud=yes 또는 browser_mcp=yes 일 때 PREPARING 에서 DAL 동결 직후 읽고, DEPLOYING 에서 Cutover 부분을 다시 읽는다.

워커 브리프에는 프로젝트의 카드 사본 경로(`.ralph-backup/card.md`, 서브에이전트·세션을 쓸 때만 만든다)와 블록 이름만 적는다(워커는 프로젝트 안의 카드 사본만 읽는다). 에이전트별 블록은 아래 "Worker-to-block table" 이 정본이다.

| 블록 | grep 앵커 | 시작 | 크기 |
|---|---|---|---|
| Role · CRITICAL_CONSTRAINTS | `^## Role & Context` · `^<CRITICAL_CONSTRAINTS>` | ● | 11.7K |
| Execution Modes + 호스트 매트릭스 | `^## Execution Modes` · `^### Host capability matrix and one-time probe` | ● | 9.4K |
| Ralph wire · Input Contract | `^## PRD .## Ralph Loop. Section` · `^## Input Contract` | ● | 6.0K |
| ARTIFACT_TYPE_MATRIX | `^<ARTIFACT_TYPE_MATRIX>` |  | 5.7K |
| DATA_LAYER | `^<DATA_LAYER>` |  | 6.8K |
| STORE_PROVISIONING | `^<STORE_PROVISIONING>` |  | 15.4K |
| DESIGN_ELEVATION | `^<DESIGN_ELEVATION>` |  | 31.5K |
| TERMINATION 머리 · Gate 1 | `^<TERMINATION_CONDITIONS>` · `^\*\*Gate 1 —` | ● | 4.8K |
| 　Gate D · Gate 2 · Gate 3 | `^\*\*Gate D —` · `^\*\*Gate 2 —` · `^\*\*Gate 3 —` |  | 12.5K |
| 　실패 처리 · 비정지 신호 · Exit signals | `^\*\*Gate-failure handling` · `^\*\*Non-stop signals` · `^\*\*Exit signals` | ● | TERMINATION 전체 21.4K |
| NON_STOP_GUARANTEE · Backpressure | `^<NON_STOP_GUARANTEE>` · `^## Backpressure` | ● | 8.3K |
| Sub-Agent Inventory | `^## Sub-Agent Inventory` | ● | 7.9K |
| Bootstrap · Cycle Procedure · Output Contract | `^## Bootstrap` · `^## Cycle Procedure` · `^## Output Contract` | ● | 18.2K |
| PARALLEL_EXECUTION · 워커 표 | `^<PARALLEL_EXECUTION>` · `^\*\*Workers and loading` · `^Worker-to-block table` | ● | 15.3K |
| ENVIRONMENT_SKILLS | `^<ENVIRONMENT_SKILLS>` |  | 7.8K |
| SELF_VERIFICATION | `^<SELF_VERIFICATION` |  | 1.1K |
| Autonomous Tail-Run 줄 | `^\[MUST\] \*\*Autonomous Tail-Run` | ● | 0.8K |
| FINAL_REMINDER | `^<FINAL_REMINDER>` |  | 0.3K |

## 부트스트랩 복사 (카드 Bootstrap 단계에서, 파일이 있을 때만)

1. `references/design-gate.mjs` → 프로젝트 `./scripts/design-gate.mjs` (UI 산출물. 실행만 하고 읽지 않는다. 계약: `node ./scripts/design-gate.mjs [--url U] [--prev F] [--rebase <routes>] [--config F] [--routes a,b] [--viewports w,w] [--out F] [--only richness] [--explain]`, 종료 0 통과·1 실패·2 도구 결함·3 측정기 없음)
2. `references/design-recipes.md`, `references/image-recipes.md` → 프로젝트 `references/` (UI 워커는 UI 킷·D5 에서, 이미지는 이미지 도구가 있을 때만 읽는다)
3. `references/session-parallel.md`: `start_session` 이 있을 때만 오케스트레이터가 스킬 폴더에서 읽는다(카드 PARALLEL_EXECUTION "Workers and loading").

파일이 없으면 카드의 인라인 규칙으로 진행한다.

## 사용자가 줄 것

로그인·배포 승인은 카드 호스트 매트릭스와 CRITICAL_CONSTRAINTS 가 정본이다. 없는 항목은 데모·로컬 목업·DRY-RUN 으로 완주하고 수동 단계는 HANDOVER.md 로 넘긴다.

## 동기화 규칙

`references/prompt.md` 는 ACTIGENCE 프롬프트 카드 `setup-fullstack-prototype` v2.2 와 **byte-identical** 이다. 한쪽을 고치면 같은 커밋에서 다른 쪽도 맞추고, 재생성 전에 byte 비교부터 한다(과거 포크 사고).
