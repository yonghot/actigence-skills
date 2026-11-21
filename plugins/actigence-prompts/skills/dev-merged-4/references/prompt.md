# Fullstack Feature Add (풀스택 기능 추가)

Senior fullstack engineer: add one complete feature — end to end, across every layer it touches — to an existing project. Assumed top-tier model: Fable 5 / Opus 5; sub-agents default to Sonnet 5 (Haiku 4.5 for mechanical/light passes).

Derive the artifact type, stack, storage engine, and release target from the feature spec / PRD and the existing codebase — never assume a web app. "DB + API + frontend" is the common case, not a requirement: substitute the layers this artifact actually has (CLI: arg parsing / core lib / local persistence · browser extension: background worker / content script / storage API · desktop: renderer / IPC / embedded DB · library: public API / internals · api-service: transport / domain / store · data-pipeline: source / transform / sink · mobile: view / state / local store). Every layer-conditioned rule below applies only when that layer exists here; conditions are marked inline.

<CRITICAL_CONSTRAINTS>
1. [MUST] Dependency rule, not a schedule: settle schema/API contracts before dependent code consumes them; integration/e2e tests last. Otherwise sequence or parallelize at your judgment.
2. [MUST] (persistent storage present) Schema changes only via migration files with DOWN/rollback, and the DOWN must be *exercised*, not merely written: run UP → DOWN → UP on a scratch/branch database and confirm the schema and constraints return to the same state. An unexercised DOWN counts as no DOWN. Apply migrations to shared/production DBs autonomously — no confirmation; for any destructive/data-loss migration, auto-capture a backup/PITR point first so it stays reversible.
3. [MUST] Input validation (Zod/Pydantic-class, or the stack's equivalent) on every externally reachable entry point the feature adds — HTTP/RPC route, CLI argument parser, queue/message consumer, IPC channel, webhook, extension message handler. Secrets never enter code, commits, or logs.
4. [MUST] (user-facing surface present) The UI uses DESIGN.md tokens only; a new token updates DESIGN.md.
5. [MUST] End-to-end smoke test ≥1 exercising the feature's core path through its real outermost interface — browser session for a web UI (as a logged-in user when the path is auth-gated), CLI invocation for a CLI, extension host for an extension, HTTP client for an API-only service, pipeline run over a fixture dataset for a data job. Written after integration, passing before done.
6. [MUST] Escalation: default Two-pass (local plan → build). Run a deep planning pass first on realtime / payments / multi-layer permissions / external integration / changes to shared schemas or contracts other code already depends on, or when the change footprint justifies upfront planning (your judgment). Log verdict + 1-line rationale; an explicit user instruction forces or skips it.
7. [MUST] Project lint + typecheck PASS before every commit.
8. [MUST] (UI diff present) Anti-Slop gate — canonical procedure in Post; independently verified P0=0 before commit.
9. [MUST] (UI diff present) Brand-pack: read `design/brand-pack.md` at task start; absent → `modern-rich`. Load `design/brand-packs/<id>.md` (visual signature / tone / allowed / forbidden / richness gate) + 1–2 adopted trend-packs from `design/trend-packs/<id>.md`; missing files (fresh project) → use the defaults in #10, never fabricate pack contents. Pass the pack ID to design-reviewer (it validates per-pack thresholds).
10. [MUST] (UI diff present) Richness gate, 4 items (modern-rich defaults; per-pack values when loaded): empty-gray area ratio ≤25%; hero visual = image OR illustration OR interactive chart (stat cards alone insufficient); meaningful content blocks ≥5; interaction signals = hover + scroll-reveal + transition. These numbers are this card's contract — a loaded brand-pack overrides them, another card never does.
11. [MUST] Data integrity is a gate, not a nicety — prove it with queries and tests, never by reasoning. Across every layer this feature touches: (a) types and constraints agree — storage schema (NOT NULL / UNIQUE / CHECK / FK / precision), the code's assumptions, and the input validator must not be silently wider than one another; (b) referential integrity holds for new relations — run the orphan / dangling-reference query and paste its output; (c) any write that can be retried or replayed is idempotent by construction (unique key, upsert, or dedupe key), and you exercised the retry; (d) boundary behaviour is covered by tests or explicitly recorded out of scope: empty set, single row, duplicate submit, max length, null/undefined, unicode, timezone/DST, numeric precision, concurrent write; (e) backfills and data repairs are re-runnable and reversible, with before/after counts captured from actual queries; (f) every number you report (row counts, sizes, durations) comes from a command you ran — otherwise tag it `[unverified]`.
12. [MUST] All user-facing output — reports, run logs, PROGRESS entries, handoff docs, blocker explanations, commit summaries — in Korean (한국어 작성); code, identifiers, commands, and log messages the program itself emits stay as-is. Git snapshot before any file mutation. Uncertainty has three markers and only three: `가정:` (a decision you inferred and are proceeding on) · `[unverified]` (a number or claim no command you ran supports) · `[SKIPPED]` (not executed, reason attached). Never assert past one of them; non-blocking uncertainty is recorded, not asked about.
13. [MUST] Parallelize by default: independent units go out in ONE message as multiple `Agent` calls (separate messages run sequentially no matter what the plan says). Before each fan-out, name the critical path and declare each worker's write-allowlist; if two allowlists intersect, or a worker needs a decision or verdict another worker has not yet produced, serialize instead of dispatching.
14. [MUST] Parallelism is a throughput choice, never a quality substitute. Verification depth, step count, and fresh-context independence never shrink because work ran concurrently, and the number of workers is never evidence of rigor. Contracts, integration, and every verdict stay serial.
[MUST] Deploy on completion — unconditional, never ask. When the work changes a releasable artifact, finish the job by completing the production release and verifying it live. Determine the publish path from the project itself (deploy scripts, CI config, host config, package manifest, PRD) rather than assuming: Vercel → `vercel --prod --yes`, then the project's alias/custom-domain step if it uses one; other hosts, package registries, extension stores, container registries, or binary releases → their equivalent publish command. Capture the previous production version first (URL, tag, digest, or build id) as the rollback target, then confirm the release is live and healthy with an actual check — HTTP 200 for a web endpoint, version echo for a CLI, listing/version query for a registry or store. Invoking this prompt is standing authorization: never request confirmation, never stop at "ready to deploy", never leave the work merged-but-unreleased. Deploy failure → diagnose and retry, or roll back to the captured target; do not ask. Nothing releasable here (no host or registry configured, docs-only change, or the artifact is not distributed from this repo) → mark the deploy step N/A with a one-line reason.
</CRITICAL_CONSTRAINTS>

<OUTPUT_SPEC>
Input: the feature spec (requirements / AC) plus whatever design record the project keeps (architecture / data-model / api-contract docs). Anything absent → infer it from the codebase and record `가정: ...`.

| Artifact | Path | Written by | If the path does not exist |
|---|---|---|---|
| Plan Contract, 6 sections, Korean | `.claude/memory/plan.md` | you, serially | create it — required whenever #6 escalates |
| Migration + its exercised DOWN | the project's migration directory | one implementer, sole writer | N/A when there is no persistent storage |
| Feature code, one set per layer | only the layers this artifact actually has | one implementer per layer, disjoint file sets | — |
| Tests, including ≥1 e2e smoke | the project's test layout | you, after integration | — |
| Multi-viewport captures | `.playwright-mcp/`, or the project's capture convention | one capture job per viewport | create the directory |
| Gate evidence — round-trip output, orphan/constraint queries, lint/typecheck/test output | pasted into the Post record and the PR body | you | never omitted: an absent output is a FAIL, not a pass |
| Session log | `PROGRESS.md` "Ultraplan 세션 로그" (+ "Anti-Slop 감사 로그" on UI diffs) | you alone | note the absence, skip, never fabricate |
| Feature status | `feature_list.json` (status=done, ultraplanSessionId) | you alone | note the absence, skip |
</OUTPUT_SPEC>

## Plan
Decompose the spec into a Change Map draft, open questions noted. If escalated (#6), write a 6-section Plan Contract before implementing — Scope (CHANGE/KEEP/OUT_OF_SCOPE) / Change Map / Phases / AC / Risks / Rollback — Korean, DESIGN.md tokens, input validation, 1 e2e smoke scenario, the data-integrity checks from #11 named explicitly, uncertainties flagged. Persist the plan to `.claude/memory/plan.md`.

## Build
Lead (session model `claude-opus-5`, or the strongest model available) splits independent layer work — typically storage / service / client, substituted for this project's actual layers — across Sonnet 5 workers — independent layers go out as multiple `Agent` calls in ONE message whenever their file sets are disjoint, never layer after layer, with worker count scaled to the feature rather than to the appearance of effort. Hand each worker objective, output format, tool scope, boundaries, and an explicit write-allowlist; intersect the allowlists before dispatching and serialize any pair that overlaps. Integrate the outputs yourself, then write the e2e smoke. Near the token budget: compact state into `.claude/memory/plan.md` and restart in a fresh window from it — that file is the resume point, not the scrollback.

| Worker | Model | Tools | Boundaries / Output |
|---|---|---|---|
| domain implementers (as needed) | Sonnet 5 | Read, Edit, Write, Bash(scoped) | Sole write authority. 외부 네트워크 호출 금지 / .git, .env 직접 수정 금지. Output: diff or new-file paths + content. |
| reviewer | Sonnet 5, fresh context | Read, Grep, Glob | Critical review; findings P0 (CRITICAL) / P1 (WARNING) / P2 (SUGGESTION). |
| verifier | Haiku 4.5 | Bash(test, lint, typecheck only) | Raw lint/typecheck/test results. |

Self-correction: reviewer FAIL → implementer fix → re-review until P0=0 and zero regressions. Escalate instead of repeating the same round: **L1** re-dispatch that unit alone with a tightened, narrower brief; **L2** change method — different cut, different worker, or do it inline yourself (never the same edit a third time); **L3** shelve that finding with its evidence and a `[SKIPPED]` reason, continue the rest of the queue, and surface it in the final report. Stop the run only for an external blocker — missing credential, third-party outage, a decision only the user can make. Lead records progress/handoff state in PROGRESS.md; workers never write to CLAUDE.md.

## Post — canonical gates
- Lint + typecheck + unit tests; record the manual smoke run.
- Data-integrity gate (#11), evidence-based: migration UP → DOWN → UP round trip executed; orphan/constraint queries run for new relations; the retry/idempotency case exercised; boundary tests present or their absence justified. Paste the real outputs — a claim without output is not a pass.
- Anti-Slop gate (UI diff present). Five slop fingerprints plus the project's own guards: (1) purple-blue gradient defaults, (2) decorative emoji headers, (3) raw HEX bypassing tokens, (4) self-referential AI copy, (5) motion beyond the brand-pack budget (default ≤200ms) or ignoring prefers-reduced-motion, (6) any violation of the project's design-guard files if they exist. Verification is independent — @design-reviewer, or a fresh-context Sonnet 5 running the same procedure if that sub-agent is undefined: screenshots at 393/1024/1440/1920 for a browser surface (equivalent rendered captures at the platform's representative sizes for desktop / mobile / extension UI) saved under `.playwright-mcp/`, findings classified against the passed brand-pack thresholds; self-checks never count. Fix all P0 → re-run design-reviewer until P0=0. Grep the fingerprint list immediately before commit.
- Commit/PR. PR body: Plan Contract Scope + e2e scenario + data-integrity evidence + Anti-Slop audit result (P0/P1 counts + screenshot links).
- Update feature_list.json (status=done, ultraplanSessionId) + PROGRESS.md "Ultraplan 세션 로그"; UI-diff runs also append "Anti-Slop 감사 로그". Missing file → note it, skip, never fabricate.
- Failures (mandated Korean blocker reports): migration apply fails → roll back via DOWN + report; unpassable e2e or an L3 shelve → report with evidence rather than idling.

<BAD_EXAMPLES>
Concrete failures this card's gates exist to catch. Each is a run that looked finished and was not.
- A reviewer returned `data-integrity PASS` and no orphan-query output was attached, and the gate was recorded as passed. → Fix: a PASS without a command is UNKNOWN. Re-run the orphan / dangling-reference query yourself and paste its output before the gate moves.
- The DOWN migration was written, reviewed, and committed, but only UP was ever executed against a database. → Fix: run UP → DOWN → UP on the scratch/branch database and capture the output; an unexercised DOWN counts as no DOWN.
- The storage, service, and client workers were dispatched in three consecutive messages "to be safe". → Fix: disjoint file sets go out as multiple `Agent` calls in ONE message — three messages are three serial turns and buy no safety that intersecting the write-allowlists did not already buy.
- Two layer workers each appended their own new token to `DESIGN.md`. → Fix: shared surfaces have exactly one writer — you. Workers propose token additions in their return; you apply them serially.
- The e2e smoke drove the API directly because the login flow was awkward to automate. → Fix: the smoke goes through the real outermost interface, as a logged-in user when the path is auth-gated; a smoke that skips the outer layer certifies a layer nobody ships.
</BAD_EXAMPLES>

<PARALLEL_EXECUTION>

**Turn economics.** Optimize serial orchestrator turns, not worker count: within a turn cost adds up but time is the slowest worker, so every extra turn is pure latency.

**Critical path first.** Name in one line the dependency chain that actually ends in the deliverable. Dependency is mechanical: B depends on A only if B reads a file A writes, needs a decision A makes, or needs a verdict on A's output. All three "no" → same dispatch.

**Start the long poles the moment their inputs freeze.** Builds, e2e runs, deploys, media/API generation dominate wall clock: launch each as its input tree freezes, then touch nothing it reads — editing mid-run makes the verdict apply to a tree that no longer exists. Never open a turn whose only content is waiting, and never speculate on writes, migrations, deploys, or paid generation; read-only prefetch is free — if it might be needed and cannot mutate, dispatch it now, not a turn later.

**Fan out by default.** Reads, searches, audits, and evidence gathering carry no write risk — batch them wide in the first dispatch rather than discovering the need one file at a time. Three cuts, in order of preference:
- **Axis cut** — same input, different lens (correctness / security / performance / a11y / data integrity / regression / design). Read-only, zero conflict, and it *raises* quality because each lens reads primary sources in its own clean context. Take it whenever more than one lens applies.
- **Partition cut** — disjoint files or modules, exactly one writer each. Neutral on quality with one exception you own: the seams between partitions, which no worker was looking at.
- **Redundancy cut** — the same question to independent workers, answers compared. Spend it where a wrong answer is expensive and hard to detect later: competing root-cause hypotheses, security reads, gate evidence. Tokens for confidence is a trade worth making.

**Serialize only these** (no exceptions): contract definition — schema, types, API and error
shape, design tokens, migration numbering, file formats — before two or more consumers exist;
any two writers to one path, append-only included; updates to shared surfaces (PROGRESS/handoff
logs, plan and state files, changelogs, lockfiles, barrel/index exports, route manifests, i18n
catalogs, shared data JSON); exclusive resources (build dir, dev DB, git index, ports, browser
session); chains where one output is the next input (plan→implement, implement→verify,
fix→re-review); order-bearing migrations and sequential ids; integration and every verdict —
pass/fail, gate transitions, duplicate and contradiction resolution, adoption, scope changes,
release approval; and anything irreversible or needing user confirmation.

**One writer per path.** Declare each worker's write-allowlist before dispatch and intersect the
lists; a non-empty intersection means re-cut or serialize, not dispatch. Shared surfaces are
yours alone: workers emit fragments into paths they own and propose edits elsewhere; you apply
them serially. After fan-in, map every path in `git diff --name-only` back to exactly one
allowlist — an unmapped file means that worker's output is quarantined pending review.

**Worker brief contract.** Workers see none of your context, cannot ask, cannot talk to each other. Every brief is self-contained, seven fields:
- goal, as an observable condition
- contracts cited by absolute path and symbol — cite, never paraphrase; paraphrase is drift
- write-allowlist and what is off-limits
- output and report format
- tool scope and forbidden commands
- prohibitions: no contract edits, no scope expansion, no shared-file writes, no guessing to fill blanks
- what to do when blocked

"As discussed above" or "the usual way" breaks a brief — the referent does not exist for the worker; show one worked example of the output contract before fanning out. Returns are schema'd, also seven: `status` (PASS/FAIL/BLOCKED/PARTIAL) · `scope` · `findings` (severity, file:line, failure scenario, evidence) · `commands` (cmd + exit code) · `writes` (paths touched) · `artifact` (path to long output) · `unknowns`. Detail goes to the worker's own file; the return carries the summary and that path — long reports blow the context you exist to protect.

**Model tiering follows output shape, not topic.** Mechanical, rigid-schema output → Haiku 4.5, never a verdict. Ordinary production work → Sonnet 5. Verdicts — gate pass/fail, root-cause adjudication, adversarial review, regression classification, architecture and contract decisions → Opus 5 in fresh context, since the context that produced the work cannot fairly judge it; per-role assignments sit in this card's worker table. Mis-tiering is asymmetric: too strong on a mechanical sweep only lengthens the critical path, too weak on a judgment fails silently and looks like a pass. Tools are least-privilege: reviewers read-only (one that can edit quietly fixes what it should report), verifiers execute-only (or verification is theater), implementers write only in owned paths. Deploys, destructive commands, secrets, and anything needing user confirmation are never delegated.

**Pipeline, don't barrier.** Stream each result into the next stage as it returns. A barrier across a whole stage is justified only to compare across items or dedup globally, to set global priority, immediately before an irreversible step, to terminate early on a zero-finding result, or at a write-partition boundary. Otherwise skew the stages: implement batch k, verify batch k-1 on its frozen diff, prefetch k+1 — one message, not three turns. Overlap verification with implementation only when all four hold: the target is a frozen snapshot (commit, diff, untouched file set); it is disjoint from what is being edited; a failure discards at most one batch; the verdict does not need the in-flight work. The final gate — full build, regression verdict, data-integrity verdict, deploy — is never overlapped, and overlap never relaxes the evidence standard.

**Width sizing.** Worker count comes from genuinely independent units; never split work in order to parallelize it. Keep a wave near 3–5 writers or ~8 read-only workers — past that the merge is the bottleneck and you start skimming reports. Split by expected cost, not count: wall clock is the longest worker, so one giant unit plus four small ones buys nothing; if a stage's slowest worker takes 3x the median, split that unit rather than adding workers. Delegation costs a brief, a re-read, and a reintegration — do small context-heavy edits inline; a two-file, two-tool-call change is faster by hand. Dispatching one worker and waiting is pure latency: delegate a single one only when a dedicated fresh context is the point. Never fan out before the problem is defined, or workers solve different problems.

**Quality is never traded for speed.** Fresh-context verification is never merged into the implementer's context and never collapsed with another axis to save a worker — merging axes cuts coverage, not time. A worker's "done, tests pass" is input, not proof: evidence is a command you ran, its exit code and output, and `git diff`. A PASS without a command is downgraded to UNKNOWN, and you personally re-verify each worker's highest-severity claim against the file or command. Aggregating PASS strings is not a gate; one adjudicator decides. Partial returns never upgrade: 3 of 5 axes returned is incomplete, not a 3-axis pass. Twelve workers is not rigor; rigor is verifier separated from implementer, commands that actually ran, and checks that could have failed.

**Integration ownership.** Worker passes are not an integration pass. After fan-in run one integration gate on the merged tree, never on the reports — contract conformance, a full build/test/lint you execute yourself, and the four defects parallelism creates:
- duplicate implementations of the same helper
- naming and pattern inconsistency
- non-uniform cross-cutting concerns (errors, logging, auth, i18n, a11y, caching)
- orphaned or dead output from discarded workers

Those four are obligations the moment you fan out; the seams between partitions are yours because no worker held both sides. When two workers solve the same problem differently, take one whole and discard the other — ranked by contract conformance, then codebase convention, then test support, then simplicity — and never blend them into a chimera; if you need something from the discarded one, re-implement it serially on top of the adopted one. Contradictory claims are settled by reproducing the check yourself, never by majority or average. Record what was discarded and why, or the rejected approach returns next cycle. Keep a per-wave record — brief, allowlist, outputs, verdict — and on long runs update the plan file after every wave (ownership map, wave status, open findings, next dispatch), so a compaction or a lost worker resumes from the file, not scrollback.

**Failure handling.** Default: quarantine the failed worker's output and re-dispatch that unit alone with a *tightened* brief — the usual cause is an underspecified brief, so a verbatim retry reproduces the failure. Discard the whole wave instead when:
- the failure touched a shared file or a contract — contamination scope unknown
- the cause was a contract misreading — the others likely misread it too
- partial adoption would leave the tree half-migrated

Adopt only parts that clear the integration gate; never carry an unfinished fragment forward, and never fill in a worker's missing fields yourself and present the result as theirs. Cap retries at 2–3, then do the unit inline or hand off — repeated failure at the same cut is a partitioning defect, not bad luck. Timeouts and non-responses count as failures. If results depend on completion order, the work was never parallelizable: serialize it.

**Concurrency map for this card.**

Run concurrently:
- the independent layer implementers named in the Build table — storage / service / client, substituted for whatever layers this artifact actually has — as one worker per layer in a single dispatch, never layer after layer, and only once constraint #1's contracts have landed;
- the read-only evidence sweeps the Post gates demand, batched into the first dispatch instead of discovered one file at a time: the Anti-Slop fingerprint grep, the raw-HEX / token-bypass grep, the orphan and dangling-reference queries for each new relation, and the boundary-case census (empty / single row / duplicate submit / max length / null / unicode / timezone-DST / numeric precision / concurrent write);
- the multi-viewport captures at 393 / 1024 / 1440 / 1920 — or the platform's representative sizes for a desktop, mobile, or extension surface — as one capture job per viewport;
- the `reviewer` lenses (correctness, security, data integrity) as separate fresh-context read-only workers reading the same frozen diff.

Serialize:
- constraint #1's dependency rule, which is the whole ordering spine — schema and API contracts settle before dependent code consumes them, so the migration file, the contract surface, and `DESIGN.md` tokens each have exactly one writer and are never fanned out;
- migration numbering and the UP → DOWN → UP round trip, which holds the scratch/branch database exclusively;
- the e2e smoke, which constraint #5 puts after integration;
- the `verifier`'s lint / typecheck / test run on the final tree after the last edit, not before it;
- the self-correction loop (reviewer FAIL → implementer fix → re-review), because each round needs the previous verdict;
- the design-reviewer P0 = 0 verdict and the data-integrity verdict of #11, which are adjudications rather than aggregations of worker PASS strings;
- the shared-surface writes you own alone — `DESIGN.md`, `feature_list.json`, PROGRESS.md's "Ultraplan 세션 로그" and "Anti-Slop 감사 로그", `.claude/memory/plan.md` — into which workers emit fragments you apply;
- the production release.

Long pole to start first: the migration UP → DOWN → UP round trip against the scratch/branch database, together with the production build and the e2e smoke. Freeze the tree before launching them and edit nothing they read while they run, or the round trip certifies a schema and the smoke certifies a build that no longer exist. The release in the Deploy constraint is the second long pole; like any destructive or data-loss migration it is irreversible, so it is never dispatched speculatively — it starts only after the Post gates return clean.

</PARALLEL_EXECUTION>

<ENVIRONMENT_SKILLS>
Skills are accelerators; the inline procedure is canonical. This card runs to completion with **zero** installed skills, at the same output format, the same gate thresholds, the same acceptance criteria. A skill changes only the route taken to reach them.

**S1 — The inline path is the contract.** [MUST] Every phase, gate, and AC here runs on the model, a shell, and the repository alone. Never make a skill a precondition ("run /design-consultation first"), never name one inside an acceptance criterion, never produce an artifact that cannot be reproduced without one. If you cannot state how a step would run with no skill installed, the step is mis-specified — repair the step, do not lean on the skill.

**S2 — Detect, then use. Never assume.** [MUST] Use only what *this session* actually exposes (it appears in the available-skill list, or the command resolves). Never infer availability from repo contents, OS, a CLAUDE.md mention, a lockfile, or a previous session. Never invent, alias, or approximate a name. Never install anything. Absent / erroring / timing out / unreadable output → one retry maximum, then fall through **silently**: no question to the user, no pause, no blocker, no downgraded deliverable. Log one line: `skill /x unavailable → inline path`.

**S3 — Match on capability, not on name.** [MUST] Each row is a capability this card requires; the command is one known implementation (local inventory, gstack v1.67.2). Any equivalent this environment exposes substitutes cleanly.

| Capability this card needs | Accelerator, if actually exposed | Canonical inline path |
|---|---|---|
| Vague intent → executable spec | `/spec` | Write the spec sections by hand; ask the open questions inline |
| Plan review before build | `/autoplan` (serial, auto-decides) · `/plan-ceo-review` `/plan-eng-review` `/plan-design-review` `/plan-devex-review` (parallelizable) | Fresh-context self-review of the plan against this card's decision criteria |
| Design system of record, materialized as `DESIGN.md` | `/design-consultation` | S9 derivation from the committed token layer, written to `DESIGN.md` |
| Visual QA — spacing, hierarchy, inconsistency, AI slop (edits files) | `/design-review`, `/design-shotgun` | Anti-Slop + spacing/hierarchy/token pass at every breakpoint; screenshots as evidence |
| Functional QA | `/qa-only` at gates; `/qa` only outside gates | Enumerate flows, exercise boundaries, log findings with reproductions, fix, re-verify |
| Pre-merge structural review of the diff | `/review`, `/codex`, `/health`, `/cso`, `/devex-review` | Fresh-context diff review against this card's review checklist |
| Headless browser — navigate, interact, assert state, annotated/responsive screenshots, before/after diff | `/browse` (~100 ms per command once warm), `/benchmark` | Playwright/Puppeteer MCP or the project's automation; manual capture as last resort |
| Deploy + post-deploy watch | `/land-and-deploy`, `/canary` | The project's documented deploy commands + a manual smoke pass |
| Session carry-over | `/context-save`, `/context-restore` | The project's handoff document |

**S4 — Evidence is the artifact, never the invocation.** [MUST] Evidence is the report file you opened, the diff it produced, the screenshot path now on disk, the exit status you observed; "I ran /qa", "design review passed", "verified with /browse" are self-narration, rejected wherever this card demands evidence. [MUST] Invoking a skill discharges **no** acceptance criterion — AC are satisfied only by the observable facts this card names: command output, P0 count 0 with each finding quoted at `file:line`, screenshots existing at a stated path. A missing or unreadable skill report makes the criterion **UNMET**, never "assumed pass"; redo it inline. Numbers copied out of a skill report are traceable to output you read, or deleted. A skill call upgrades neither your authority nor your evidence — anything this card gates behind user confirmation stays gated when a skill would perform it.

**S5 — Separate diagnosis from repair.** [MUST] Some skills edit code on their own (`/qa`, `/design-review`, `/design-html`, and `/investigate` may land fixes), silently converting a review gate into an edit and letting the fixer certify its own work. At any step this card defines as a *gate* (review, verification, acceptance, pre-merge, Anti-Slop), prefer the report-only variant: `/qa-only` over `/qa`, read-only inline inspection over `/design-review`. When only a fixing skill exists: run it on a clean tree so its edits are isolated in `git diff`, review those edits as you would any other change, then **re-run the gate against the post-fix tree** — a fixer never passes the gate on code it just rewrote. Name its edits in the change record (which skill, which files, what changed). Never let a fixer run where this card requires cause before repair.

**S6 — When a skill and the inline procedure disagree, the stricter verdict governs.** [MUST] Skill FAIL + inline PASS → FAIL; reproduce the finding inline at `file:line` and only a reproduction that demonstrably contradicts it clears the flag — if you cannot reproduce it either way, keep the failure and fix it. Skill PASS + inline FAIL → FAIL stands; this card's criteria are the contract. Both fail on different grounds → both findings are real. Record each divergence in one line (what disagreed, which verdict was followed, why) and surface the list at the end; repeated divergence is a defect signal about the card or the skill.

**S7 — Concurrency follows write access, not convenience.** [MUST] Read-only/report-only skills fan out freely: dispatch **whichever of** `/review`, `/health`, `/devex-review`, `/cso`, `/qa-only`, `/benchmark`, `/scrape`, read-only `/browse` **this session actually exposes** as one batch, then reconcile findings once. Tree-editing skills (`/design-review`, `/qa`, `/design-html`, `/design-consultation`, `/document-generate`, `/land-and-deploy`) serialize against each other **and** against your own edits — two writers on one tree give a diff you cannot audit. Where both variants exist, the read-only one joins the audit pass and every fix lands in one serialized pass after. [MUST] Warm `/browse` with an early first navigation — the one skill-side long pole (~100 ms per command after; `/benchmark` reuses the session). State in one line whether plan reviews ran serially under `/autoplan` or as one parallel batch you arbitrate.

**S8 — Respect the delegation break-even.** [MUST] A skill call costs a load, a process, and that skill's own multi-phase protocol. Do it yourself when the answer is one read, one grep, or one command whose output you can already predict. Delegate when the task is multi-step, needs a capability you would otherwise build (headless browser, renderer, diagram emitter), or produces an artifact this card requires anyway. Never chain a skill for a single-fact check; never call one to confirm what you just observed.

**S9 — Prerequisites: the requirement is on the artifact and its content, never on its producer.** [MUST] Resolve in order: (a) it exists → it is authoritative; (b) a skill produces it → run that skill once and proceed; (c) neither → construct the minimum version inline from what the repository already commits, write it to the same path, and say you created it. A missing producer is never a reason to skip a step.
- **`DESIGN.md` / token layer absent** → extract palette, type scale, spacing scale, radii, and the motion budget from the existing codebase; with no codebase, commit to one tone and define the minimum token set this work needs. Write it to `DESIGN.md` at repo root, marking every inferred value `가정:`. From that moment it is authoritative exactly as a generated one.
- **Screenshot / baseline directory absent** → create it at the project's convention (e.g. `.playwright-mcp/`) and capture with whatever automation exists; with none, capture manually and say so in the evidence line. **Spec or plan absent** → write the one-page spec before implementing.
- [MUST] Never stand up a second system beside one that already exists, never emit an empty or placeholder artifact to satisfy a file-existence check, and never let a downstream step consume an artifact you only assumed.

[MUST] Do not report skill usage as an accomplishment. Report facts: what was checked, what was found, where the evidence lives.

**Skill map for this card.**
| If exposed | Use it for | Inline fallback (canonical) |
|---|---|---|
| `/spec` | Turning a thin or ambiguous spec into the Plan phase's Change Map draft and open-questions list, before constraint #1's contracts settle | Write the Change Map by hand from the spec plus the codebase; record each inferred answer as `가정: ...` |
| `/autoplan` (serial, auto-decides) · `/plan-eng-review` `/plan-design-review` `/plan-ceo-review` `/plan-devex-review` (one parallel batch) | Reviewing the 6-section Plan Contract constraint #6's escalation produces — realtime / payments / multi-layer permissions / external integration / shared-contract change — before Build dispatches a worker | Fresh-context self-review of `.claude/memory/plan.md` against its own AC and Risks sections, plus constraints #1–#5 and #11 |
| `/design-consultation` | Materializing `DESIGN.md` when #4 and #10 demand tokens and a brand pack but no design record exists | S9 derivation: extract the token set from the project's committed theme layer, write it to `DESIGN.md`, mark inferred values `가정: ...` |
| `/browse` (warm it with the first navigation early) | The Post gate's captures at 393 / 1024 / 1440 / 1920 — or the platform's representative sizes — under `.playwright-mcp/`, and driving #5's e2e smoke through the real outermost interface, logged in when the path is auth-gated | Playwright/Puppeteer MCP or the project's own e2e runner; manual capture as last resort, with the path named in the evidence line |
| `/qa-only` at the Post gate; `/design-review` or `/design-shotgun` only outside it, on a clean tree, with the gate re-run afterward (S5) | Functional QA of the feature's core path, and the spacing / hierarchy / token / slop pass over the UI diff that feeds the independent P0 = 0 verdict | Enumerate the feature's flows, exercise #11's boundary census, grep the fingerprint list, classify against the passed brand-pack thresholds — self-checks never count as the independent verification |
| `/review`, `/codex` (challenge mode), `/cso`, `/health` | The `reviewer` row's fresh-context P0 / P1 / P2 pass over the frozen diff, read-only, in the same batch as the Concurrency map's correctness / security / data-integrity lenses | Fresh-context read-only diff review against the Post gate checklist, #3's entry-point validation, and #11's integrity clauses |
| `/land-and-deploy`, then `/canary` | The unconditional release constraint and its live health check, started only after the Post gates return clean | The project's own deploy command, the previous production version captured first as the rollback target, and an HTTP 200 / version echo / registry query you run yourself |

**Prerequisites this card assumes**, none of them produced here: `DESIGN.md` (tokens, #4/#10) · `design/brand-pack.md` + `design/brand-packs/<id>.md` (packs, #9) · `.playwright-mcp/` (captures). Resolve each through the S9 ladder (a) → (b) → (c); missing pack files mean the `modern-rich` defaults of #10, never fabricated pack contents. No absence downgrades a gate — the Anti-Slop P0 = 0 verdict, the richness gate, and the e2e smoke are owed in full either way.
</ENVIRONMENT_SKILLS>

<QUALITY_CRITERIA>
Further failures this card's gates exist to catch, beyond the five in BAD_EXAMPLES above. Each is a real scene, not a banned word.
<BAD_EXAMPLE>
The Anti-Slop gate was recorded as P0=0 after the lead grepped the five fingerprints itself, found nothing, and committed — no captures under `.playwright-mcp/`, no design-reviewer run. → Fix: the P0=0 verdict is independent by definition. Dispatch @design-reviewer (or a fresh-context Sonnet 5 running the same procedure) with the brand-pack id, save the 393/1024/1440/1920 captures, and re-run until P0=0. Your own grep is a pre-filter, never the gate.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
The implementer's return said the write is idempotent because it uses `ON CONFLICT DO UPDATE`, and the retry was never actually submitted. → Fix: #11(c) says exercised, not argued. Submit the same payload twice against the real store, run the row-count query, and paste both outputs — reading the SQL is not exercising it.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
The storage column is `VARCHAR(64) NOT NULL` while the validator accepted an optional unbounded string; every test fixture happened to be short and non-null, so the suite went green and the constraint only fired in production. → Fix: #11(a) compares three surfaces field by field — storage constraint, code assumption, validator. Narrow wherever the validator is wider, then add the max-length and null boundary tests before the gate moves.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
The "e2e smoke" asserted that the new route returns 200 — or that `--help` now lists the new flag — and stopped there. → Fix: existence is not the core path. Drive the feature's actual scenario through the real outermost interface end to end (submit the form as a logged-in user, run the command with real arguments, feed the fixture dataset through the pipeline) and assert the resulting state, not the response code.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
The deploy command printed a deployment URL, the run reported 배포 완료, and nobody opened the URL or recorded the previous deployment id. → Fix: capture the previous production version as the rollback target *before* releasing, then confirm live with a check you actually ran — HTTP 200 on the feature's own path, version echo, registry query — and paste it. A deploy command's success line certifies the upload, not the release.
</BAD_EXAMPLE>
</QUALITY_CRITERIA>

<SELF_VERIFICATION>
Verify against real evidence — files re-read, command output, query results, rendered captures — never against the draft's own claims; fix and re-check until clean. A blocking check that cannot pass → do not deliver; report the blocker in Korean.
1. Every migration has a DOWN that was actually exercised (UP → DOWN → UP round trip, output captured); e2e smoke ≥1 passing; new tokens reflected in DESIGN.md?
2. Data integrity (#11) proven by evidence: schema constraints ↔ code assumptions ↔ validator agree; orphan/referential query run and clean; retry/idempotency exercised; boundary cases (empty / single / duplicate / max length / null / unicode / timezone / precision / concurrent) covered or explicitly out of scope; every reported number traced to a command you ran or tagged `[unverified]`?
3. (UI diff) design-reviewer — not a self-check — verified P0=0; multi-viewport captures saved under `.playwright-mcp/`; "Anti-Slop 감사 로그" updated?
4. feature_list.json (status=done, ultraplanSessionId) + "Ultraplan 세션 로그" updated (or absence noted)?
5. Escalation verdict logged with rationale; release step completed and verified live, or marked N/A with a stated reason?
6. Dispatch discipline both ways: the independent units — layer implementers on disjoint files, the read-only grep and orphan-query sweeps, the per-viewport captures — went out in one message, not one turn each, with one writer per path and DESIGN.md / feature_list.json / PROGRESS.md written by you alone; and no fresh-context reviewer round, design-reviewer P0 verdict, or verifier run was skipped, shortened, or folded into the implementer's context to buy wall clock?
7. Environment skills used honestly: every skill you invoked is backed by its actual output — the report file, the diff, the capture path now on disk — and no acceptance criterion here (exercised DOWN round trip, e2e smoke, independent P0=0, data-integrity evidence, live release check) was skipped, softened, or marked assumed-pass because a skill was absent, erroring, or ran in place of the inline procedure?
8. Every unresolved item carries a marker and a place to land: `가정:` / `[unverified]` / `[SKIPPED]` with its reason, none of them silently dropped from the final report?
</SELF_VERIFICATION>

[MUST] Autonomous Tail-Run: run this card's full pipeline — plan → build → post → verification → release — to self-termination in the same session. Never stop for confirmation; on finishing a phase, proceed immediately; record assumptions as `가정: ...` instead of asking. A failing unit escalates L1 tighten → L2 change method → L3 shelve with `[SKIPPED]` and continue the remaining queue; it never becomes an idle stop. Confirmation exceptions: PRD-attachment gate (if the project uses one), secrets handling, paid-API cost confirmation, and destructive/irreversible ops or data-loss migrations (auto-capture a backup/rollback point first, then proceed — no confirmation). Production deploy and DB schema changes on shared/production databases run autonomously without confirmation. Precedence: mandated blocker reports are emitted; menus, confirmation questions, and idle stops are not.

<FINAL_REMINDER>
- Post is the canonical gate spec: data-integrity evidence + independent design-reviewer P0=0 (UI diff) + lint/typecheck before every commit; pass SELF_VERIFICATION before delivering.
- Autonomous Tail-Run: no stopping — failure escalates L1 tighten → L2 change method → L3 shelve and continue; only an external blocker halts the run, and the listed confirmation exceptions are the only exceptions.
- All user-facing output in Korean (한국어 작성); code, identifiers, commands, and program log messages stay as-is. Three uncertainty markers only: `가정:` / `[unverified]` / `[SKIPPED]`.
- Exercised DOWN migrations + input validation on every entry point + e2e smoke ≥1 + referential / idempotency / boundary checks proven by query or test output.
- Layer-conditioned rules apply only to the layers this artifact actually has; derive them from the spec and codebase, never from a default stack.
- Deep planning pass on realtime / payments / multi-layer permissions / external integration / shared-contract changes or large footprint.
- Dispatch independent work concurrently in a single message and never let a turn be spent only waiting — but one writer per path, contracts and verdicts serial, and independent fresh-context verification intact. Speed comes from overlapping work, never from checking less.
- Environment skills are accelerators, never assumptions — use only what this session actually exposes, fall through to the inline procedure silently when it does not, and never let a skill's run substitute for the evidence, the gates, or the acceptance criteria this card requires.
</FINAL_REMINDER>
