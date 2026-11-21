<!-- ══════════════════ TOP ANCHOR · ABSOLUTE CONSTRAINTS ══════════════════ -->
<CRITICAL_CONSTRAINTS>
[MUST] Redesign the surface while preserving everything that already works. Layout, information architecture, and user flows may all change — behavior, data flow, and state may not. After every change, confirm the affected flows still work exactly as they did before.
[MUST] Settle the design direction before you touch a pixel, and write it down. Decide it yourself: do not stop and wait for my approval. State the direction, the reasoning behind it, and the alternatives you rejected, then keep working. If I send corrections later, fold them in and continue.
[MUST] Unify every screen under one design token system (color, typography, spacing, radius, elevation, motion, breakpoints). No screen keeps private styling of its own.
[MUST] Derive the visual identity from what this product actually does. Determine the artifact type, the target platform, and the styling system by reading the codebase — never assume web, never assume a framework, never assume a stack the repo does not show you.
[MUST] Judge "done" only from rendered output you actually looked at. Editing code without observing the render is not done.
[MUST] Never assert a fact you have not verified — a contrast ratio, a token value, "the build passes", "the flow still works". Every claim in your report must trace to a command you ran, a file you re-read, or a render you looked at. Three markers, no others: `가정:` — an inference you made and proceeded on; `[unverified]` — a number or claim no command you ran supports; `[SKIPPED]` — a step not performed, with its reason.
[MUST] Autonomous Tail-Run: carry the whole pipeline — audit → direction → tokens → application → regression → integrity audit → independent verification → report — to completion in this one session, with no confirmation requests, no progress-approval gates, and no "shall I continue?" messages. The only stops are: handling secrets, spending money on a paid API, a required input that was never attached, and irreversibly destructive operations (for the last one, capture a backup or rollback point automatically and then proceed — that is not a confirmation request).
[MUST] Persist run state to `.claude/memory/design-overhaul.md` and keep it current at every phase boundary: the artifact-type verdict with its evidence, the declared direction, token-layer status, per-group status with its render-capture paths, the PHASE 0 baseline command output, open findings, and what remains. Near the context limit, write it, compact, and resume by reading that file first — state lives on disk, never in the conversation. A compaction is continuation, not a stop; the Tail-Run clause still holds across it.
[MUST] All user-facing output — 보고·로그·요약·블로커 설명 — is written in Korean. 모든 사용자 대면 출력은 한국어로 작성한다. Code, token names, and identifiers stay in their native language.

[MUST] Parallelize by default: independent units go out in ONE message as multiple `Agent` calls
(separate messages run sequentially no matter what the plan says). Before each fan-out, name the
critical path and declare each worker's write-allowlist; if two allowlists intersect, or a worker
needs a decision or verdict another worker has not yet produced, serialize instead of dispatching.

[MUST] Parallelism is a throughput choice, never a quality substitute. Verification depth, step
count, and fresh-context independence never shrink because work ran concurrently, and the number
of workers is never evidence of rigor. Contracts, integration, and every verdict stay serial.
</CRITICAL_CONSTRAINTS>

<ROLE>
You are (1) a senior product designer responsible for usability and information hierarchy, and (2) a frontend/design engineer who implements token-based design systems in code. You can read, edit, and render the real code in the connected project folder. This project was built with Claude Code and is already functional; what it needs now is a design overhaul across the whole surface.
</ROLE>

<!-- ══════ OPTIONAL INPUT · direction for this particular project ══════ -->
<USER_SUPPLIED_DIRECTION optional="true">
Fill this in and it takes priority over everything you would infer. Leave it empty and PHASE 1 derives the direction from the product itself.
- Mood / tone:        (e.g. minimal monochrome / warm trustworthy fintech / restrained editorial)
- References:         (e.g. Linear, Vercel, Stripe / a specific URL / a moodboard description)
- Hard avoids:        (e.g. heavy gradients, emoji decoration, a specific color)
- Constraints:        (e.g. keep existing brand color, dark mode required, font licensing limits)
</USER_SUPPLIED_DIRECTION>

<OPERATING_PRINCIPLES>
- This is harder than it looks. Think through structure, direction, and system before you move pixels. Follow the process and the guardrails strictly, but the concrete visual, aesthetic, and layout calls are yours. I want a coherent, deliberate result — not a defense of every pixel.
- Concentrate boldness in one place. Pick the single signature element that will make this product memorable, and keep everything around it quiet and restrained. Strip decoration that does not serve the brief.
- Do not spend your free axis on the AI default. Current AI-generated design converges on three shapes: (1) cream background (near `#F4F1EA`) + high-contrast serif + terracotta accent (near `#D97757` — this one is especially obvious), (2) black background + a single neon accent, (3) hairline rules, zero radius, newspaper columns. Unless the direction explicitly calls for one of these, spend your free axis on a choice specific to this project.
- Match complexity to the vision. A maximal direction demands precise execution; a minimal direction demands precision in spacing, type, and detail. Elegance is executing the vision you chose, well.
- Copy is a design material. Name things on screen after what the user manipulates and perceives, not after the system's internals. Keep voice active, sentences whole, vocabulary consistent. If the button says "게시", the toast says "게시됨". Errors do not apologize — they say what went wrong, why, and how to fix it. Empty states are invitations to act.
- Respect the constraints the artifact actually has. A fixed-size extension popup, a terminal at 80 columns, and a responsive marketing page have completely different rules. Read which one you are in before applying any rule from this card.
</OPERATING_PRINCIPLES>

<ARTIFACT_AND_PLATFORM_DERIVATION>
[MUST] Before any design work, determine what you are designing from repository evidence — entry points, manifests, build config, dependency graph, and the directories that actually contain UI. Do not guess from the project name or the README's aspirations. State the verdict with the evidence that produced it.

Use this as a judgment matrix, not a menu. Projects mix; classify per surface when they do.

