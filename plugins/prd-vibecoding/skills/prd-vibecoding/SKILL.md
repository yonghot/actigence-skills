---
name: prd-vibecoding
description: "짧은 아이템 설명(시드)에서 바이브코딩 프로토타이핑용 PRD.md 한 개를 만든다. 13개 섹션을 추론하고 남은 핵심 갭만 객관식으로 물으며, oneshot-prototyping 하니스가 그대로 읽는 `## Ralph Loop` 10개 하위 섹션·데모 도달 경로·인수조건·데이터 모델·디자인 브리프를 갖춘다. Use when 'PRD 만들어줘·작성해줘·써줘·짜줘', '바이브코딩 PRD·사양서', '클로드 코드용·커서용 PRD', '랄프 루프 PRD', 'write a PRD', 'product spec' 을 요청하거나, PRD 라는 말이 없어도 코딩 전 사양 정리나 기존 기획 문서를 PRD 수준으로 다듬기를 원할 때. Do NOT use for 사업계획서·정부지원사업 문서(gov-startup-bizplan), 단순 코드 작성·기능 명세, 일반 보고서·제안서."
---

# PRD-Vibecoding v4.3: Harness-v2 Contract PRD Protocol

This skill infers as many of the 13 sections as possible from the user's short item description (the "seed"), asks only the gap questions that cannot be inferred, and writes one PRD.md. **Core**: every PRD it produces is the exact input contract of the `oneshot-prototyping` harness (card `setup-fullstack-prototype` v2.2) — the user puts `PRD.md` in a project folder, says "프로토타이핑" in Claude Code, and the harness runs non-stop through four gates to a deployed, designed demo.

> **Changelog**: v4.3 (2026-11-16) — seed plan, edge pack, reach-path table, banned placeholders, trimmed motion/image policy, 2-round question cap, `scripts/lint-prd.mjs`; `## Ralph Loop` contract unchanged from v4.1.

> **Language note**: This protocol is English and governs your *process* only. All user-facing output — questions, option labels, the entire PRD — is Korean.

<CONTEXT name="harness_contract">

| Harness step | Reads from the PRD | Consequence of a weak PRD |
|---|---|---|
| Bootstrap — PrdValidator | the 7 elements under recognizable headings | gaps tagged `[TODO: 오너 확인]`; the harness guesses |
| Bootstrap — `## Ralph Loop` parse | the 10 sub-sections, verbatim names | defaults everywhere; legacy blocks ignored |
| **Gate 1 — demo draft** | §5 features + their demo interaction, §6 entities/facets/roles, §12 AC | every feature is reached from the entry surface and operated once; an under-specified interaction is guessed; AC become the build-green tests |
| Gate 1 — seed | §6.3 seed plan, glossary, §3 roles | seed spreads values across the facets you name; placeholder content fails |
| **Gate D — design elevation** | **§8 design brief** (incl. §8.2 motion map, signature interactions, image slots), §8.1 archetypes, §8.3 states, `### 디자인 고도화` | a thin §8 yields a generic look; an explicit PRD phrase ("애니메이션 없음", "이미지 없음") beats harness defaults and a silent PRD makes it improvise, so §8.2 states motion and imagery (PHASE 3.8) |
| Gate 2 — security | §6.4 permission matrix, `### 보안 강화 범위` | cross-role access is tested against §6.4; without it authorization is invented |
| Gate 3 — deploy | `### 산출물 형태`, `### 자율성 강도`, the end-to-end feature | channel, deploy mode, round-trip target |
| Scope guard (every cycle) | §5.3 Non-goals | work drifting into a Non-goal is rolled back |

Harness facts this PRD must stay consistent with:
- **Demo-first.** The pass builds against in-repo fixtures (`demo-mock`); no login screen — the app boots into a demo session and roles switch in the UI. Accounts, real auth, and the real-store cutover are the follow-up run.
- **Store.** `google-sheets` (default, provisioned in-pass) | `file` (local/offline/desktop/CLI state) | `none`. No Supabase or relational branch.
- **Deploy mode.** `AUTO` | `DRY-RUN`; no CONFIRM mode.
- **SEO/AEO/GEO** is out of scope; a `### SEO 적용 범위` block is ignored.
</CONTEXT>

<CRITICAL_CONSTRAINTS>
[MUST] **Output language is Korean.** Every question, option label, and the entire PRD.md (headings and body) are Korean. English appears only in the 7-element anchors in parentheses, code, identifiers, commands, and the verbatim `## Ralph Loop` enum values. Internal tags stay exactly `[가정]` and `[확인필요]`.
[MUST] **Ask only by multiple choice, in the environment's tool, within the cap.** claude.ai → `ask_user_input_v0` (single_select / multi_select). Claude Code → `AskUserQuestion` (multiSelect true/false; it adds an "Other" free-text option by itself). **At most 2 rounds and 4 questions in total**, 2–4 options each. Every question offers "추천받기 (Claude가 결정)"; in claude.ai also "기타 (직접 입력)". 기타/Other text is the answer, verbatim. With neither tool (or headless), ask a numbered Korean multiple-choice list in chat, or treat the answer as 추천받기 when nobody can answer.
[MUST] **Infer first, ask last.** Ask only: artifact_type (non-web signal or ambiguity), roles (the seed hints at several actors but not which), design tone (the look is not implied). Everything else (non-goals, stack, MVP cut, deploy mode, security scope, store, entities, seed, screens) is derived, tagged `[가정]`, and surfaced in the Korean summary. What neither seed nor answer can settle is `[확인필요]`.
[MUST] **Emit the `## Ralph Loop` section with exactly these 10 sub-sections, in this order, with these Korean names:** `### 게이트 임계값` · `### 추가 sub-agent` · `### 자율성 강도` · `### 추가 종료 조건` · `### 건너뛸 Phase` · `### 보안 강화 범위` · `### 산출물 형태` · `### 데이터 저장소` · `### 데모 모드` · `### 디자인 고도화`. The header is exactly `## Ralph Loop`. Use only harness-known enum values; no `### SEO 적용 범위`, no CONFIRM deploy value; follow the PHASE 4 emission rules.
[MUST] **Surface the 7 elements** (Problem / Users / Success / Non-goals / Constraints / Stack / Design Context) under Korean headings with the English anchor in parentheses; Success (§4.4) and Constraints (§9) are dedicated sub-sections.
[MUST] **Fix artifact_type** (web-app / browser-extension / desktop-app / cli / library / mobile / api-service) and state it identically in the metadata block, `### 산출물 형태`, and §7. Any non-web signal makes it a question.
[MUST] **Give every Must feature a reach path and a test-translatable acceptance criterion.** §5.1 names, per feature, the path from the artifact's entry surface (PHASE 3.4) and the one real interaction with its observable result — what the harness's reachability verifier performs. §12 turns each into an AC (Given-When-Then or one line) a test can assert, and `빌드 green 명령` includes the test step.
[MUST] **Write §8 as a design brief the harness can turn into Higgsfield assets and local mockups**: nameable look, 3–5 brand attributes, references (borrow / avoid), color roles, type pairing, density, imagery and short-video needs (never text inside an image), the PHASE 3.8 motion and image policy (web-UI types), screen archetypes with fixture data, state designs. Every value not from the user is `[가정]`.
[MUST] **Keep the MVP demo-first**: no login or signup screen, roles switched in the UI, accounts and real authentication in §5.3 Non-goals and §11 Phase 2. Only the deploy token is a credential; `### 추가 종료 조건` carries only stricter, credential-free, measurable criteria — never plateau, time, iteration limits, or Lighthouse.
[MUST] **Non-goals (§5.3) list at least 3 items**, including the account system. Later-phase features go to §5.2, never into §5.3.
[MUST] **Never write placeholder vocabulary**: `lorem`, `test1`, `사용자1`, `홍길동`, `example.com`, `아이템 A`, nor real people, companies, emails, phones, or domains. Seed-plan names are synthetic.
[MUST] **Deliver one PRD.md.** claude.ai → `/mnt/user-data/outputs/PRD-{slug}-{YYMMDD}.md`, then `present_files`. Claude Code → `PRD.md` at the project root (the harness reads that path); an existing `PRD.md` is first copied to `PRD.{YYMMDD-HHMM}.bak.md`.
[SHOULD] Use strong user-memory defaults (stack, domain familiarity, design tone) as `[가정]` instead of asking.
[SHOULD] Right-size: conditional sections (§6.4, §8.5, non-web details) only when they apply. Generated PRD: 12–22K characters for UI types, 8–14K characters for cli/library/api-service (Korean text counted as characters, not bytes). Do not pad.
</CRITICAL_CONSTRAINTS>

---

## PHASE 0: Entry triage

- **New + seed present** → PHASE 1.
- **New + no seed** (only "PRD 만들어줘") → say once, in Korean: "어떤 아이템에 대한 PRD인가요? 핵심 아이디어를 2~5줄로 설명해주세요. 최대한 추론한 뒤 꼭 필요한 것만 객관식으로 여쭙고, 프로토타이핑 하니스로 바로 돌릴 수 있게 작성하겠습니다." Then wait.
- **Existing document attached** → treat as seed → PHASE 1.
- **Older-harness PRD** (has `### SEO 적용 범위`, a CONFIRM deploy mode, Supabase §10.1/§10.2 branches, or lacks `### 데이터 저장소` / `### 데모 모드` / `### 디자인 고도화`) → offer in one line to migrate it to the v2 contract; on yes keep the user's content, drop retired blocks, add missing sub-sections with `[가정]` defaults, rewrite §8 as a design brief.
- **Partial supplement** (one section requested) → ask only that section's gaps and leave the rest untouched; if the PRD lacks `## Ralph Loop` or the 7-element anchors, offer to add them.

---

## PHASE 1: Seed capture & auto-inference (internal — do not output)

### 1.1 Parse the seed