| Repository signal | Artifact type | Where the token system lives | How you observe the render |
|---|---|---|---|
| Web framework + browser entry point | Web app / site | CSS custom properties, Tailwind theme config, CSS-in-JS theme, or a UI kit's theme file | Run the dev server; capture each screen at the breakpoints the project actually supports |
| Extension manifest (`manifest_version`) | Browser extension | Same as web, but each surface (popup, side panel, options, content script overlay) has its own fixed or host-constrained box | Load unpacked; open every surface at its real size |
| Desktop shell process (Electron/Tauri/similar) | Desktop app | Web tokens plus native chrome: title bar, menus, tray, window states | Run the app; capture each window, including minimum window size |
| Native mobile project (SwiftUI/UIKit, Compose/Views) | Mobile app | Platform theme objects, asset catalogs, dynamic type settings | Simulator/emulator captures: light + dark, smallest and largest supported device, largest accessible text size |
| CLI entry point, argv parsing, no rendering surface | CLI | ANSI palette, spacing and alignment conventions, symbol set, verbosity levels | Capture real terminal output — including narrow width, no-color (`NO_COLOR`), and piped/non-TTY |
| Terminal UI framework | TUI | CLI tokens plus focus, selection, and scroll states | Capture each screen and each focus state at 80 and 120 columns |
| Component library or design system with no app | The tokens *are* the product | Token source of truth plus its published artifacts | Build the docs/storybook surface and look at every story and every variant |
| Notebook/dashboard/reporting output | Data app | Chart theme, layout grid, number formatting | Render and capture; verify at the real data volumes, not toy data |
| Game or canvas-rendered UI | Game/HUD | HUD scale rules, safe areas, input-mode variants | In-engine or in-canvas captures at min and max supported resolution |
| Document/slide/print output | Static composition | Page grid, type scale, print color space | Render to the real output format and view it |

[MUST] Condition every check in this card on whether it applies to the artifact you found:
- WCAG contrast applies to any visual surface with text. For terminal output, apply the equivalent: legibility against both the light and dark terminal defaults, and never encode meaning in color alone.
- Keyboard reachability and visible focus apply wherever a focus model exists. For CLI, the equivalent is: every action reachable non-interactively, and every prompt answerable from a pipe.
- Responsive breakpoints apply when the viewport is variable. For fixed canvases (kiosk, fixed popup, print page, fixed game resolution), do not invent breakpoints — verify at the exact fixed sizes instead, plus the platform's text-scaling settings.
- Motion rules apply wherever animation exists; honor the platform's reduce-motion setting under whatever name it has there.
</ARTIFACT_AND_PLATFORM_DERIVATION>

<INSTRUCTIONS priority_system="[MUST] required / [SHOULD] recommended / [NICE] optional">

  <PHASE n="0" name="Audit · read-only">
  [MUST] Change nothing yet. Understand the project first:
    - Stack and structure: framework, styling approach, existing design assets (tokens, theme config, component library), fonts, colors, icon set. Record the artifact-type verdict from ARTIFACT_AND_PLATFORM_DERIVATION with its evidence.
    - Surface inventory: list every route/screen/view/command that exists, with a one-line statement of its purpose. Include the states that are also surfaces — empty, loading, error, permission-denied, offline.
    - Surface archetype per screen: information-dense tool · narrative/marketing · content/commerce · transactional form · other. Decide with reasoning. When one project mixes archetypes, classify per screen rather than forcing one label on everything.
  [MUST] Record a functional baseline: enumerate the core user flows and interactive behaviors (auth, search, form submission, filtering, CRUD, state transitions, background jobs, keyboard shortcuts). This list is the regression standard for PHASE 4. For each flow, record how you will observe it and what "unchanged" looks like concretely.
  [MUST] Record a machine-checkable baseline too, so regression is measurable rather than remembered: the exact build/typecheck/lint/test commands, their current pass/fail state and output, and — where they exist — the current route table, exported component API, and any snapshot or visual-regression fixtures. Run them once before changing anything and keep the output.
  [SHOULD] Name the strengths worth keeping in the current design (a hierarchy that works, real brand equity, a component that is already right). Do not demolish good work without a reason.
  [SHOULD] Note the existing failure modes you can already see: hardcoded values, duplicated styles, conflicting theme definitions, screens that drifted from the rest.
  </PHASE>

  <PHASE n="1" name="Design direction · decide and declare, do not wait">
  [MUST] If USER_SUPPLIED_DIRECTION is filled in, follow it as the highest authority. If it is empty, derive the direction from PHASE 0: the product's purpose, its users, and the core task they came to do.
  [MUST] Write the direction spec tightly:
    - One sentence of mood, plus the single signature element for this product.
    - Color strategy: 4–6 named values (background / surface / text / primary accent / secondary / semantic states). Dense tools get a restrained palette with unambiguous semantic colors; narrative surfaces get an impactful hierarchy. Define the dark-mode counterpart at the same time if the artifact has one — not later.
    - Type pairing: one display face, one text face, plus one utility face for data/captions if the artifact needs it. Avoid the pairing you would give any project; choose the scale, weights, and tracking deliberately.
    - Motion: duration range and easing, plus what motion is *for* in this product.
    - Anti-patterns: what this project will not do, including the three AI defaults above.
  [MUST] Declare the direction to me in Korean, with the reasoning and the rejected alternatives, and then continue immediately into PHASE 2. Do not pause for approval and do not end your turn here. If you want to show the direction concretely, build one or two screens as a demonstration inside the same continuous run — but keep going either way.
  [SHOULD] Read your own direction back and ask whether it reads as "the default anyone would hand a project like this". If it does, fix that part and say what you changed and why.
  </PHASE>

  <PHASE n="2" name="Design system · define the tokens">
  [MUST] Encode the direction as tokens in whatever the platform's real mechanism is: color (semantically named, never named after the color itself), type scale, spacing scale, radius, elevation/shadow, motion (duration + easing), breakpoints or fixed sizes. If a token system already exists, extend and repair it — do not create a second one beside it.
  [MUST] Define reusable primitives on top of the tokens: buttons, inputs, cards, badges, tables/lists, navigation, dialogs — whatever this artifact actually has. Every screen consumes these primitives. This is where consistency comes from; consistency achieved by copying values screen-by-screen is not consistency.
  [MUST] Make the token layer internally consistent and verifiable: every semantic token resolves to a defined primitive value, no token is defined twice with different values, no theme mode is missing a token the other mode defines, and no primitive hardcodes a value that a token already expresses.
  [MUST] The token layer is the contract for every surface that follows, so it is finished and frozen before any surface group starts consuming it, and it is written by a single writer — you. A group worker that needs a new token proposes it and you add it; two groups editing the token file concurrently is the one failure that invalidates every group at once.
  [SHOULD] Watch for style-cascade conflicts, in whatever form the platform has them: CSS specificity collisions, utility-class ordering, theme overrides shadowing each other, native style precedence. Type-level and element-level rules cancelling each other on padding/margin is a recurring failure. Prefer token- and utility-first definitions so the outcome is predictable.
  [SHOULD] If the platform supports it cheaply, expose the token set somewhere it can be inspected (a theme page, a story, a `--print-theme` flag). It makes the PHASE 4 audit far cheaper.
  </PHASE>

  <PHASE n="3" name="Application · bold redesign permitted">
  [MUST] Group the surfaces (auth / main workspace / settings / marketing sections / command families) and work group by group. After each group: look at the render, record what changed, then move to the next group. Never leave the whole product in an unverifiable half-redesigned state.
  [MUST] Groups may be implemented concurrently — that is a throughput choice and it changes nothing about the gate. It requires all of: disjoint write-allowlists per group, no group writing the token layer or any other shared surface, and each group returning its render captures and its own flow-exercise record. The render observation and the adoption decision remain serial and remain yours, one group at a time, so the product is never in a state you have not looked at.
  [MUST] Redesigning IA, layout, and user flow is allowed — on the condition that function is preserved. Behavior, data flow, and state stay; presentation and structure change. When you are unsure what a screen does, exercise it first and only then touch it.
  [MUST] Apply hierarchy according to the surface archetype:
    - Information-dense tool: prioritize density and scannability. Aligned numeric typography with consistent precision, table and chart hierarchy, deliberate loading/empty/error states, a density option where it earns its place, a strong grid, restrained color. Readability over flourish.
    - Narrative / marketing: narrative and visual hierarchy, hero impact, scroll rhythm, whitespace, type contrast, an unambiguous path to the conversion action. Open with the most distinctive thing about this product ("big number + small label + gradient" is the default answer — use it only when it is genuinely the best one).
    - Transactional form: error recovery, field grouping, progressive disclosure, an unmistakable primary action, and state that survives a mistake.
    - Terminal surfaces: alignment, column stability across widths, meaningful use of dim/bold instead of decoration, and output that stays readable when piped.
    - Other archetypes: build the hierarchy the product needs, using the above as reference.
  [MUST] Cover every state: hover, active, focus, disabled, loading, empty, error, and any long-running or partial state this product has. All of them derive from the tokens and primitives — none of them is styled ad hoc.
  [MUST] Update the copy alongside the visuals, per the copy principle above. A redesign that leaves system-voice strings in place is half-finished.
  [MUST] The seams between groups are yours, because no group worker held both sides: shared navigation, cross-group transitions, a component two groups both consume, and the visual continuity between a group's last screen and the next group's first. Audit them yourself after fan-in.
  [SHOULD] Delete as you go. Styles orphaned by the redesign, dead theme values, and superseded one-off components leave with the redesign, not "later".
  </PHASE>

  <PHASE n="4" name="Regression · consistency · integrity audit">
  [MUST] Re-walk the PHASE 0 functional baseline. Actually exercise each core flow and confirm identical behavior. Re-run the build/typecheck/lint/test commands and compare against the recorded baseline output — a new warning is a regression until you explain it.
  [MUST] Consistency audit: confirm every surface derives from the same tokens and primitives. Search the codebase for raw color literals, raw pixel values, and duplicated style blocks outside the token layer, and eliminate what you find. Report the search you ran and its result count, not your impression.
  [MUST] Token integrity audit, with evidence:
    - Every token referenced in the codebase resolves to a definition (no dangling references).
    - Every token defined is referenced somewhere (no dead tokens), or is deliberately reserved and labeled as such.
    - No duplicate definitions with conflicting values.
    - Theme parity: every token exists in every theme mode the artifact supports.
    - No primitive or screen re-declares a value the token layer already owns.
  [MUST] Accessibility floor, computed rather than eyeballed — apply the parts that exist for this artifact: text contrast meets WCAG AA (compute the ratios; list the worst pairs with their numbers), every interaction reachable and operable by keyboard, focus visible, reduce-motion honored, hit targets adequate for the input modality, and meaning never carried by color alone.
  [MUST] Size and density verification: for variable viewports, check the breakpoints the project supports and fix what breaks — **when the project declares no breakpoints, verify mobile / tablet / desktop (393 / 768 / 1440 CSS px) as the minimum set rather than skipping the check**; for fixed canvases, check the exact fixed sizes plus the platform's text-scaling settings. Check the real content extremes too — longest label, largest number, empty list, error message at maximum length.
  [MUST] Run this phase's audits as one integration gate on the merged tree, never on the group workers' reports. Duplicate primitives implementing the same thing under two names, naming drift between groups, and cross-cutting concerns handled differently per group are defects concurrency creates — they are part of this gate the moment you fanned out, not optional extras.
  [SHOULD] Write the change summary: what changed, why, and how it aligns with the declared direction, as before → after pairs.
  </PHASE>

  <PHASE n="5" name="Independent verification">
  [MUST] Your own review does not count as verification of your own work. Dispatch a fresh-context subagent that has not seen your report, give it only the acceptance criteria and access to the repository, and have it verify the criteria against the code and the rendered output independently. Default model Sonnet 5; use Opus 5 for the hardest judgment call — "does this read as one of the three AI defaults, or as a choice specific to this product?"; Haiku 4.5 is fine for mechanical counting passes (token references, raw-literal grep, state coverage).
  [MUST] Where the independent verdict disagrees with yours, the independent verdict wins until you produce evidence that overturns it. Fix, then re-verify.
  [MUST] Anything still unverified after this phase is reported as `[unverified]` with the reason, never silently omitted.
  </PHASE>

</INSTRUCTIONS>

<PARALLEL_EXECUTION>

**Critical path first.** Concurrency exists only when several `Agent` calls sit in **one message** —
separate messages run sequentially however the plan reads — so what you optimize is serial
orchestrator turns, not worker count. Name the dependency chain that ends in the deliverable in one
line. Judge dependency mechanically: B depends on A only if B reads a file A writes, needs a
decision A makes, or needs a verdict on A's output; all three "no" → same dispatch.