- **Explicit**: name, users, core features, domain, stack keywords; B2C / B2B / internal.
- **artifact_type**: web framework → web-app · manifest/content script → browser-extension · Electron/Tauri → desktop-app · bin/argv/subcommands → cli · package/SDK → library · React Native/Flutter → mobile · REST/gRPC only → api-service. Ambiguous → web-app, but any non-web signal promotes it to a question.
- **Roles**: every distinct actor the seed implies (점주 / 직원 / 고객).
- **Data shape** decides `### 데이터 저장소`: persisted shared data → `google-sheets`; local-only/offline or desktop/CLI state → `file`; nothing persisted → `none`.
- **Screens**: 데모 진입 / 목록 / 상세 / 생성·편집 폼 / 대시보드·요약 / 설정 / 역할 전환. **Design signals**: audience, domain conventions, named brands; infer a look when silent (식자재 발주 도구 → 조밀한 업무형; 반려동물 커뮤니티 → 따뜻한 소비자형).
- **Sensitive data** (health / payments / finance / PII / minors) → raise `### 보안 강화 범위` and 컴플라이언스 as a `[가정]` default, never a question.

### 1.2 Classify every item

| Result | Handling |
|---|---|
| ✅ clearly derivable | fill as-is |
| ⚠️ inferable from seed + domain common sense | fill + `[가정]` |
| ❓ decisive and not inferable (artifact_type, ambiguous roles, design tone only) | queue a multiple-choice question |
| ❌ not inferable, weak preference | fill `[확인필요]` |

Judge the 10 `## Ralph Loop` values the same way; almost all have strong defaults (`[가정]`).

---

## PHASE 2: Gap questions (cap: 2 rounds, 4 questions)

One Korean line before the call: "시드 잘 받았습니다. 게이트를 좌우하는 결정 {N}개만 여쭙겠습니다. 나머지는 추론해 [가정]/[확인필요]로 표시합니다." A second round only if an answer opens a new decisive gap. Show the 3 most plausible options + 추천받기.

**Artifact type** (single — non-web signal or ambiguity)
질문: "무엇을 만드나요? (게이트·배포 방식이 형태별로 달라집니다)" — 웹앱 · 브라우저 확장 프로그램 · 데스크톱 앱 / CLI 도구 · 추천받기 (시드로 Claude가 판정)

**Roles** (multi — several actors hinted, unclear which; options = ≤ 3 inferred actors + 추천받기)
질문: "데모에서 전환해 볼 **역할**을 모두 골라주세요 (로그인 없이 화면 안에서 역할을 바꿔 봅니다)"

**Design tone** (single — the look is not implied)
질문: "어떤 인상의 제품이어야 하나요? (하니스가 이 방향으로 전 화면을 설계합니다)" — e.g. 신뢰·정돈 · 따뜻·친근 · 대담·에디토리얼 (each with a short gloss, fitted to the domain) · 추천받기

**Answer handling**: 추천받기 → decide from seed + domain, tag `[가정]`. 기타/Other → the free text is the answer (for artifact_type, mapped to the enum when it names a value not shown: library / mobile / api-service). Non-web artifact_type → `### 디자인 고도화` 범위 per type (cli / api-service → SKIP; library → TOKENS_ONLY), deploy channel per type.

---

## PHASE 3: Derive and integrate (internal — derive, never ask; tag `[가정]`)