**Start the long poles the moment their inputs freeze.** Builds, sweeps, deploys, and media or API
generation dominate wall clock: launch them in the background once their input tree is frozen, then
work only on what they do not read — an edit mid-build voids the verdict. Never open a turn whose
only content is waiting. Never speculate on writes, migrations, deploys, or paid generation;
read-only prefetch is free — dispatch it now, not a turn later.

**Fan out by default.** Reads, searches, audits, and evidence gathering carry no write risk — batch them wide in the first dispatch rather than discovering the need one file at a time. Three cuts, in order of preference:
- **Axis cut** — same input, different lens (correctness / security / performance / a11y / data
  integrity / regression / design). Read-only, zero conflict, and it *raises* quality because each
  lens reads primary sources in its own clean context. Take it whenever more than one lens applies.
- **Partition cut** — disjoint files or modules, exactly one writer each. Neutral on quality with
  one exception you own: the seams between partitions, which no worker was looking at.
- **Redundancy cut** — the same question to independent workers, answers compared. Spend it where
  a wrong answer is expensive and hard to detect later: competing root-cause hypotheses, security
  reads, gate evidence. Tokens for confidence is a trade worth making.

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
lists; a non-empty intersection means re-cut or serialize, not dispatch. Shared surfaces are yours
alone: workers emit fragments into paths they own and propose edits elsewhere, and you apply them
serially. After fan-in, map every path in `git diff --name-only` back to exactly one allowlist — an
unmapped file quarantines that worker's output pending review.

**Worker brief contract.** Workers see none of your context and cannot ask, so every brief is
self-contained. Nothing below is optional.
- **Brief:** goal as an observable condition · contracts cited by absolute path and symbol (cite,
  never paraphrase — paraphrase is drift) · write-allowlist and what is off-limits · output and
  report format · tool scope and forbidden commands · prohibitions (no contract edits, no scope
  expansion, no shared-file writes, no guessing to fill blanks) · what to do when blocked.
- **Return:** `status` (PASS/FAIL/BLOCKED/PARTIAL) · `scope` · `findings` (severity, file:line,
  failure scenario, evidence) · `commands` (cmd + exit code) · `writes` (paths actually touched) ·
  `artifact` (path to long output) · `unknowns`.

A brief saying "as discussed above" or "the usual way" is broken — that referent does not exist for
the worker. Fix the output contract and show one worked example before fanning out. Detail goes to
the worker's own file; the return carries only the summary and that path.

**Model tiering follows the shape of the output, not the topic.** Mechanical, rigid-schema output →
Haiku 4.5, never a verdict; ordinary production work → Sonnet 5; every verdict → Opus 5 in fresh
context, because the context that produced the work cannot fairly judge it. Mis-tiering is
asymmetric: Opus on mechanical work only costs time, while Haiku on a judgment fails silently and
looks like a pass. Tools are least-privilege: reviewers read-only (one that can edit quietly fixes
what it should have reported), verifiers execute-only, implementers write only inside owned
paths. Deploys, destructive commands, secrets, and anything needing user confirmation
are never delegated.

**Pipeline, don't barrier.** Stream each worker's result into the next stage as it returns. A
full-stage barrier is justified only to compare across items or dedup globally, to set global
priority, immediately before an irreversible step, to terminate early on a zero-finding result, or
at a write-partition boundary. Otherwise skew the stages and keep the slow adjudicator off the hot
path: implement-k + verify-(k−1) against its frozen diff + prefetch-(k+1) in one message collapses
three turns into one. Overlap verification with implementation only when all four hold:
the target is a frozen snapshot (commit, diff, untouched file set); it is disjoint from what is
being edited; a failure discards at most one batch; the verdict does not require the in-flight work.
The final gate — full build, regression verdict, data-integrity verdict, deploy — is never
overlapped.

**Width sizing.** Worker count comes from the number of genuinely independent units; never split
work in order to parallelize it. Keep a wave near 3–5 writers or ~8 read-only workers — past that
your merge becomes the bottleneck. Split by expected cost, not count: wall clock is the longest
worker, so one giant unit plus four small ones buys nothing, and a slowest worker at 3x the median
means splitting that unit rather than adding workers. Delegation has a fixed price (the brief, the
worker re-reading what you read, reintegration), so do small context-heavy edits inline. Dispatching
a single worker and waiting is pure latency: delegate one only when a dedicated fresh context is the
point. Never fan out before the problem is defined, or workers solve different
problems.

**Quality is never traded for speed.** Never collapse two verification axes into one worker to save
a slot — merging axes cuts coverage, not time. A worker's "done, tests pass" is input, not proof:
evidence is a command you ran, its exit code and output, and `git diff`. A PASS without a command is
downgraded to UNKNOWN, and you personally re-verify the highest-severity claim from each worker
against the file or command itself. Aggregating PASS strings is not a gate; one adjudicator decides.
Partial returns never upgrade: 3 of 5 axes returned is incomplete, not a 3-axis pass. Rigor is
separation of verifier from implementer, commands that actually ran, and checks that could have
failed.

**Integration ownership.** Individual worker passes are not an integration pass. After fan-in run
one integration gate on the merged tree, never on the reports: contract conformance, a full
build/test/lint you execute yourself, and these four — defects parallelism creates and serial work
rarely produces, so they are obligations the moment you fan out, not extras:
- duplicate implementations of the same helper;
- naming and pattern inconsistency between workers;
- cross-cutting concerns (errors, logging, auth, i18n, a11y, caching) handled differently per worker;
- orphaned or dead output from discarded workers.

Seams between partitions are yours because no worker held both sides. When two workers solve the
same problem differently, take one whole and discard the other — ranked by contract conformance,
then codebase convention, then test support, then simplicity — and never blend them into a chimera;
if you need something from the discarded one, re-implement it serially on top of the adopted one.
Contradictory factual claims are settled by reproducing the check yourself, never by majority or
average. Record what was discarded and why, or the rejected approach returns next cycle. Keep a
per-wave record (brief, allowlist, outputs, verdict) and update the plan file after every wave —
ownership map, wave status, open findings, next dispatch — so a compaction or a lost worker resumes
from the file, not from scrollback.

**Failure handling.** Default: quarantine the failed worker's output and re-dispatch that unit alone
with a *tightened* brief — the usual cause is an underspecified brief, so a verbatim retry
reproduces the failure. Discard the whole wave instead when:
- the failure touched a shared file or a contract (contamination scope unknown);
- the cause was a contract misreading, which the other workers likely share;
- partial adoption would leave the tree half-migrated.
Adopt only parts that clear the integration gate; never carry an unfinished fragment forward. Never
fill in a worker's missing fields yourself and present the result as theirs. Cap retries at 2–3,
then do the unit inline or hand off — repeated failure at the same cut is a partitioning defect, not
bad luck. Timeouts and non-responses count as failures. If results depend on completion order, the
work was never parallelizable: serialize it.

**Concurrency map for this card.**

**Run concurrently:**
- **The whole of PHASE 0**, read-only by definition, all of it in one message:
  - the ARTIFACT_AND_PLATFORM_DERIVATION evidence sweep (entry points, manifests, build config, dependency graph, UI directories);
  - the surface inventory with its per-screen archetype call and its empty/loading/error/permission-denied/offline states;
  - the functional-baseline flow enumeration with the observation method for each flow;
  - the existing-failure-mode sweep (raw color literals, raw pixel values, duplicated style blocks, conflicting theme definitions, drifted screens).
- **PHASE 3 surface groups** (auth / main workspace / settings / marketing sections / command families) as concurrent writers when and only when their file allowlists are disjoint.
- **PHASE 4 audits**, separate lenses on one frozen tree, dispatched together:
  - token integrity (dangling references, conflicting duplicates, theme parity, dead tokens);
  - the raw-literal and duplicated-style search with its result counts;
  - computed WCAG AA contrast for the worst text/background pairs;
  - state coverage across hover/active/focus/disabled/loading/empty/error;
  - size verification at the project's declared breakpoints or 393 / 768 / 1440 as the minimum set;
  - the content extremes (longest label, largest number, empty list, maximum-length error);
  - the copy audit.

  Tier them by output shape — the greps, token-reference counts, and state-coverage tallies are Haiku 4.5; the contrast computation and the copy audit are Sonnet 5.

**Serialize:**
- **PHASE 1 → PHASE 2 → PHASE 3**, because the token layer is the contract every surface consumes, and re-cutting a palette, a type scale, or a spacing ramp after three groups have shipped invalidates all three.
- **PHASE 1's direction** — mood, signature element, 4–6 named color values, type pairing, motion, anti-patterns — a decision you make alone before anything reads it.
- **The shared surfaces you own**: token file, theme config, global stylesheet, barrel/index exports, route manifests, i18n catalogs. Group workers write only inside their own screens and propose edits to those files, which you apply one at a time.
- **PHASE 3's "look at the render after each group" gate**, which stays serial and stays yours: groups may be built concurrently, but a group is adopted only after you observed its render and exercised its flows, and a group that touched the token layer or broke a baseline flow is quarantined whole rather than half-merged, since a half-migrated surface is worse than an un-migrated one.
- **The PHASE 4 regression verdict**, the final build/typecheck/lint/test on the merged tree, and **PHASE 5's independent verification** (fresh context, sees neither this report nor your reasoning; Opus 5 for the "is this one of the three AI defaults?" call) — serial by definition, and PHASE 5's verdict outranks yours until you overturn it with evidence.

**Long pole to start first:** the PHASE 0 machine-checkable baseline — build, typecheck, lint, test — plus dev server / simulator / emulator startup and the first render captures. PHASE 0 changes nothing, so the tree is already frozen: launch these in the background in your very first action and run the read-only audit while they execute; never spend a turn watching a build. Keep that overlap through PHASE 3 — capture and audit group k-1 against its frozen diff while implementing group k — and stop overlapping at the final gate, where the full build and the regression verdict run alone on the merged tree.

</PARALLEL_EXECUTION>

<ENVIRONMENT_SKILLS>
Skills are accelerators. The inline procedure is canonical: this card runs to completion in an environment with **zero** installed skills, at the same output format, the same gate thresholds, the same acceptance criteria. A skill changes only the route taken to reach them.

**S1 — The inline path is the contract.** [MUST] Every phase, gate, and AC here is executable with nothing but the model, a shell, and the repository. Never make a skill a precondition ("run /design-consultation first"), never name one inside an acceptance criterion, never produce an artifact that cannot be reproduced without one. If you cannot state how a step would run with no skill installed, the step is mis-specified — repair the step, do not lean on the skill.

**S2 — Detect, then use. Never assume.** [MUST] Use only what *this session* actually exposes (it appears in the available-skill list, or the command resolves). Never infer availability from repo contents, OS, a CLAUDE.md mention, a lockfile, or a previous session. Never invent, alias, or approximate a name. Never install anything. Absent / erroring / timing out / unreadable output → one retry maximum, then fall through **silently**: no question to the user, no pause, no blocker, no downgraded deliverable. Log one line: `skill /x unavailable → inline path`.

**S3 — Match on capability, not on name.** [MUST] Each row is a capability this card requires; the command is one known implementation (local inventory, gstack v1.67.2). Any equivalent this environment exposes substitutes cleanly. Rows this card never touches may be deleted from the table.

| Capability this card needs | Accelerator, if actually exposed | Canonical inline path |
|---|---|---|
| Design system of record, materialized as `DESIGN.md` | `/design-consultation` | S9 derivation from the committed token layer, written to `DESIGN.md` |
| Visual QA — spacing, hierarchy, inconsistency, AI slop (edits files) | `/design-review`, `/design-shotgun` | Anti-Slop + spacing/hierarchy/token pass at every breakpoint; screenshots as evidence |
| Functional QA | `/qa-only` at gates; `/qa` only outside gates | Enumerate flows, exercise boundaries, log findings with reproductions, fix, re-verify |
| Pre-merge structural review of the diff | `/review`, `/codex`, `/health`, `/cso`, `/devex-review` | Fresh-context diff review against this card's review checklist |
| Headless browser — navigate, interact, assert state, annotated/responsive screenshots, before/after diff | `/browse` (~100 ms per command once warm), `/benchmark` | Playwright/Puppeteer MCP or the project's automation; manual capture as last resort |
| Docs, diagrams, PDF | `/document-generate`, `/diagram`, `/make-pdf` | Draft from the code and its public interface; hand-authored SVG/mermaid; print-stylesheet export |
| Deploy + post-deploy watch | `/land-and-deploy`, `/canary` | The project's documented deploy commands + a manual smoke pass |
| Session carry-over | `/context-save`, `/context-restore` | The project's handoff document |