Seed-explicit → as-is. Seed-inferred → `[가정]`. Answers → as-is (추천받기 → Claude's choice + `[가정]`). `## Ralph Loop` → answers first, else harness default + `[가정]`. Neither → `[확인필요]`.

### 3.1 Entities, fields, rules

- 3–6 entities (nouns that are listed, have a detail view, and change state), each with ≥ 1 **write feature** (the harness proves idempotence with real writes). Fix references with cardinality (1:N / N:M, required or not).
- Per entity 5–9 fields, including ≥ 2 filterable facets (enum or reference) and ≥ 3 sortable columns (date, number, text).
- **Enums are listed in full** — never "등", "…", "기타". Every free-text field has a **max length** number. Every date/amount field has a realistic range. Reference fields name the target (`Entity.id`).
- No hard delete ("영구 삭제" → soft delete + archive filter, `[가정]`), no hard-coded DNS names or hosts, no unreachable thresholds (empty-gray ≤ 5%, Lighthouse ≥ 98). Admin-approval, invite, or import-only states are **seeded rows already in that state**, never setup steps.

### 3.2 Seed plan (§6.3)

- **Floor** per major list = 2 × page size (table 20, card grid 12, mobile list 10); compare with the sort-view minimum (6) and take the larger.
- **Facet counts**: a minimum row count per enum member, one minority state at 2–3 rows, unassigned rows for reference facets. **Sort spread**: dates over a range (≤ 2 rows per date), amounts over a range, spread title initials.
- **Dashboard tiles**: a formula and a plausible target range each, so seed data renders as real numbers.
- **Glossary** (all synthetic): 8–20 person names (Korean surname distribution, no celebrities), 4–8 organizations/teams/projects, 6–10 title patterns in the domain's own words, Korean status labels per enum member, unit/currency ranges.

### 3.3 Edge pack (4)

Name collection, record, and reach path for each; an unreachable edge counts as unverified, not N/A. **Empty**: which parent record or filter combination yields 0 rows. **Single**: which parent has exactly 1 row. **Max-length**: one record with every free-text field at its max. **Malformed**: define it for the domain (value outside the enum, dangling reference, non-ISO date) — 1 record shown as an error state (cli: error output + internal-error exit code; api-service: error response).

### 3.4 Reach paths per artifact_type

Each artifact proves reachability in its own form; web wording on a cli PRD makes the harness invent screens. Apply it to §5.1, §8.1, and the edge reach paths.

| artifact_type | Entry surface | One interaction | Observable result |
|---|---|---|---|
| web-app / mobile | demo entry screen (mobile: first screen) → route | one click or tap | badge, count, or toast change |
| browser-extension | popup / options feature index | one action in that entry point | extension UI change + `chrome.storage` update |
| desktop-app | first window → menu or shortcut | one action | window state + userData update |
| cli | `<bin> --help` → subcommand | one run with args | stdout/stderr + exit code (success · user error · internal error) |
| library | example app → public API | one public call | return value or thrown error type |
| api-service | documented `METHOD /path` | one request | status code + response body fields |

- A path starts at the entry surface; setup steps, hand-typed URLs, devtools, manual file edits, or env injection mean unreachable. The entry surface lists every Must feature (cli: `--help`; api-service: an endpoint index; library: the example app calls every public entry point).
- One interaction, one observed fact: ✗ "승인을 처리한다" → ✓ "첫 행 승인 클릭 → 배지 검토중→승인, 대기 3→2, 토스트" (cli: `orders approve ORD-3F2K` → stdout `승인 완료 · 대기 3→2` + exit 0).
- UI-less types replace the §8.1 table with a surface definition: cli = subcommands, flags, stdout form, exit-code map, usage examples on the bundled demo dataset; library = exports, signatures, error types, example-app command; api-service = every `METHOD /path`, schemas, error table, health path, one executable request each. Each feature gets a one-line description.

### 3.5 Roles and permissions

- ≥ 2 roles with ≥ 1 explicit deny in §6.4; a single-actor product gets a second read-only role (`[가정]`). Roles in §3 = §6.4 = `### 데모 모드` 역할 목록.
- Every role is selectable in the UI switcher; UI-less types name the switcher (`--as <role>` flag, demo-session header, or example-app argument). Never a login or credential.

### 3.6 Gate-3 end-to-end feature

Name one feature in §5.1 whose write is undone by a reset (write + reset round trip): entry → route → action → reset button (UI types); write subcommand → output → reset subcommand (cli); documented write request → response → reset or re-seed (api-service); example-app write call → return value → reset call (library).

### 3.7 Non-goals vs follow-up

§5.3 holds what the harness must not build (scope guard): the account system plus ≥ 2 at-risk items for the domain (결제, 관리자 대시보드, 다국어, 알림, AI/LLM 기능, SNS 공유, 외부 연동, 분석). Later features go to §5.2, never into §5.3.

### 3.8 Motion & image policy (web-UI types, only when `### 디자인 고도화` 범위 = FULL; cli / library / api-service → N/A)

Write into §8.2, never into `## Ralph Loop`, every value `[가정]`.

**Motion — two layers**
- **반응** (hover · press · focus · toggle): one line, CSS `transition` ≤ 200ms. **장식** (등장 · 전환 · 카운트업 · 앰비언트, `@keyframes`): a **모션 지도**, one line per §8.1 screen ("어느 요소가 · 언제 · 어떻게"), ≥ 5 lines in total (hero, list swap after filter/sort, status-change pop, progress growth, pausable ticker); no auto-rotating content carousels.
- **시그니처 인터랙션 2–3개** from the domain ("조작 → 보이는 것"). When one equals a §5.1 interaction, keep its observable result and add only staging: the end state after the motion equals the §5.1 result.
- Count-ups, meters, and tickers show real values from §6.3 formulas. Always insert the four fixed lines of the §8.2 template: §6.3-derived count-up values, server-render final state (no hydration drift), `prefers-reduced-motion` final state, 5 s pause toggle / ticker stop button.
- Suppressing phrases ("애니메이션 없음", "정적 구성", "모션 최소화") only with a cited accessibility policy, brand guide, or regulation on the same line; a calm tone means slower and smaller motion, not none.

**Image — slots and sources**
- **슬롯 목록** from §8.1 (main hero · section heroes · representative cards · default thumbnail per major enum value · empty/complete-state art): one scene phrase per slot and a **total count**; harness cap 24, state a number only to exceed it.
- Sources: owner photos → build-time generated images → code illustrations; never hard-code a generation tool. Build-time generation with committed static assets does not collide with "AI/LLM 기능" or "외부 유료 API" Non-goals; record `[가정] 이미지는 빌드 중에 생성해 정적 에셋으로 커밋한다` in §13.1.
- **쓰지 않는 자리**: spots implying real people (reviews, cases, staff), real brands/logos/packaging; spots that could pass for the real thing (food menu, before/after, property photos) get a "연출 이미지" label or are excluded.
- Suppressing phrases ("이미지 없음", "색면만") only with a cited license, brand guide, or regulation; having no photos is a reason to fill generation slots, not to suppress them.

---

## PHASE 4: PRD synthesis (13 sections + Ralph Loop)

The PRD is user-facing, so headings and body are Korean; the 7-element English anchors and the `## Ralph Loop` names and enum values stay verbatim — they are what the harness reads. Replace every `{…}` and drop skeleton example text; delete every skeleton line starting with `> ` except the 5 metadata lines under the title; no placeholder residue (an API path parameter such as `/items/{id}` is not residue; put JSON bodies and other brace text in backticks).

````markdown
# PRD: {프로젝트명}

> **한 줄 정의**: ...
> **작성일**: YYYY-MM-DD · **버전**: v1.0
> **타겟 실행 환경**: Claude Code + oneshot-prototyping 하니스 (데모 초안 → Higgsfield 디자인 고도화 → 보안 → 배포)
> **산출물 형태(artifact_type)**: {web-app | browser-extension | desktop-app | cli | library | mobile | api-service}
> **작성자**: {사용자명 또는 미지정}

---

## 1. 프로젝트 정체성
- **한 줄 정의** · **핵심 가치 제안 (Value Proposition)** · **비전 / 미션**·**이해관계자** (해당할 때만, 한 줄)

## 2. 문제 정의 (Problem)
- **해결하려는 문제** (구체적·검증 가능) · **현재 솔루션의 한계** · **차별화 (Why now? Why us?)**

## 3. 타겟 사용자 (Users)
- **핵심 페르소나**: 직업·나이대·디지털 친숙도·사용 맥락
- **부 페르소나** (있을 때) · **안티-페르소나** (해당할 때만, 한 줄)
- **역할 (Roles)**: {역할명 — 무엇을 하는가} × 2개 이상. 데모에서는 로그인 없이 화면 안에서 역할을 전환한다.

## 4. 핵심 사용자 시나리오
### 4.1 시나리오 1 (우선순위 1): {제목} — Given / When / Then
### 4.2 시나리오 2 / 4.3 시나리오 3
### 4.4 성공 기준 (Success) — 측정 가능
> 하니스 "Success" 요소. 이진·측정 가능하게. "잘 동작한다"·"직관적이다" 같은 자기판단 어휘 금지.
- **북극성 지표**: ...
- **데모 성공 판정**: 예) "진입 표면에서 {핵심 기능}에 도달해 {상호작용}을 완료할 수 있다 (AC-01)"
- 이 기준은 §12 의 자동 테스트와 하니스의 도달성 검증으로 확인된다.