**S4 — Evidence is the artifact, never the invocation.** [MUST] Evidence is the report file you opened, the diff it produced, the screenshot path now on disk, the exit status you observed; "I ran /qa", "design review passed", "verified with /browse" are self-narration and are rejected wherever this card demands evidence. [MUST] Invoking a skill discharges **no** acceptance criterion — AC are satisfied only by the observable facts this card names: command output, P0 count 0 with each finding quoted at `file:line`, screenshots existing at a stated path. A missing or unreadable skill report makes the criterion **UNMET**, never "assumed pass"; redo it inline. Numbers copied out of a skill report are traceable to output you read, or deleted. A skill call upgrades neither your authority nor your evidence — anything this card gates behind user confirmation (production deploy, schema change, destructive operation) stays gated when a skill would perform it.

**S5 — Separate diagnosis from repair.** [MUST] Some skills edit code on their own (`/qa`, `/design-review`, `/design-html`, and `/investigate` may land fixes), silently converting a review gate into an edit and letting the fixer certify its own work. At any step this card defines as a *gate* (review, verification, acceptance, pre-merge, Anti-Slop), prefer the report-only variant: `/qa-only` over `/qa`, read-only inline inspection over `/design-review`. When only a fixing skill exists: run it on a clean tree so its edits are isolated in `git diff`, review those edits as you would any other change, then **re-run the gate against the post-fix tree** — a fixer never passes the gate on code it just rewrote. Name its edits in the change record (which skill, which files, what changed). Never let a fixer run where this card requires cause before repair.

**S6 — When a skill and the inline procedure disagree, the stricter verdict governs.** [MUST] Skill FAIL + inline PASS → FAIL; reproduce the finding inline at `file:line` and only a reproduction that demonstrably contradicts it clears the flag — if you cannot reproduce it either way, keep the failure and fix it. Skill PASS + inline FAIL → FAIL stands; this card's criteria are the contract. Both fail on different grounds → both findings are real. Record each divergence in one line (what disagreed, which verdict was followed, why) and surface the list at the end; repeated divergence is a defect signal about the card or the skill.

**S7 — Concurrency follows write access, not convenience.** [MUST] Read-only and report-only skills touch nothing: dispatch every one this session actually exposes as a single batch, then reconcile the findings once. Skills that edit the working tree serialize against each other **and** against your own edits — two writers on one tree produce a diff you cannot audit. Where a skill has both variants, the read-only one goes in the parallel audit pass and every fix lands in a single serialized pass afterward. [MUST] `/browse`'s daemon warm-up is the one skill-specific long pole: fire its first navigation early so it warms while the rest proceeds (~100 ms per command afterwards, and `/benchmark` reuses it).

**S8 — Respect the delegation break-even.** [MUST] A skill call costs a load, a process, and that skill's own multi-phase protocol. Do it yourself when the answer is one read, one grep, or one command whose output shape you can already predict. Delegate when the task is multi-step, when it needs a capability you would otherwise have to build (headless browser, renderer, diagram emitter), or when its output is an artifact this card requires anyway. Never chain a skill for a single-fact check; never call one to confirm what you just observed.

**S9 — Prerequisites: the requirement is on the artifact and its content, never on its producer.** [MUST] Resolve in order: (a) it exists → it is authoritative; (b) a skill produces it → run that skill once and proceed; (c) neither → construct the minimum version inline from what the repository already commits, write it to the same path, and say you created it. A missing producer is never a reason to skip a step.
- **`DESIGN.md` / token layer absent** → extract palette, type scale, spacing scale, radii, and the motion budget from the existing codebase; with no codebase, commit to one tone and define the minimum token set this work needs. Write it to `DESIGN.md` at repo root, marking every inferred value `가정:`. From that moment it is authoritative exactly as a generated one would be.
- **Screenshot / baseline directory absent** → create it at the project's existing convention (e.g. `.playwright-mcp/`) and capture with whatever automation exists; with none, capture manually and say so in the evidence line. **Spec or plan absent** → write the one-page spec before implementing.
- [MUST] Never stand up a second system beside one that already exists, never emit an empty or placeholder artifact to satisfy a file-existence check, and never let a downstream step consume an artifact you only assumed.

[MUST] Do not report skill usage as an accomplishment. Report facts: what was checked, what was found, where the evidence lives.

**Skill map for this card.**
| If exposed | Use it for | Inline fallback (canonical) |
|---|---|---|
| `/design-consultation` | PHASE 1's direction and PHASE 2's token layer, materialized as `DESIGN.md`. The Korean direction declaration, the rejected alternatives, and the refusal to pause stay yours — if it ends in a question, you answer it and the run continues; CRITICAL_CONSTRAINTS forbids an approval gate no matter which route produced the direction | PHASE 1 written by hand from the PHASE 0 audit, then encoded as tokens in the platform's real mechanism per PHASE 2 |
| `/browse` | Every "look at the render" obligation: PHASE 0 baseline captures, the PHASE 3 per-group render gate, PHASE 4 size verification at the project's declared breakpoints or 393 / 768 / 1440, state coverage (hover/active/focus/disabled/loading/empty/error), content extremes, and before/after pairs for the change summary. Fire its first navigation in the same first action as the baseline build so the daemon warms during the read-only audit | Playwright/Puppeteer MCP or the project's own automation; simulator, emulator, or terminal capture for non-web artifacts per ARTIFACT_AND_PLATFORM_DERIVATION |
| `/design-review` | A surface polish pass inside PHASE 3, one group at a time. It edits files, so it is never the PHASE 4 integration gate and never PHASE 5: run it on a clean tree, review its diff as you would any group's, name its edits in the change summary, then run the gate on the post-fix merged tree | The PHASE 3 archetype hierarchy pass and the PHASE 4 consistency audit, both judged off the render |
| `/qa-only` | PHASE 4's re-walk of the PHASE 0 functional baseline — report-only, so the flows are judged by something that cannot quietly repair them. `/qa` is barred from this gate | Exercise each baseline flow yourself and record what you did, what you observed, and the verdict |
| `/review`, `/health`, `/cso`, `/devex-review`, `/codex` | The PHASE 4 integration gate's read-only lenses on the merged diff — duplicate primitives, naming drift, per-group inconsistency in cross-cutting concerns. Dispatch them as one batch and reconcile once | A fresh-context diff review against ACCEPTANCE_CRITERIA 1–3 and 11, run by you on the merged tree |
| `/investigate` | A baseline flow that broke after a restyle. RESILIENCE bars the third identical retry, not the first diagnosis — cause before repair, and revert that change if the repair is not quick | Reproduce → isolate → state the cause → fix, or revert and report the reverted item |