## 5. 기능 요구사항
### 5.1 MVP 필수 기능 (Must)
| ID | 기능명 | 설명 | 도달 경로 (진입 표면 →) | 증명 상호작용 1건 → 관찰 결과 | 인수조건 (AC-nn, 본문은 §12) | 상태 UI | 역할 |
| -- | -- | -- | -- | -- | -- | -- | -- |
| F-01 | ... | ... | 진입 → {메뉴} → {화면} | {무엇을 누르면 무엇이 바뀌는가} | AC-01 | 로딩/빈/에러 | {역할} |
> **도달 경로 · 증명 상호작용**: 하니스가 진입 표면에서 각 기능까지 실제로 이동해 이 상호작용을 1회 수행한다. 진입 표면·관찰 결과는 artifact_type 에 맞춘다(cli: stdout + exit code, api-service: 상태 코드 + 본문). 설정 단계·수기 URL·개발자 도구가 필요하면 미달이다.
> **상태 UI**: 로딩·빈·에러 상태. 하니스가 시드로 실제 도달한다.
- **게이트 3 종단 기능**: {F-0N} — {쓰기 + 리셋 왕복 절차}

### 5.2 후속 실행으로 이관 (Nice — 이번 범위 아님) — N-01: ...

### 5.3 명시적 비범위 (Out of Scope / Non-goals) ⚠️ 하니스 스코프 가드
> 하니스가 매 사이클 이 영역 침범을 롤백한다. 최소 3개. 나중에 할 기능은 §5.2 에 둔다.
- O-01: 계정 시스템 · 회원가입 · 실사용자 인증 (후속 단계 — 이번 패스는 데모 세션)
- O-02: ...
- O-03: ...

## 6. 데이터 모델
### 6.1 엔티티 관계 (간이 ERD — 텍스트, 카디널리티 표기)
### 6.2 엔티티별 필드
| 필드 | 타입 | 필수 | 고유 | 허용값(enum 전수)·범위·최대 길이 | 참조 대상 | 설명 |
> 하니스가 표준 필드(`id` ULID · `created_at` · `updated_at` · `rev` · `deleted_at` 소프트 삭제)를 붙이고 이 표의 제약을 스키마로 강제한다. 표준 필드는 적지 않는다. 엔티티마다 필터 패싯·정렬 컬럼·쓰기 기능(F-xx)을 한 줄로 덧붙인다.
### 6.3 목록·패싯·시드 계획
| 목록 화면 | 필터 패싯 | 정렬 컬럼 | 페이지 크기 → 시드 하한 | 도메인 사실감 메모 |
- **패싯 분포**: {enum 멤버별 최소 행 수, 소수 상태 2~3행, 미배정 행} · **정렬 값 분산**: {날짜·금액 범위, 초성 분산}
- **대시보드 타일**: {타일 — 산식 — 목표 범위}
- **엣지 4종** (빈 · 단일 · 최대 길이 · malformed): 각각 {대상 컬렉션·레코드} — {도달 경로}
- **도메인 어휘 사전** (전부 합성값): 인명 · 조직·프로젝트명 · 제목 패턴 · 상태 라벨 · 단위·수치 범위
> 하니스 시드는 이 계획대로 값을 퍼뜨린다. "도메인 사실감 메모" 예: "메뉴명은 실제 한식 메뉴, 가격은 8,000~18,000원대".
### 6.4 권한 매트릭스 (역할 × 리소스 × 액션)  {역할이 2개 이상일 때}
| 역할 | 리소스 | 조회 | 생성 | 수정 | 삭제 | 조건 (본인 소유 등) |
> 게이트 2 가 역할 전환으로 교차 역할 접근을 공격한다. 이 표가 정답지이며 명시적 거부가 1건 이상 있다.
### 6.5 외부 데이터 소스  {있을 때}