**Prerequisites this card assumes.** PHASE 2's single token system is `DESIGN.md` at repo root, expressed in whatever the platform's real mechanism is; render captures land in the project's existing convention (e.g. `.playwright-mcp/`). Both resolve by S9's a → b → c ladder, with two card-specific overrides: an existing token layer or `DESIGN.md` is extended and repaired, never duplicated beside a second system; and the S9(c) derivation covers spacing ramp and elevation as well, reading whatever the repository already commits — CSS custom properties, Tailwind theme config, a CSS-in-JS theme, a UI-kit theme file, or the platform theme object named in the ARTIFACT_AND_PLATFORM_DERIVATION row you matched. A missing capture directory is created, never a reason to skip the capture.
</ENVIRONMENT_SKILLS>

<RESILIENCE>
Escalation ladder, exhausted in order, no step skipped. Under the Tail-Run clause these route the work; none of them ends the run.
- **L1** — the same failure twice → re-cut the unit smaller or reassign it (direct edit → new file, one worker → another). The identical method is never retried a third time.
- **L2** — still failing → change the method: a genuinely different implementation of the same goal, not a reworded attempt.
- **L3** — still stuck → shelve that item with its evidence, record it in the state file, and push every other group and phase to completion; shelved items are retried at the PHASE 4 audit.
- Only an external dependency — a credential, an approval, an unreachable host — stops the run, and then only after all non-blocked work is finished.

Progress is measured, not felt: two consecutive attempts that leave the failing check's measured output unchanged is a stall, and a stall goes to L2 rather than to a third identical try.

Alongside the ladder:
- When uncertain, do not push a guess through as fact. Mark it `가정:` or `[unverified]`, keep working on what you can verify, and surface the open question in your Korean report. Screens whose behavior you cannot determine are exercised first, not redesigned blind.
- If a change breaks a flow and you cannot repair it quickly, revert that change, keep the rest, and report the reverted item rather than shipping a broken surface.
- When a concurrent group fails, quarantine that group's output and re-dispatch it alone with a tightened brief rather than repeating the same one. If the failure touched the token layer or a shared surface, discard the whole wave — the contamination scope is unknown, and a partially adopted wave leaves the product half-migrated.
</RESILIENCE>

<MID_CHECK>
Re-read CRITICAL_CONSTRAINTS at the top now and answer honestly: Is function still preserved, and have you exercised the affected flows? Is the direction written down and are you actually following it? Do all surfaces share one token system? Are you looking at real renders rather than trusting the code? Are the claims you are about to make backed by observed evidence? Are you still running autonomously, without having quietly inserted an approval gate? And on concurrency: is anything independent being trickled out one turn at a time, and has any verification step been thinned because work ran in parallel?
</MID_CHECK>

<OUTPUT_SPEC>
- Deliverable 1: the actual code and style changes applied in the connected project — tokens, primitives, surfaces.
- Deliverable 2: the design direction and token definition summary (mood, signature element, palette, type, scales, motion), as a document in the project or in the conversation.
- Deliverable 3: the change summary (key before → after pairs with reasoning) plus regression results, the consistency and token-integrity audit results, the computed accessibility numbers, and the independent-verification verdict.
- Deliverable 4: the run-state file `.claude/memory/design-overhaul.md`, current at the last phase boundary, and the render captures themselves on disk under the project's capture convention (e.g. `.playwright-mcp/`), named for surface × state × theme × size.
- Everything is delivered render-verified. 사용자 대면 보고는 한국어로 작성한다.
</OUTPUT_SPEC>

<ACCEPTANCE_CRITERIA>
Verifiable criteria for calling this done. Check each one against evidence and report pass/fail per item.
1. Every core user flow recorded in PHASE 0 behaves identically after the change, confirmed by actually exercising it. Build/typecheck/lint/test match or improve on the recorded baseline.
2. Every surface derives from a single token system and shared primitives; the search for raw literals and duplicated style blocks outside the token layer returns zero (report the search and the count).
3. Token integrity holds: no dangling references, no conflicting duplicate definitions, theme parity complete, no screen re-declaring a token's value.
4. An explicit design direction exists in writing, and the result reads as specific to this product rather than as any of the three AI defaults — judged independently, not self-assessed.
5. The accessibility floor is met with computed numbers: AA contrast (worst pairs listed with ratios), keyboard reach, visible focus, reduce-motion honored — for whichever of these the artifact actually has.
6. Size verification is complete for this artifact's real constraint model (breakpoints for variable viewports, exact sizes plus text scaling for fixed canvases), including content extremes.
7. All states are covered and token-derived: hover, active, focus, disabled, loading, empty, error, and any product-specific state.
8. Copy on screen follows the copy principle: user-facing vocabulary, active voice, consistent naming, errors that explain and instruct, empty states that invite.
9. The independent verification pass ran with fresh context, and every disagreement it raised was either fixed or explained with evidence.
10. Every quantitative claim in the report traces to a command output, a re-read file, or a render you observed; anything else carries `[unverified]`.
11. Every path in the final diff maps to exactly one declared write-allowlist, no two workers wrote the same file, and the integration gate ran on the merged tree — with duplicate primitives, naming drift, and per-group cross-cutting inconsistency explicitly checked.
</ACCEPTANCE_CRITERIA>

<QUALITY_CRITERIA>
  <GOOD_EXAMPLE>A hierarchy that fits the product's archetype, built on one consistent token system; one signature element that makes the product memorable; every pre-existing function still working and demonstrated to work; states, accessibility, and size constraints all handled; and a report whose every number came from a command or a render.</GOOD_EXAMPLE>
  <BAD_EXAMPLE>Styles bolted on screen by screen with no shared system / function broken during a restyle and not noticed / convergence on cream + serif + terracotta or another AI default / random visual churn with no stated direction / a report claiming "AA contrast met" and "all flows verified" without a single computed ratio or exercised flow behind it. → Instead: settle the direction first, derive every surface from the tokens, verify function after each change, and let evidence — not assertion — decide what passes.</BAD_EXAMPLE>
  <BAD_EXAMPLE>Four surface groups dispatched at once while two of them also edited the token file, so the palette landed in three variants and the integration gate ran on the four workers' PASS summaries instead of the merged tree. → Instead: freeze the token layer first with one writer, give each group a disjoint allowlist, and run the build, the flow exercise, and the audits yourself on the merged result.</BAD_EXAMPLE>
  <BAD_EXAMPLE>The report said "대비 충분" and listed no numbers; the pair that actually failed — muted foreground on surface — was never computed. → Instead: list the worst text/background pairs with their computed ratios; a contrast verdict with no number is `[unverified]`, not a pass.</BAD_EXAMPLE>
  <BAD_EXAMPLE>PHASE 5 was run by the same context that wrote the report, so it agreed with itself and the run was called verified. → Instead: fresh context, seeing neither the report nor the reasoning, given only the acceptance criteria and the repository — and its verdict outranks yours until evidence overturns it.</BAD_EXAMPLE>
  <BAD_EXAMPLE>Dark mode was defined after all groups had shipped, and three tokens ended up existing only in light. → Instead: define the dark counterpart in PHASE 1 alongside the palette; theme parity is a PHASE 4 check and a token present in one mode only is a defect, not a follow-up.</BAD_EXAMPLE>
  <BAD_EXAMPLE>A group's flows were "confirmed unchanged" from reading the diff, and the broken filter surfaced only after the redesign shipped. → Instead: exercise each baseline flow on the running surface and record what you did, what you observed, and the verdict — reading code is not exercising a flow.</BAD_EXAMPLE>
</QUALITY_CRITERIA>

<SELF_VERIFICATION>
Before you deliver, run this. Your own draft's claims are not admissible evidence for its own correctness — every line below needs an artifact you produced by running, re-reading, or looking.

1. **Function** — For each baseline flow: what you did, what you observed, verdict. Attach the build/typecheck/lint/test output and diff it against the PHASE 0 baseline.
2. **Consistency** — Report the exact searches you ran for raw literals and duplicated styles outside the token layer, with result counts. Zero, or an explicit exception list with reasons.
3. **Token integrity** — Report the dangling-reference check, the duplicate-definition check, the theme-parity check, and the dead-token list, each with the method that produced it.
4. **Accessibility** — Report computed contrast ratios for the worst text/background pairs (numbers, not "looks fine"), plus keyboard reach, focus visibility, and reduce-motion, for whichever apply to this artifact.
5. **Render coverage** — List surface × state × theme × size with the capture path for each, and mark what you actually looked at. Anything unobserved is `[unverified]`, not assumed passing; where no render tooling exists in the session at all, the visual verdict is `[unverified]` with `[SKIPPED]` evidence and a statement of what would have been captured — never asserted.
6. **Data integrity of the report itself** — Recount every number you are about to publish against its source. No number appears in the report that you cannot point at a source for.
7. **Independent verification** — Confirm the fresh-context subagent ran, list what it flagged, and show the resolution of each item.
8. **Constraint sweep** — Walk CRITICAL_CONSTRAINTS item by item and mark met/unmet. Fix every unmet item before delivering; if one cannot be fixed, say so with the reason rather than shipping silently.
9. **병렬 실행 감사** — List every fan-out you ran with its write-allowlist, and map each path in `git diff --name-only` back to exactly one of them. Then confirm both directions: that nothing independent was flowed one turn at a time — the PHASE 0 read-only audit, the disjoint PHASE 3 groups, and the PHASE 4 audit lenses each left in a single message, and the baseline build started before the audit rather than after it; and that nothing was thinned for speed — PHASE 5's fresh-context pass still ran on its own, contrast ratios were computed rather than estimated, every group's render was observed before adoption, and the integration gate ran on the merged tree rather than on worker reports.
10. **환경 스킬 감사** — list every environment skill you actually invoked, what it produced, and where that artifact now sits. Then confirm three things at once. Every number and verdict above traces to a command you ran, a file you re-read, or a render you looked at — never to the fact that a skill ran. No acceptance criterion was skipped, softened, or marked assumed-pass because a skill was absent, erroring, or returned a report you could not read; anything in that state was redone inline. And no file-editing skill certified the tree it had just edited — the PHASE 4 integration gate and PHASE 5 both ran on the post-fix merged tree. Record each skill-vs-inline divergence in one line with the verdict you followed.
</SELF_VERIFICATION>

<!-- ══════════════════ BOTTOM ANCHOR · CORE RESTATEMENT ══════════════════ -->
<FINAL_REMINDER>
Confirm again:
1. You redesigned while preserving behavior, data flow, and state, and you exercised each core flow afterward.
2. You settled and wrote down the direction before moving pixels — deciding it yourself, declaring the reasoning, and continuing without an approval gate.
3. One token system and shared primitives unify every surface; token integrity was checked, not assumed.
4. The artifact type and platform came from repository evidence, and the hierarchy fits the archetype you found — not from an assumed stack.
5. The visual identity is specific to this product, not one of the three AI defaults, and an independent pass agreed.
6. You looked at real renders, computed the accessibility numbers, and verified the artifact's real size constraints and content extremes.
7. Every claim traces to observed evidence; everything else is tagged `[unverified]`.
8. 사용자 대면 보고는 한국어로 작성한다.
9. Dispatch independent work concurrently in a single message and never let a turn be spent only waiting — but one writer per path, contracts and verdicts serial, and independent fresh-context verification intact. Speed comes from overlapping work, never from checking less.
10. Environment skills are accelerators, never assumptions — use only what this session actually exposes, fall through to the inline procedure silently when it does not, and never let a skill's run substitute for the evidence, the gates, or the acceptance criteria this card requires.
Process and guardrails strictly; aesthetic calls are yours. The result must be coherent and deliberate.
</FINAL_REMINDER>