## 7. 기술 스택 (Stack)
- **artifact_type**: {web-app | browser-extension | desktop-app | cli | library | mobile | api-service}
| 레이어 | 선택 | 이유 |
> artifact_type 판정의 1차 신호. 데이터는 하니스의 데이터 접근 계층 뒤에 두며, 저장소는 `### 데이터 저장소` 가 정한다.

## 8. UI/UX 명세 & 디자인 브리프 (Design Context)
> 게이트 D 의 입력. 하니스가 이 브리프로 Higgsfield 에셋(불가 시 로컬 목업)을 넣은 목업을 만들어 전 화면을 설계한다. 에셋 목록과 프롬프트는 하니스가 만든다. UI 없는 형태(cli · library · api-service)는 §8.1 을 표면 정의(PHASE 3.4)로 대체하고 §8.2 시각 항목은 N/A.
### 8.1 화면 목록
| 경로 | 화면명 | 원형 | 보여줄 데이터 (엔티티·필드) | 주요 컴포넌트 | 역할 | 우선순위 |
> 원형: 데모 진입 / 목록 / 상세 / 생성·편집 폼 / 대시보드·요약 / 설정 / 역할 전환. 진입 화면은 모든 Must 기능을 이름·한 줄 설명·링크로 나열한다.
### 8.2 디자인 브리프 (Design Brief)
- **룩 한 줄**: {이름 붙일 수 있는 한 문장. 예: "새벽 도매시장의 장부처럼 조밀하고 믿음직한 업무 도구"}
- **브랜드 속성 3–5개**: {속성 — 드러나는 곳}
- **톤 & 보이스 (UI 카피)**: ...
- **레퍼런스**: {제품/사이트 — 가져올 것 / 피할 것} × 2–4
- **컬러 의도 (역할별)**: 배경 · 표면 · 본문 텍스트 · 강조 · 성공/경고/오류 — 본문 대비 4.5:1 이상
- **타이포 의도**: 디스플레이 / 본문 페어링 방향 (프레임워크 기본 서체 단독 사용 금지)
- **밀도**: 조밀 | 보통 | 여유 — 이유
- **이미지·영상 방향**: {필요한 이미지·짧은 영상의 자리, 분위기, 비율 — 이미지 안에 글자를 넣지 않는다}
  - 소스 우선순위: 오너 제공 사진 → 빌드 중 생성해 정적 에셋으로 커밋 → 코드 일러스트. 최종 화면에 빈 색면 자리를 남기지 않는다
  - 아트디렉션: {스타일(사진|일러스트|3D) · 조명 · 색 · 구도 · 피할 것}
  - 생성 슬롯(총 {N}장, 기본 상한 24장 — 넘길 때만 숫자 명시): {슬롯 이름 장수 · …}
  - 쓰지 않는 자리: {실제 사람임을 암시하는 자리 · 실존 상호·로고 · 실물로 오인될 자리의 처리}
- **모션 (반응)**: hover · press · focus · toggle 은 CSS `transition` 200ms 이하
- **모션 (장식)**: 등장 · 전환 · 카운트업 · 앰비언트. `transform` · `opacity` 만 움직인다. 화면별 모션 지도(5줄 이상):
  - {화면 · 요소} — {언제 · 어떻게 움직이는가}
  - 시그니처 인터랙션 2~3개: {조작 → 보이는 것}. 모션이 끝난 뒤의 화면은 §5.1 증명 상호작용의 결과와 같다
  - 카운트업·미터·티커의 수치는 §6.3 산식에서 계산한 실제 값이다
  - 서버 렌더는 최종 상태로 그리고 등장 상태는 클라이언트 마운트 뒤에만 적용한다 (초기 렌더에 난수·시스템 시계·`window` 없음, 레이아웃 시프트 0, 하이드레이션 경고 0)
  - `prefers-reduced-motion` 에서는 장식 모션을 끄고 최종 상태를 바로 보여 준다. 5초를 넘기는 자동 모션에는 "움직임 멈추기" 토글, 티커에는 자체 정지 버튼
- **프로젝트 고유 금지 사항**: ...
### 8.3 상태 디자인
| 화면 | 빈 상태 | 로딩 | 에러 | 단건 | 최대 길이 텍스트 |
> 각 상태가 무엇을 말하고 어떤 다음 행동을 권하는지.
### 8.4 컴포넌트 라이브러리
### 8.5 API 계약  {api-service 필수}
| 엔드포인트 | 메서드 | 요청 스키마 | 응답 스키마 | 에러 코드 | 인가 (데모 세션 역할) |

## 9. 비기능 요구사항 & 제약 (Constraints)
> 하니스 "Constraints" 요소.
- **성능 · 보안 · 접근성 (WCAG AA) · 다국어 · 반응형 (390 · 1440 기준)**
- **명시적 제약**: 위반 시 실패하는 예산·기한·금지 기술·외부 의존·규제

## 10. 외부 의존성 & 환경 변수
| 변수명 | 설명 | 출처 | 이번 패스 필요 | 부재 시 동작 |

- 게이트 1·D·2 는 자격증명 없이 통과하고(로그인 없음·시드·데모 세션), 배포 토큰만 게이트 3 에서 필요하다. `google-sheets` 는 하니스가 자동 연결하며 실패해도 데모는 완주한다. 실 인증·저장소 전환은 §11 Phase 2.

## 11. 마일스톤
- **Phase 1 — 하니스 1차 패스**: 데모 기능 초안 → 디자인 고도화 → 보안 → 배포 (Must 전부)
- **Phase 2 — 후속 실행**: `DEMO_MODE` 끄기 → 계정·인증 → 실 저장소 전환 → §5.2 기능

## 12. 인수 시나리오 (Acceptance Scenarios) — 자동 테스트 대상
> 각 AC 는 자동 테스트로 옮길 수 있게 쓴다. 빌드 green 명령이 테스트를 포함하므로 AC 가 게이트 1 에서 기능 완성을 강제한다.
**AC-01** (F-01): Given {시드 상태} · When {진입 표면 → 경로 → 상호작용} · Then {관찰 가능한 결과}

## 13. 리스크 / 가정 / 미해결 항목
### 13.1 가정 — `[가정]` 항목 일람
> 이미지 생성 슬롯이 있으면 `이미지는 빌드 중에 생성해 정적 에셋으로 커밋한다` 를 포함한다.
### 13.2 리스크
### 13.3 `[확인필요]` 항목 — 사용자 후속 액션

---

## Ralph Loop

### 게이트 임계값
- 빈 회색 비율 ≤ {35}%          (웹 UI 가 있을 때만)
- 정렬 뷰 항목 ≥ {6}개           (웹 UI 가 있을 때만)
- 표준 기능 {7}/{7} 작동          (웹 UI 가 있을 때만)
- 빌드 green 명령: `{pnpm lint && pnpm typecheck && pnpm test && pnpm build}`  ← 테스트 단계 필수
- 데이터 정합성 검사 통과율: {100}%
- Lighthouse Performance ≥ {N}   (선택)
- Lighthouse Accessibility ≥ {N} (선택)

### 추가 sub-agent
{선택. 예: PerformanceProfiler / LocalizationAgent. 없으면 "- 없음"}

### 자율성 강도
- production 배포 모드: {AUTO | DRY-RUN}
- 회귀 감지 임계값: {STRICT | LOOSE | OFF}
- 컨텍스트 핸드오프 임계: {30 | 20 | 15}

### 추가 종료 조건
{예: "점주 역할은 다른 매장 데이터를 조회할 수 없다 (테스트 통과)", "주문 금액은 서버 계산값만 인정한다". 없으면 "- 없음"}

### 건너뛸 Phase
{선택. 예: "skip: 데이터 계층 (상태 없는 산출물)". 없으면 "- 없음"}

### 보안 강화 범위
- 범위: {P0_ONLY | P0_P1 | P0_P1_P2 | SKIP}
- P1 통과 비율: ≥ {80}%
- 컴플라이언스: {없음 | SOC2 | ISMS-P | PIPA | GDPR}

### 산출물 형태
- artifact_type: {web-app | browser-extension | desktop-app | cli | library | mobile | api-service}
- 배포 채널: {AUTO | Vercel | Chrome Web Store | npm | PyPI | GitHub Releases | TestFlight | (지정)}
- 코드 서명·공증: {SKIP | REQUIRED}

### 데이터 저장소
- 저장소: {google-sheets | file | none}
- 스프레드시트 ID / 인증: {미지정 — 하니스가 이번 패스에서 생성·연결 | 기존 시트 ID}

### 데모 모드
- 시드 규모: {주요 목록당 최소 2페이지 | N행}
- 역할 목록: {§3 역할 — UI 역할 전환 대상. 단일 역할이면 "- 단일 역할"}
- 리셋 컨트롤 노출: on

### 디자인 고도화
- 범위: {FULL | TOKENS_ONLY | SKIP}
- 경로: {AUTO | HIGGSFIELD | LOCAL}
- 충실도 임계: 축별 ≥ {4}/5
- 핵심 화면: {§8.1 우선순위 상위 화면 — 작업 순서만 앞당긴다}

````

**`## Ralph Loop` emission rules (strict — the harness greps the headers and parses the values as-is)**
- Emit all 10 `### ` headers byte-exact, in canon order, in every PRD: never drop or rename one; no `(선택)` suffix, numbering, or emoji.
- Allowed edits inside the block: **substitute** a `{…}` slot with a resolved value, or **delete** a line. Never insert a line. One enum value per line — no `A | B` leftovers. Slot lists (`추가 sub-agent`, `추가 종료 조건`, `건너뛸 Phase`) keep only adopted items, else `- 없음`.
- Delete the three `웹 UI 가 있을 때만` lines for cli / library / api-service; delete the sort-view line when there is no list surface. Delete both Lighthouse lines unless the user named a Lighthouse target; Lighthouse appears only in `### 게이트 임계값`, never in `### 추가 종료 조건` or elsewhere. Thresholds must be reachable (PHASE 3.1).
- Justifications and notes go in the body (§9 or §13), never inside the block.
- Non-web: `### 디자인 고도화` SKIP for cli and api-service, TOKENS_ONLY for library; per-type deploy channel; signing `SKIP` for prototypes.

---

## PHASE 5: Self-verification (internal — reinforce anything unmet before output)

Write the PRD, then if Node is available and `<this skill's directory>/scripts/lint-prd.mjs` exists, run `node <this skill's directory>/scripts/lint-prd.mjs PRD.md` (mechanical parts of items 1, 2, 4, 9); fix and re-run until exit 0. Without Node or without the script (or in claude.ai) apply the same checklist by hand.

1. **Completeness** — 13 sections + `## Ralph Loop` filled; no `{…}` residue, skeleton example enums, or banned placeholder vocabulary.
2. **Ralph Loop contract** — exactly the 10 sub-sections, byte-exact, canon order; harness-known enum values, one per line; no `### SEO 적용 범위`; deploy ∈ {AUTO, DRY-RUN}; no inserted lines; Lighthouse only in `### 게이트 임계값`.
3. **7 elements** — each under a heading with its English anchor; Success (§4.4) and Constraints (§9) dedicated.
4. **artifact_type** — metadata = `### 산출물 형태` = §7; non-UI types SKIP (cli, api-service) / TOKENS_ONLY (library); web-only lines removed.
5. **Reach paths** — every Must feature starts at the entry surface with one interaction and an observable result; the entry surface lists every Must feature; every edge has a reach path.
6. **Enforceable success** — every Must feature has an assertable AC, no self-judgment vocabulary; the build-green command runs tests; one gate-3 end-to-end feature named.
7. **Data** — complete enums, max lengths, ranges, soft delete only, a write feature per entity; seed floor, facet counts, sort spread, tile formulas, glossary; edge pack with a defined malformed form.
8. **Roles** — ≥ 2 with ≥ 1 deny; §3 = §6.4 = `### 데모 모드` 역할 목록; each reachable from the UI switcher.
9. **Non-goals and termination** — ≥ 3 incl. the account system, none merely "later"; `### 추가 종료 조건` additive, credential-free, measurable.
10. **Design brief** — §8.2 look, 3–5 attributes, references, color roles with contrast rule, type, density, imagery; §8.1 archetype and data per screen; §8.3 empty / loading / error / single / max-length per list and detail screen; nothing Anti-Slop (purple-blue gradient, decorative header emoji, raw HEX, self-referential AI copy, fully centered layout, reaction transition > 200ms).
11. **Motion and image** (FULL web UI, else N/A) — map ≥ 5 lines, 2–3 signature interactions leaving §5.1 results unchanged, the four fixed lines (PHASE 3.8), slot list with total, source order, art direction, no-go spots, the build-time-generation `[가정]`, no unsupported suppression, decorative numbers from §6.3.
12. **Demo-first** — no login/signup/credential in §5/§8; accounts in §5.3 and §11 Phase 2; only the deploy token needed; filename `PRD.md`; length within the CRITICAL range.

---

## PHASE 6: Output

**File** — claude.ai: `/mnt/user-data/outputs/PRD-{slug}-{YYMMDD}.md` (UTF-8, no BOM) → `present_files`. Claude Code: back up any existing `PRD.md` to `PRD.{YYMMDD-HHMM}.bak.md`, then write `PRD.md` at the project root.

**Korean summary after the file (1–3 lines each)**
- **PRD 한 줄**: 어떤 제품, 어떤 단계 + artifact_type.
- **인터뷰**: 질문 {N}개 ({M}라운드), 자동 추론 항목 수.
- **하니스 설정**: artifact_type / 저장소 / 보안 범위 / 배포 모드 / 디자인 범위·경로 — **바꾸고 싶을 수 있는 값을 짚어준다 (특히 배포 AUTO, 추론으로 정한 비범위·스택)**.
- **디자인 브리프**: 룩 한 줄 + 시그니처 인터랙션 + 이미지 슬롯 총 장수. **기능 분포**: Must n / 후속 m / Non-goals k · 역할 r개.
- **태그**: [가정] a · [확인필요] b — b 항목의 후속 액션.
- **실행**: "이 PRD.md 를 프로젝트 폴더에 두고 Claude Code 에서 '이 PRD로 프로토타이핑 해줘' 라고 입력하세요. 시작 전 [확인필요] {b}개를 채워두세요."
