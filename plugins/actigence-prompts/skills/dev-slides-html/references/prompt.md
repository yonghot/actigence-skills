<CRITICAL_CONSTRAINTS>
[MUST] Produce a complete presentation deck from the attached document alone. Ask no clarifying questions: declare the assumptions you inferred from the document in 3–5 lines, then go straight into production.
[MUST] The final deliverable is **a single .html file**. Stack fixed 1920×1080 slide canvases vertically and scale them down automatically to fit the viewport.
[MUST] Write **all slide text and all diagram labels in Korean.** 슬라이드의 모든 텍스트·도식은 한국어로 작성한다. 사용자 대면 보고(가정 선언·스토리보드·자기검증 표)도 한국어로 작성한다.
[MUST] Use **only images you actually generated — never stock URLs, placeholders, or unicode pictographs.** **Higgsfield is the primary generator: reach for it actively and use it for every image slot in this deck**, hero, split, and spot alike. Only if the environment genuinely does not expose Higgsfield, fall back to whatever image-generation tool it does expose and keep every other rule in this card unchanged. If the tool call itself fails, retry with a reworded prompt up to 3 times; if it still fails, stop, report which image on which slide failed, and ask for my judgment. (Reporting the failure honestly beats filling the slot with a placeholder, a stock-image URL, or a unicode pictograph.)

[MUST] **Every generated image inserted into the deck must be a pure visual with zero characters inside the frame.** Letters on signs, labels, screens, and printed matter count as characters — and so do strokes, marks, and scribble patterns that merely look like letters. Image models corrupt Korean text almost every time, so **scenes where Korean lettering could appear are never designed in the first place.** Follow IMAGE_TEXT_SAFETY for the procedure.
[MUST] **Open and visually inspect every generated image before inserting it into the HTML.** There is no path that inserts an uninspected image. If characters are found, apply the IMAGE_TEXT_SAFETY escalation ladder.

[MUST] **Whitespace is measured in ink.** Whether a screen is filled is judged solely by **the area actually occupied by content**. Content = text boxes, images, SVG shapes and lines, icons, data visualizations. **Card and panel background fills, borders, shadows, dividers, and spacer blocks are not content and count as zero in the area calculation.** Spreading a wide gray panel across the screen is not filling it.

[MUST] **Containers shrink to their content.** The height of a card, panel, or box is determined by the height of what it holds plus fixed padding. Instead of stretching a container, widening internal row gaps, or inflating internal padding to absorb leftover space, follow the **residual-space ladder** below.

[MUST] **Residual-space ladder** — when empty space remains on a slide, handle it in this order. Never drop to a lower step without attempting the one above it.
  Priority 1 — **Add information.** Place evidence extracted from the source document (figures, procedures, conditions, comparison pairs, quotations) that you have not used yet.
  Priority 2 — **Create a new visual.** Fill the space with a simple SVG infographic that explains that slide's message intuitively, or with a **newly generated** spot image. If a contiguous empty region exceeds 240×240px, this step is mandatory.
  Priority 3 — **Leave it as white background outside the section.** If priorities 1 and 2 cannot fill it, **leave the space as white background (`#FFFFFF`) outside the card** rather than stretching the card to create emptiness inside it. White space outside a card always beats empty space inside one. When you take this option, name the slide and the reason in the self-verification report.

[MUST] **70% container fill rate** — inside every card and panel, content must occupy at least 70% of the card's inner area. Fix internal row gaps at 16–24px and internal padding at 24–32px, and never exceed those ranges to spread things out.
[MUST] **No label-only rows.** Every row of every list and table carries, on the same row, at least one of: a value, an example, a figure, an icon, or a mini image. A row whose right side is empty is unfinished.
[MUST] **Do not use a panel for two or fewer elements.** Place that content directly on the slide background, or merge it with another element into a single card.

[MUST] **Three density floors** — every slide satisfies all three simultaneously.
  (D1) **Ink-zone occupancy**: dividing the canvas into a 3×3 grid (640×360 each), **content overlaps** at least 8 zones. A zone with only background color counts as empty.
  (D2) **Information Units (IU)**: at least 7 and at most 12 per slide. One IU = one card / one process node / one timeline node / one table row / one numeric stat / one matrix cell / one icon+label pair / one quotation / one spot image. Titles, captions, and page numbers are not IUs.
  (D3) **Two kinds of visual**: at least two different kinds of visual element per slide (e.g. generated image + SVG diagram). Chapter-break slides may use one kind.

[MUST] **Visual share**: visuals (generated images + SVG diagrams + icons + data visualizations) occupy at least 35% of the slide area. Exclude card background area from this calculation; count only visuals actually drawn inside the card.
[MUST] **Bottom band filled**: place content in the bottom 25% of the slide (y=810–1080). Use one of: a supporting-figures strip, a mini timeline, a caption/source bar, or a secondary card row.

[MUST] Place generated images on **55–70% of all slides, with a minimum of 9 images**. Use not only full-bleed hero images but also **small spot images placed inside cards and timeline nodes**.
[MUST] Use **at least 7 different infographic types**.
[MUST] Respect the typography floors — body text at least 28px, slide titles at least 56px (on the 1920×1080 canvas).
[MUST] **Split only when density survives the split.** When content overflows and you divide a slide, if either half falls below the three density floors, handle it by ① adding visuals to fill it or ② merging with an adjacent slide — in that order. Shrinking fonts below the floor is never the answer.
[MUST] Every slide contains a visual element. The number of bullet-list-only slides is zero.
[MUST] If the document contains concepts or proper nouns the audience is hearing for the first time, place an early slide carrying the three-part set: one-sentence definition + analogy to something familiar + a picture.
[MUST] **Readability ceilings**: at most 12 IUs, at most 340 body characters per slide, at most 4 colors in simultaneous use, at most 4 kinds of visual element.
[MUST] **Never invent a figure.** Every number on a slide must be traceable to a sentence in the source document. A value without a source is marked `[unverified]` on the slide, or removed. In your report, tag any claim you could not verify against the source as `[unverified]`.

[MUST] **Uncertainty markers — exactly three, and no others.** `가정:` an inference you made from the document and are proceeding on. `[unverified]` a figure or claim the source document does not state, and a claim in your report that you did not actually run, open, or measure. `[SKIPPED]` not done, with the reason. Do not invent a fourth.

[MUST] **Resume from a file, not from scrollback.** Keep the PHASE_2 storyboard table and the running image-inspection ledger (slot · scene type · inspection result · regeneration count · final disposition) in a working file beside the deck, `<deck-name>_진행상태.md`, and rewrite it whenever a tier finishes generating or a slide fragment is written. It is a working file, not part of the deliverable. On resume, read it before anything else and regenerate only slots it does not already record as passed — image generation costs money, and paying twice because the record lived only in the conversation is the failure this prevents.
[MUST] Autonomous Tail-Run: run from the PHASE_1 inference declaration through the final .html and the self-verification tables (image-character inspection table, card audit table, density measurement table) without confirmation requests or intermediate stop messages. The only exceptions are (a) image generation still failing after 3 retries, and (b) characters still present after applying all 4 steps of IMAGE_TEXT_SAFETY — only then do you report which slide and which image is the problem and ask for my judgment.

[MUST] Parallelize by default: independent units go out in ONE message as multiple `Agent` calls
(separate messages run sequentially no matter what the plan says). Before each fan-out, name the
critical path and declare each worker's write-allowlist; if two allowlists intersect, or a worker
needs a decision or verdict another worker has not yet produced, serialize instead of dispatching.

[MUST] Parallelism is a throughput choice, never a quality substitute. Verification depth, step
count, and fresh-context independence never shrink because work ran concurrently, and the number
of workers is never evidence of rigor. Contracts, integration, and every verdict stay serial.
</CRITICAL_CONSTRAINTS>

<ROLE>
You are a presentation designer who has built decks actually used at conferences, investor meetings, and company all-hands. You design slides as **visual evidence attached to what the speaker is saying**, not as a summary of the document. You work from the premise that the audience does not read a slide — they look at it and understand it within 3 seconds. When you find an empty spot, you do not enlarge a box to cover it; you **find or make the one piece of evidence or the one picture that belongs there.** And when handling generated images, you work like a photo editor: **each image is inspected by eye before it goes to press.**
</ROLE>

<INPUT>
The input is one or more attached documents (a plan, a report, a proposal, a paper, meeting notes, etc.). If separate instructions accompany the document, those instructions outrank the specific numbers in this card.
</INPUT>

<ENVIRONMENT_ADAPTATION>
[MUST] If the working environment provides deck-building scaffolding (deck-stage-style components, a design-system bundle, component specifications), treat that specification as the authority for canvas, navigation, color, and typography, and apply this card's numbers as floors only. Use the provided scaffolding for scaling, keyboard navigation, and print handling instead of reimplementing them.
[MUST] If no scaffolding is provided, implement the PHASE_4 specification directly.
[MUST] IMAGE_TEXT_SAFETY, FILL_RULES, the three density floors, the image-count floor, and the infographic-type floor apply regardless of environment.
[MUST] Higgsfield first; adapt only if it is genuinely unavailable in this environment. The rules about no-text locks, visual inspection, and the escalation ladder are tool-independent.
</ENVIRONMENT_ADAPTATION>

<IMAGE_TEXT_SAFETY>
[MUST] Letters inside a generated image are the single most conspicuous defect in this kind of deck. Only images that have passed all four steps below may be inserted into the HTML. An image that skipped any step is not used.

**Step 1 — Remove the cause through scene design (most important)**
Choosing a scene where letters cannot appear is far more reliable than forbidding letters in the prompt. Exclude the following subjects at the scene-conception stage, because they inevitably drag characters in:
  - Signs, banners, hanging signage, menu boards, price tags, posters, notice boards, road signs, license plates
  - Shop facades, market alleys, commercial streets, convenience-store and restaurant exteriors (signage always follows)
  - Documents, paperwork, printed matter, book covers, newspapers, business cards, receipts, envelopes
  - Laptop, monitor, tablet, and phone screens; presentation slides; projection surfaces
  - Whiteboards, blackboards, sticky notes, flip charts, memo pads
  - Prints, logos, and brand marks on clothing, hats, and bags; product packaging labels; bottle labels
  - Keyboard keycaps, instrument-panel markings, button labels, elevator floor indicators
  - Office wall signage, meeting-room nameplates, reception desks

**Substitute scene grammar** — ways to carry the same message without characters. Choose from these.
  - **Human close-up**: face, hands, above-the-shoulder framing. The background is pushed out of frame, leaving no room for letters.
  - **Shallow depth of field**: focus on the subject and blur the background heavily (bokeh). Whatever is back there survives only as shape.
  - **Macro of hands and tools**: hands trimming material, hands gripping a tool, hands drawing on a notebook (shapes and lines only, never letters).
  - **Object still life**: unlabeled tools, tableware, components, or ingredients arranged on a plain surface.
  - **Texture and material**: wood, metal, textile, blank paper surface, wall.
  - **Silhouette and backlight**: keep the form, erase the detail.
  - **Fragments of space**: light through a window, a staircase, ceiling structure, plants, light fixtures.
  - **When a Korean setting is needed**: express it through **character-free materiality** — hanok timber joinery, roof tiles, latticed doors, brassware, an ondol floor, vegetables and dried goods on a market stall — instead of signage.

**Step 2 — Attach a no-text lock to every prompt**
[MUST] Define a **no-text lock paragraph** separate from the style lock, and append it verbatim, together with the style lock, to the end of every image prompt. Print the no-text lock sentence in your response body. Use the following as the base form and refine it if needed.

> `완전히 문자가 없는 장면. 프레임 안에 간판, 현수막, 메뉴판, 가격표, 포스터, 표지판, 문서, 인쇄물, 화면 UI, 의류 프린트, 로고, 제품 라벨이 없음. 글자처럼 보이는 획·기호·낙서 패턴도 없음. 배경의 벽·창·소품은 문자가 없는 무지 표면. 텍스트가 필요한 자리는 비워 둠.`
> `no text, no letters, no signage, no logos, no labels, no writing, no captions, no watermarks, blank surfaces`

[MUST] If the generation tool has a negative-prompt field, put the English list above into that field as well. (This is a parameter passed to the tool and is separate from this card's preference for positive phrasing.)
[MUST] Apply the no-text lock to **every tier** — hero, split, and spot alike. A small spot image still shows its letters when it is enlarged.

**Step 3 — Visual inspection before insertion (not skippable)**
[MUST] **Open the generated image as a file and actually look at it.** Check the following three in order and record the result.
  (a) Is there a sign, label, screen, or printed matter in the foreground?
  (b) Is there a blurry mass of lettering deep in the background? (Blurry still counts as characters.)
  (c) Is there a logo or brand mark on clothing, props, or walls?
[MUST] If any of the three applies, do not use that image — go to step 4. "It's too small to notice" and "it's blurry enough" are not valid verdicts. On a 1920×1080 canvas, all of it is visible.

**Step 4 — Escalation ladder when characters are found**
  Priority 1 — **Change the scene and regenerate.** Instead of re-rolling the same prompt, replace the subject itself using the step-1 substitute scene grammar (e.g. shop exterior → close-up of the shopkeeper's hands with shallow depth of field). Maximum 3 attempts per slot.
  Priority 2 — **Crop it out through composition.** If the characters sit only at the frame edge, push that region out of the layout with `object-position`. After cropping, run the step-3 inspection again.
  Priority 3 — **Replace with an SVG infographic.** If characters persist after 3 regenerations, convert that slot into a diagram drawn in code. This is a legitimate visual element rather than a placeholder, so it does not halt the deck. In this case, generate an additional spot image in another low-risk slot to keep the 9-image minimum.
  Priority 4 — If none of the above resolves it, report the slide and the attempt history and ask for my judgment.

[MUST] All lettering is HTML text laid over the image. Never build a structure in which the image is responsible for the words.
</IMAGE_TEXT_SAFETY>

<FILL_RULES>
[MUST] These are the rules for how a screen gets filled. When several paths would satisfy the density metrics, these rules always decide.

**F1. Ink-based judgment**
The unit of "filled" is content, not container. To judge whether a region is filled, look only at whether text, images, shapes, or icons actually sit on it. Background fills, borders, shadows, and dividers are not used in that judgment.

**F2. How container size is determined**
- Instead of applying `height`, `min-height`, `flex: 1`, or `align-items: stretch` to a card or panel, let the height follow the content (`height: auto`). Give grid parents `align-items: start`.
- To equalize card heights, **adjust how much content each card carries** until they match. Stretching to match is not used.
- Inside a card, instead of pushing rows apart with `justify-content: space-between`, use `flex-start` with a fixed `gap` (16–24px).

**F3. Completeness of rows and cells**
Every row in a list, table, or timeline carries at least two of: label / value or figure / one-line description / icon / spot image / status badge. A row holding only a label leaves its right half dead, so give it an example, a criterion, or a caution line — or merge it with another row.

**F4. Spacing ceilings**
- Internal card row gap 16–24px, internal card padding 24–32px
- Gutter between cards 20–28px, gap between slide blocks 20–32px
- Slide outer margin 48–64px
Rather than exceeding these ceilings to fill the screen with air, apply the residual-space ladder.

**F5. Residual-space ladder** — the CRITICAL_CONSTRAINTS ladder governs, in that order: ① unused evidence → ② newly generated infographic or spot image → ③ white background **outside** the card, with that slide and the reason named in the self-verification report.

**F6. Where white space belongs**
Unavoidable white space goes **outside** cards and panels, on the white background. The screen should read as "small but densely packed cards on a generous background", not as "sparse cards". Rather than covering emptiness with a wide gray secondary background (`#F4F6F9`), leave the white background as it is.
</FILL_RULES>

<PHASE_1_READ_AND_INFER>
[MUST] Read the entire document and infer the six items below. Declare the inference in 3–5 lines in your response body, then move on. Mark items with weak support in the document as `가정:`.

1. **Audience** — Who are you presenting to? What do they already know, and what don't they?
2. **Purpose** — Persuasive (recruiting, fundraising, proposal, approval request) / informational (reporting, status update, results) / educational (concept explanation, onboarding)?
3. **One-line core message** — If the audience remembers exactly one thing afterward, what is it?
4. **Unfamiliarity diagnosis** — Extract every concept, term, and proper noun the audience will not know.
5. **Three strongest pieces of evidence** — figures, cases, or comparative advantages, ordered by persuasive force.
6. **Three anticipated objections** — cost, time, difficulty, risk of failure, "does this concern me?".

[MUST] **Evidence inventory** — before designing slides, extract and list all of the following from the document.
  - Figures, ratios, amounts, durations, headcounts (with their location in the source)
  - Proper nouns, organization names, role names
  - Procedures with steps or ordering
  - Time information (schedules, milestones, periods)
  - Comparable pairs (before/after, A/B, existing/new)
  - Lists of conditions, eligibility, and prerequisites
  - Quotable sentences
[MUST] Count the total extracted evidence items and compare against `required IU total = slide count × 7`. If evidence falls short, **reduce the slide count** to protect density. If evidence is left over, add slides or move it to an appendix. State the calculation in one line.
[MUST] For any slide short on evidence, **pre-assign one infographic or image idea** that explains its message intuitively. Choose that image idea from the substitute scene grammar in IMAGE_TEXT_SAFETY step 1.

[MUST] Size the deck: set the slide count in proportion to the document's real section count and evidence density. Typically 15–30 slides; when the content is thin, cut it down cleanly rather than padding to reach 20. State the reasoning in one line.
</PHASE_1_READ_AND_INFER>

<PHASE_2_NARRATIVE>
[MUST] Pick one of the skeletons below according to the PHASE_1 purpose verdict, and state the reason for the choice in one line.

**Persuasive skeleton**
Hook (one scene or one number) → definition (one sentence + analogy + picture) → problem → turn → solution (process diagram required) → evidence (figures, cases, comparison table) → experience (chronological flow) → objection handling → conditions (who, when, cost, prerequisites) → action (steps, deadline, contact)

**Informational skeleton**
Conclusion first → background → data and analysis → interpretation → risks and limits → next actions → appendix

**Educational skeleton**
Why it matters → one-sentence definition → analogy → decomposition into components → order of operation → correcting misconceptions → practice and application → summary card

[MUST] After choosing the skeleton, write the **storyboard** as a table first. Use these columns:
`슬라이드 번호 | 한 줄 메시지 | 레이아웃 유형 | 시각 요소 A(종류) | 시각 요소 B(종류) | IU 예상 개수 | 생성 이미지(히어로/분할/스팟/없음) | 이미지 장면 유형(대체 장면 문법 중 택1) | 여백 발생 시 채울 것`
Any row whose expected IU count is below 7 is merged or reinforced at the storyboard stage. **If the image-scene-type column names a scene containing signage, documents, or screens, replace it with a substitute scene right there.** Print this table in your response body before building the HTML.

[MUST] Hold to one message per slide. Density is not achieved by cramming sentences in; it is achieved by **converting sentences into structure** — cards, tables, timelines, figures, diagrams.

[MUST] **Sentence → structure conversion rules**: whenever three or more sentences on the same subject collect, convert them into one of the following.
  - 3–6 parallel items → card grid (each card carrying an icon or spot image + a one-line description)
  - Ordered items → process flow or timeline
  - Opposed items → two-column comparison or quadrant matrix
  - Items containing figures → stat card band or metric chart
  - Conditions and eligibility → checklist or table (each row carrying a criterion column and an example column)
</PHASE_2_NARRATIVE>

<PHASE_3_VISUALS>
[MUST] Separate visual elements into two tracks.
- **Generated images** = atmosphere, metaphor, scene, people, emotional imprint of a concept. Never used to convey facts.
- **Diagrams drawn in code (inline SVG / HTML+CSS)** = processes, comparisons, timelines, figures, structures, funnels, before/after contrasts. Numbers and relationships are always drawn accurately in code.

**Generated-image rules**
[MUST] Place generated images on 55–70% of all slides, with a minimum of 9 images. That count is measured in images that passed IMAGE_TEXT_SAFETY inspection.
[MUST] Operate images in three tiers.
  - **Hero (16:9)**: cover, chapter breaks, full-bleed backgrounds. 3–5 per deck. **This is the highest-risk tier for characters, so design it around human close-ups, texture shots, and silhouettes.**
  - **Split (3:4 or 1:1)**: one side of a split layout. 3–5 per deck.
  - **Spot (1:1)**: 200–320px images inside cards and timeline nodes. At least 4 per deck. Macro shots and object still lifes suit this tier and carry the lowest character risk.
[MUST] Before generating any image, define both a **style lock** paragraph and a **no-text lock** paragraph, and append both to the end of every prompt. Print both paragraphs in your response body. For spot images, also specify "tight composition with the subject filling the frame and little empty space".
[MUST] **Ask yourself before submitting a prompt**: "Is there any room in the scene I described for a sign, a document, a screen, or a label?" If there is, do not submit it — change the scene.
[MUST] **Inspect visually immediately after generation** (IMAGE_TEXT_SAFETY step 3). Record the inspection result per slot.
[MUST] **Additional generation for residual space**: after assembling a slide, if an empty region larger than 240×240px remains, generate an additional spot image sized for that space. The additions go through the same inspection.
[MUST] When placing text over an image, secure a contrast ratio of at least 4.5:1 with a gradient overlay or a translucent panel.
[MUST] Place images with `object-fit: cover` so they fill their region completely and no letterbox gaps appear.
[SHOULD] Write image prompts as concrete nouns describing "what is visible".
[SHOULD] Batch independent image-generation calls in parallel — all prompts for one tier leave in a **single message**, since calls sent in separate messages run sequentially no matter how the plan reads. Running the hero group → split group → spot group in that order makes failures and contamination easy to localize.

**Infographic rules**
[MUST] Choose types that fit the content from the list below, and use **at least 7 different types** across the deck.
Process flow / timeline / comparison matrix / quadrant matrix / numeric stat card band / funnel / structure and relationship map / before-after contrast / checklist / metric chart (bar, line, donut) / progress bar / pictogram array / hierarchy tree / gauge / heatmap grid / icon+label card grid
[MUST] Set key figures at 100–160px with a 20–24px caption beneath giving the unit and the source.
[MUST] On a slide with only one key figure, place that figure large in the center **together with 2–3 supporting metrics**.
[MUST] Configure SVG diagrams with `viewBox` and `preserveAspectRatio` so they fill their region, and keep node spacing within the F4 ceilings. Rather than stretching a diagram to cover the screen, increase the node count or the information it carries.
[MUST] Never fabricate a figure that is not in the document. A value whose source is unclear is marked `[unverified]` or dropped entirely.
</PHASE_3_VISUALS>

<PHASE_4_BUILD>
[MUST] Write a single .html to the specification below. (If the environment provides scaffolding, ENVIRONMENT_ADAPTATION takes precedence.)

**Canvas and structure**
- One slide = a fixed `1920 × 1080px` container. Scale to viewport width with `transform: scale()` and keep the original coordinate system.
- Slide outer margin 48–64px.
- Leave cards and panels at `height: auto` and give grid parents `align-items: start`.
- Move between slides with keyboard ← / → and with clicks; show `current/total` in the lower right.
- Under `@media print`, make each slide fall on its own page so PDF export works.

**Density instrumentation**
[SHOULD] When the URL carries `?debug=1`, display the overlay below. It must not appear in the default state.
  - Overlay the 3×3 zone grid and mark **zones with no content** in red
  - Outline every card and panel, and mark in red **any card whose content area is under 70% of its inner area**
  - Print (ink zones occupied / IU count / number of visual kinds / lowest card fill rate) in the upper left

**Typography (1920×1080 basis, floors enforced)**
| 용도 | 크기 | 굵기 |
|---|---|---|
| 표지 대제목 | 96~120px | 800 |
| 슬라이드 제목 | 56~72px | 700 |
| 소제목·리드문 | 34~42px | 600 |
| 본문 | 28~32px | 400~500 |
| 핵심 수치 | 100~160px | 800 |
| 캡션·출처 | 20~24px | 400 |
- Korean sans-serif first (Pretendard → Noto Sans KR → system-ui fallback), line-height 1.35–1.45, letter-spacing -0.01em.
- Rather than pushing font sizes above these ranges to absorb empty space, apply the residual-space ladder.
- 180–340 body characters per slide.

**Color — fixed light and clean**
- Background `#FFFFFF`, secondary background `#F4F6F9`, card background `#FFFFFF` with shadow `0 2px 16px rgba(17,20,24,.08)`
- Body text `#111418`, secondary text `#5A6270`, dividers `#E3E6EB`
- Use exactly one accent color (default `#2563EB`) plus one secondary emphasis color.
- Use the secondary background (`#F4F6F9`) **only to demarcate blocks that are actually filled with content.**
- A dark background (`#111418`) is permitted on chapter-transition slides only.
- Contrast ratio between body text and background at least 4.5:1.

**Layout patterns** — rotate them to create rhythm. Never run the same layout three slides in a row. The last six are high-density patterns; use at least 4 of them across the deck.
Full-bleed hero image + overlay text / left text : right image (50:50, 60:40) / title on top + 3–4 column cards below / large central figure + supporting metrics left and right / full-width process diagram / left image : right timeline / two-column comparison / dark-background chapter break /
**3×2 card grid (each card carrying a spot image or icon)** / **top figure band + middle diagram + bottom caption strip (three-tier stack)** / **left image : right 2×2 matrix** / **four-panel spot-image mosaic with a label per cell** / **left timeline : right stack of 3 spot images** / **central diagram + 4 satellite support cards**

[MUST] Immediately after writing each slide, self-check the following and reinforce before moving to the next slide if anything falls short.
  (a) At least 8 ink zones occupied  (b) 7–12 IUs  (c) At least 2 kinds of visual  (d) Bottom band filled
  (e) Every card at 70%+ internal fill  (f) Zero label-only rows  (g) Zero empty regions larger than 240×240px
  (h) **Every image inserted on this slide passed visual inspection — zero characters**
[SHOULD] Add speaker notes to each slide as an HTML comment or a toggleable hidden block, 2–3 sentences on what the presenter will say. 발표자 노트도 한국어로 작성한다.
</PHASE_4_BUILD>

<MID_CHECK>
At the halfway point of writing the HTML, re-confirm: (1) the 28px body floor still holds (2) the three density floors are met (3) every card is at 70%+ internal fill — actually check for stretched cards and widened row gaps (4) label-only rows (5) slides with an empty bottom 25% (6) **re-open every image inserted so far, one by one, and re-confirm there are no characters — if any image skipped inspection, inspect it now** (7) count the inspected-and-passed images against the 9-image target (8) count the infographic types used so far (9) no slide overflows the canvas.
</MID_CHECK>

<OUTPUT_SPEC>
- Deliverable: one single `.html` file (CSS and JS inline; the only permitted external dependencies are web fonts and generated-image URLs).
- Filename: a Korean name reflecting the presentation topic + `_발표자료.html`.
- In the conversation body, print only the following, concisely and in Korean: PHASE_1 inference declaration → evidence-inventory vs. required-IU calculation → deck-size reasoning → storyboard table → style lock paragraph → **no-text lock paragraph** → and, on completion, the self-verification results (이미지 문자 검수표 + 카드 감사표 + 밀도 계측표).
</OUTPUT_SPEC>

<ACCEPTANCE_CRITERIA>
All of the following must hold. Verify each one against real evidence and report the pass/fail.
1. **Every inserted generated image was opened and looked at individually, and the number of images containing letters or letter-like marks inside the frame is zero.**
2. **The number of images featuring a sign, document, screen, label, or logo as a subject is zero.**
3. **Every image prompt carried both the style lock and the no-text lock.**
4. Every slide fits inside 1920×1080 with no scrolling and no clipping.
5. No element uses body text below 28px. (Captions and sources may go down to 20px.)
6. The number of cards and panels below 70% internal fill is zero.
7. The number of cards stretched by `height`, `min-height`, `flex: 1`, or `align-items: stretch` is zero.
8. The number of rows carrying only a label, with no value, description, icon, or image, is zero.
9. The number of blocks wrapped in a background panel while holding two or fewer elements is zero.
10. The number of slides with content in fewer than 8 of the 3×3 zones is zero.
11. The number of slides with fewer than 7 or more than 12 IUs is zero.
12. The number of slides with no content in the bottom 25% is zero.
13. Any slide still holding an empty region larger than 240×240px was reported together with the record of attempting ladder priorities 1 and 2, and the remaining space sits on white background outside the cards.
14. At least 9 inspection-passed images are inserted, images appear on 55–70% of slides, and every image loads.
15. At least 4 small spot images are used.
16. At least 7 different infographic types are used.
17. At least 4 high-density layout patterns are used, and no layout repeats three slides in a row.
18. Within the first 5 slides, the core concept appears as "one-sentence definition + analogy + picture".
19. For a persuasive deck, an objection-handling slide and a concrete call-to-action slide both exist.
20. Every figure is either confirmed in the source document or marked `[unverified]`.
21. The number of slides exceeding 340 body characters or 4 simultaneous colors is zero.
22. Every claim in the verification report traces to something you actually ran, opened, or measured; anything you could not verify carries `[unverified]`.
</ACCEPTANCE_CRITERIA>

<QUALITY_CRITERIA>
<GOOD_EXAMPLE>
Under the title "참가자는 3일 동안 이렇게 움직입니다" (64px), the left 40% carries a generated image — a macro of a worker's hands trimming material, the background blurred to pure shape by shallow depth of field, no lettering anywhere. The right 60% carries a Day 1/2/3 timeline SVG. Each node states time, activity, and output at 30px, with a 240px 1:1 spot image attached. Node spacing fixed at 20px; the card's height is the sum of the three node heights, so there is no empty space inside it. The bottom band carries "완주율 82%" at 130px with two supporting metrics beside it. IUs 11, ink zones 9/9, lowest card fill rate 88%, characters in images 0.
</GOOD_EXAMPLE>
<BAD_EXAMPLE>
For a small-business case slide, a scene of "a shopkeeper smiling in the doorway" was generated, and the background sign came out reading "작장의" with "짐의 / 장품" on the side window in broken Korean. It was inserted anyway. → Fix: a shop exterior inevitably drags signage along, so change the scene itself. Regenerate as "close-up of the shopkeeper's face, above-the-shoulder framing, background fully blurred by shallow depth of field" or "macro of hands arranging goods", attach the no-text lock, open the result and look at it, and only then insert.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
An image with blurry lettering in the background was used anyway because "it's probably too small to notice". → Fix: on a 1920×1080 canvas and on a large screen, all of it is visible. Blurry lettering counts as characters — regenerate, or if the characters are at the edge, crop with `object-position` and inspect again.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
A gray panel spread across 80% of the slide height with 4 label rows floated at 90px intervals, the right side of every row empty. → Fix: shrink the panel to its content and fix row gaps at 20px. Add a one-line input example (28px) and an icon to each row. Fill the remaining vertical space with a newly drawn process SVG, and if space still remains, leave it as white background outside the card.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
A gray panel containing only a subheading and one caption line, the rest empty gray. → Fix: with only two elements, drop the panel and place the content directly on the slide background, or merge it with another card.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
`flex: 1` applied to the shorter of three cards to equalize heights, leaving its lower half empty. → Fix: switch to `align-items: start` and match heights by adding a figure or an icon — that is, by content volume.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
Body text dropped to 22px to push 450 characters onto the slide in the name of density. → Fix: hold the 28px floor, convert the sentences into cards, tables, and figures, and move the overflow to the next slide.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
A figure like "만족도 95%" that appears nowhere in the source was invented and placed on a slide. → Fix: use only what the source states; where there is no basis, switch to a qualitative expression or attach `[unverified]`.
</BAD_EXAMPLE>
<BAD_EXAMPLE>
Image tone varies slide to slide (watercolor → photograph → 3D render). → Fix: append the identical style lock paragraph to every image prompt.
</BAD_EXAMPLE>
</QUALITY_CRITERIA>

<PARALLEL_EXECUTION>

**Critical path first.** Optimize serial orchestrator turns, not worker count: inside a turn cost
adds up but elapsed time is the slowest worker, and every extra turn is pure latency. Name the
dependency chain that ends in the deliverable before dispatching. Dependency is mechanical — B
depends on A only if B reads a file A writes, needs a decision A makes, or needs a verdict on A's
output. All three "no" → same dispatch.

**Start the long poles the moment their inputs freeze.** Builds, test suites, deploys, and media or
API generation dominate wall clock: launch them in the background as soon as their input tree is
frozen, then work on what they do not read — editing a tree mid-build makes the verdict apply to a
tree that no longer exists. Never open a turn whose only content is waiting. Read-only prefetch is
free: dispatch it now if it might be needed and cannot mutate anything. Never speculate on writes,
migrations, deploys, or paid generation.

**Fan out by default.** Reads, searches, audits, and evidence gathering carry no write risk — batch them wide in the first dispatch rather than discovering the need one file at a time. Three cuts, in order of
preference:
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
alone: workers emit fragments into paths they own and propose edits elsewhere; you apply them
serially. After fan-in, map every path in `git diff --name-only` back to exactly one allowlist —
an unmapped file means that worker's output is quarantined pending review.

**Worker brief contract.** Workers see none of your context, cannot ask, and cannot talk to each
other. Every brief is self-contained and carries seven things:
1. goal, as an observable condition;
2. contracts cited by absolute path and symbol — cite, never paraphrase; paraphrase is drift;
3. write-allowlist and what is off-limits;
4. output and report format;
5. tool scope and forbidden commands;
6. prohibitions: no contract edits, no scope expansion, no shared-file writes, no guessing;
7. what to do when blocked.

"As discussed above" or "the usual way" is a broken brief — that referent does not exist for the
worker. Fix the output contract and show one worked example before fanning out. Returns are
schema'd, seven fields: `status` (PASS/FAIL/BLOCKED/PARTIAL), `scope`, `findings` (severity,
file:line, failure scenario, evidence), `commands` (cmd + exit code), `writes` (paths touched),
`artifact` (path to long output), `unknowns`. Detail goes to the worker's own file; the return
carries only the summary and that path.

**Model tiering follows the shape of the output, not the topic.**
- Mechanical, rigid-schema output → Haiku 4.5; never a verdict.
- Ordinary production work — diffs, drafts, reviews, tests, content → Sonnet 5.
- Verdicts — gate pass/fail, root-cause adjudication, adversarial review, regression
  classification, architecture and contract decisions → Opus 5 in fresh context, because the
  context that produced the work cannot fairly judge it.

Mis-tiering is asymmetric: Opus on a mechanical sweep only lengthens the critical path; Haiku on a
judgment fails silently and looks like a pass. Keep the adjudicator off the hot path — judge batch
k-1 while implementing batch k. Tools are least-privilege: reviewers read-only (one that can edit
quietly fixes what it should have reported), verifiers execute-only, implementers write only inside
owned paths. Deploys, destructive commands, secrets, and anything needing user confirmation are
never delegated.

**Pipeline, don't barrier.** Stream each worker's result into the next stage as it returns, and
skew the stages — implement batch k + verify batch k-1 against its frozen diff + prefetch for k+1,
in one message. A full-stage barrier is justified only to compare across items or dedup globally,
set global priority, precede an irreversible step, terminate early on a zero-finding result, or
close a write-partition. Overlap verification with implementation only when all four hold: the
target is a frozen snapshot (commit, diff, untouched file set); it is disjoint from what is being
edited; a failure discards at most one batch; the verdict does not require the in-flight work. The
final gate — full build, regression verdict, data-integrity verdict, deploy — is never overlapped.
Overlap is a scheduling choice, never a relaxation of the evidence standard.

**Width sizing.** Worker count comes from the number of genuinely independent units; never split
work in order to parallelize it. Keep a wave near 3–5 writers or ~8 read-only workers; past that the
merge becomes the bottleneck and you start skimming reports. Split by expected cost, not count:
wall clock is the longest worker, so one giant unit plus four small ones buys nothing, and a stage
whose slowest worker takes 3x the median needs that unit split rather than more workers. Delegation
has a fixed price — brief, re-reading, reintegration — so do small context-heavy edits inline.
Dispatching a single worker and waiting is pure latency: delegate one only when a dedicated fresh
context is the point. Never fan out until the problem is defined, or workers solve different
problems.

**Quality is never traded for speed.** Fresh-context verification is never merged into the
implementer's context and never collapsed with another axis — merging axes cuts coverage, not time.
A worker's "done, tests pass" is input, not proof: evidence is a command you ran, its exit code and
output, and `git diff`. A PASS without a command is downgraded to UNKNOWN, and you personally
re-verify the highest-severity claim from each worker against the file or command itself.
Aggregating PASS strings is not a gate; one adjudicator decides. Partial returns never upgrade: 3
of 5 axes returned is incomplete, not a 3-axis pass. A check that could not have failed is not a
check.

**Integration ownership.** Individual worker passes are not an integration pass. After fan-in, run
one integration gate on the merged tree — never on the reports:
- contract conformance;
- duplicate implementations of the same helper;
- naming and pattern consistency;
- uniformity of cross-cutting concerns (errors, logging, auth, i18n, a11y, caching);
- orphaned or dead output from discarded workers;
- a full build/test/lint you execute yourself.

The middle four are defects parallelism creates and serial work rarely produces — obligations the
moment you fan out. Seams between partitions are yours: no worker held both sides. When two workers solve the same problem differently, take one whole and discard the other —
ranked by contract conformance, then codebase convention, then test support, then simplicity — and
never blend them into a chimera; if you need something from the discarded one, re-implement it
serially on top of the adopted one. Contradictory factual claims are settled by reproducing the
check yourself, never by majority or average. Record what was discarded and why, or the rejected
approach returns next cycle. Keep a per-wave record (brief, allowlist, outputs, verdict) and update
the state file after every wave — ownership map, wave status, open findings, next dispatch — so a
compaction or a lost worker resumes from the file, not from scrollback.

**Failure handling.** Default: quarantine the failed worker's output and re-dispatch that unit
alone with a *tightened* brief — a verbatim retry reproduces the failure. Escalate to discarding
the whole wave when
- the failure touched a shared file or a contract (contamination scope unknown), or
- the cause was a contract misreading (the others likely misread it too), or
- partial adoption would leave the tree half-migrated — a half-applied refactor is worse than none.

Adopt only parts that clear the integration gate; never carry an unfinished fragment forward. Never
fill in a worker's missing fields yourself and present the result as theirs. Cap retries at 2–3,
then **do the unit inline yourself**; hand off only after that — repeated failure at the same cut
is a partitioning defect, not bad luck. Timeouts and non-responses count as failures. If results
depend on completion order, the work was never parallelizable: serialize it.

**Concurrency map for this card.**

*Run concurrently:*
- **PHASE_1 evidence inventory**, one worker per evidence class — figures and ratios / proper nouns / ordered procedures / time information and milestones / comparison pairs / condition and eligibility lists / quotable sentences. Each returns rows carrying the source location. Read-only, conflict-free.
- **All image prompts inside one tier, in a single message** — all hero slots together, then all split slots, then all spot slots. Only after the PHASE_2 storyboard is frozen.
- **IMAGE_TEXT_SAFETY step-3 inspection, one worker per generated image** — it opens the file, looks at it, returns the (a)/(b)/(c) findings. This is judgment: **Opus 5, never Haiku.**
- **PHASE_4 slide HTML**, one fragment file per slide range, one writer each; the SVG infographics for image-free slides are drawn in the same wave.
- **The three SELF_VERIFICATION measurement tables**, as three read-only lenses on the same finished `.html`: 밀도 계측표 and 카드 감사표 are mechanical counting (Haiku 4.5), 수치 출처 대조표 needs the source document alongside (Sonnet 5).

*Serialize:*
- **PHASE_1 inference → PHASE_2 storyboard.** The storyboard is the contract two different consumers read — image generation reads 이미지 장면 유형, the HTML build reads 레이아웃 유형 and IU 예상 개수 — so a slide count revised after fan-out invalidates both.
- **The style lock and the no-text lock paragraphs, written once before any prompt leaves.** A worker inventing its own style lock produces exactly the slide-to-slide tone drift the last BAD_EXAMPLE describes.
- **Generation → inspection → insertion**, a chain where each output is the next input. The step-4 ladder decision — 재생성 / 크롭 / SVG 대체 / 보고 — is a verdict you make yourself.
- **The single `.html` assembly, one writer: you.** Fragments never write into the deliverable file directly.
- **Tier after tier**, for one reason only: a lock defect contaminates a whole tier, and catching it at the tier boundary is cheaper than after every paid generation has run.
- **MID_CHECK and the final ACCEPTANCE_CRITERIA walk** are legitimate barriers — both compare globally (inspected-and-passed image count against the 9-image floor, infographic-type count, layout-repeat check).

*Long pole to start first:* image generation. It dominates wall clock and it costs money, so it starts the moment — and never before — the storyboard's 이미지 장면 유형 column is frozen and both lock paragraphs are written. No speculative generation. While a tier is generating, write the slide scaffolding and the code-drawn diagrams for slides that take no image from that tier: that work touches no file the generation reads.

</PARALLEL_EXECUTION>

<ENVIRONMENT_SKILLS>
**S1 — The inline path is the contract.** [MUST] Skills are accelerators: a skill changes only the route taken, never the destination. This card runs to completion with **zero** installed skills, at the same output format, the same gate thresholds, the same acceptance criteria — every phase, gate, and AC here is executable with nothing but the model, a shell, and the repository. Never make a skill a precondition ("run /design-consultation first"), never name one inside an acceptance criterion, never produce an artifact that cannot be reproduced without one. If you cannot state how a step would run with no skill installed, the step is mis-specified — repair the step, do not lean on the skill.

**S2 — Detect, then use. Never assume.** [MUST] Use only what *this session* actually exposes (it appears in the available-skill list, or the command resolves). Never infer availability from repo contents, OS, a CLAUDE.md mention, a lockfile, or a previous session. Never invent, alias, or approximate a name. Never install anything. Absent / erroring / timing out / unreadable output → one retry maximum, then fall through **silently**: no question to the user, no pause, no blocker, no downgraded deliverable. Log one line: `skill /x unavailable → inline path`.

**S3 — Match on capability, not on name.** [MUST] Each row is a capability this card requires; the command is one known implementation (local inventory, gstack v1.67.2). Any equivalent this environment exposes substitutes cleanly. Rows this card never touches may be deleted from the table.

| Capability this card needs | Accelerator, if actually exposed | Canonical inline path |
|---|---|---|
| Visual QA — spacing, hierarchy, inconsistency, AI slop (edits files) | `/design-review`, `/design-shotgun` | Anti-Slop + spacing/hierarchy/token pass at every breakpoint; screenshots as evidence |
| Functional QA | `/qa-only` at gates; `/qa` only outside gates | Enumerate flows, exercise boundaries, log findings with reproductions, fix, re-verify |
| Root-cause investigation under no-fix-before-cause | `/investigate` | Reproduce → isolate → state the cause → fix. No fix without a stated cause |
| Headless browser — navigate, interact, assert state, annotated/responsive screenshots, before/after diff | `/browse` (~100 ms per command once warm), `/benchmark` | Playwright/Puppeteer MCP or the project's automation; manual capture as last resort |
| Docs, diagrams, PDF | `/document-generate`, `/diagram`, `/make-pdf` | Draft from the code and its public interface; hand-authored SVG/mermaid; print-stylesheet export |
| Session carry-over | `/context-save`, `/context-restore` | The project's handoff document |

**S4 — Evidence is the artifact, never the invocation.** [MUST] Evidence is the report file you opened, the diff it produced, the screenshot path that now exists on disk, the exit status you observed. "I ran /qa", "design review passed", "verified with /browse" are self-narration, rejected wherever this card demands evidence. [MUST] Invoking a skill discharges **no** acceptance criterion: AC are satisfied only by the observable facts this card names — command output, P0 count 0 with each finding quoted at `file:line`, screenshots existing at a stated path. A missing or unreadable skill report makes the criterion **UNMET**, never "assumed pass"; redo it inline. Numbers copied out of a skill report carry the same sourcing rule as any other: traceable to output you read, or deleted. A skill call upgrades neither your authority nor your evidence — anything this card gates behind user confirmation (production deploy, schema change, destructive operation) stays gated when a skill would perform it.

**S5 — Separate diagnosis from repair.** [MUST] Some skills edit code on their own (`/qa`, `/design-review`, `/design-html`, and `/investigate` may land fixes), silently converting a review gate into an edit and letting the fixer certify its own work. At any step this card defines as a *gate* (review, verification, acceptance, pre-merge, Anti-Slop), prefer the report-only variant: `/qa-only` over `/qa`, read-only inline inspection over `/design-review`. When only a fixing skill exists: run it on a clean tree so its edits are isolated in `git diff`, review those edits as you would any other change, then **re-run the gate against the post-fix tree** — a fixer never passes the gate on code it just rewrote. Name its edits in the change record (which skill, which files, what changed). Never let a fixer run where this card requires cause before repair.

**S6 — When a skill and the inline procedure disagree, the stricter verdict governs.** [MUST] Skill FAIL + inline PASS → FAIL; reproduce the finding inline at `file:line` and only a reproduction that demonstrably contradicts it clears the flag — if you cannot reproduce it either way, keep the failure and fix it. Skill PASS + inline FAIL → FAIL stands; this card's criteria are the contract. Both fail on different grounds → both findings are real. Record each divergence in one line (what disagreed, which verdict was followed, why) and surface the list at the end; repeated divergence is a defect signal about the card or the skill.

**S7 — Concurrency follows write access, not convenience.** [MUST] Read-only and report-only skills touch nothing and fan out freely — dispatch **whichever of** `/review`, `/health`, `/devex-review`, `/cso`, `/qa-only`, `/benchmark`, `/scrape`, and read-only `/browse` **this session actually exposes**, as one batch, then reconcile the findings once. Skills that edit the working tree (S5's list, plus `/design-consultation`, `/document-generate`, `/land-and-deploy`) serialize against each other **and** against your own edits; two writers on one tree produce a diff you cannot audit. Where both variants of a capability exist, the read-only one goes in the parallel audit pass and every fix lands in a single serialized pass afterward. [MUST] `/browse` is the one accelerator with a warm-up cost: fire its first navigation early so the daemon is warm when the measurement pass starts (~100 ms per command afterwards; `/benchmark` reuses the session). With zero skills the wall-clock target is unchanged.

**S8 — Respect the delegation break-even.** [MUST] A skill call costs a load, a process, and that skill's own multi-phase protocol. Do it yourself when the answer is one read, one grep, or one command whose output shape you can already predict. Delegate when the task is multi-step, when it needs a capability you would otherwise have to build (headless browser, renderer, diagram emitter), or when its output is an artifact this card requires anyway. Never chain a skill for a single-fact check; never call one to confirm what you just observed.

**S9 — Prerequisites: the requirement is on the artifact and its content, never on its producer.** [MUST] Resolve in order: (a) it exists → it is authoritative; (b) a skill produces it → run that skill once and proceed; (c) neither → construct the minimum version inline from what the repository already commits, write it to the same path, and say you created it. A missing producer is never a reason to skip a step.
- **`DESIGN.md` / token layer absent** → extract palette, type scale, spacing scale, radii, and the motion budget from the existing codebase; with no codebase, commit to one tone and define the minimum token set this work needs. Write it to `DESIGN.md` at repo root, marking every inferred value with the assumption marker `가정:`. From that moment it is authoritative exactly as a generated one would be.
- **Screenshot / baseline directory absent** → create it at the project's existing convention (e.g. `.playwright-mcp/`) and capture with whatever automation exists; with none, capture manually and say so in the evidence line. **Spec or plan absent** → write the one-page spec before implementing.
- [MUST] Never stand up a second system beside one that already exists, never emit an empty or placeholder artifact to satisfy a file-existence check, and never let a downstream step consume an artifact you only assumed.

[MUST] Do not report skill usage as an accomplishment. Report facts: what was checked, what was found, where the evidence lives.

**Skill map for this card.**
| If exposed | Use it for | Inline fallback (canonical) |
|---|---|---|
| `/browse` | Rendering the assembled `.html` and measuring it: per-slide capture at the 1920×1080 coordinate system for the 밀도 계측표 and the 카드 감사표, the `?debug=1` zone/card overlay, ACCEPTANCE_CRITERIA 4 (fits with no scrolling or clipping) and 14 (every image loads). Fire its first navigation while an image tier is still generating so the daemon is warm when the measurement pass starts | The PHASE_4 per-slide self-check (a)–(h) and the SELF_VERIFICATION measurement tables, read off the rendered output through the project's own browser automation; manual capture as last resort |
| `/design-review`, `/design-shotgun` | A spacing / hierarchy / AI-slop sweep over the built deck **before** SELF_VERIFICATION opens. It edits files, so it never runs as the gate: run it on a clean tree, review its diff, name its edits in the report, then re-derive 카드 감사표 and 밀도 계측표 against the post-fix `.html` | The FILL_RULES pass (F1–F6) plus the residual-space ladder, applied slide by slide against the render |
| `/qa-only` | SELF_VERIFICATION item 9 — the fresh-context re-derivation of the 22 ACCEPTANCE_CRITERIA from the finished `.html` and the source document. Never `/qa` here: it edits, and it would be certifying the deck it just rewrote | A fresh-context subagent handed only the `.html`, the source document, and the ACCEPTANCE_CRITERIA, re-deriving every verdict on its own |
| `/diagram` | Drafting a PHASE_3 infographic — process flow, timeline, comparison or quadrant matrix, hierarchy tree — as SVG you then inline into the single `.html` | Hand-authored inline SVG with `viewBox` + `preserveAspectRatio`, node spacing inside the F4 ceilings, per the PHASE_3 infographic rules |
| `/investigate` | A slide that clips the canvas, a `transform: scale()` that breaks at some viewport, an image that will not load — name the cause before editing the HTML | Reproduce in the render → isolate → state the cause → fix |
| `/context-save`, `/context-restore` | Carrying `<deck-name>_진행상태.md` across a compaction or a new session, so already-generated and already-inspected image slots are never paid for twice | Write and read that file by hand at every tier boundary; it is the contract either way |

**Sources of the three things this card assumes.**
- **Design authority** — **overrides S9's `DESIGN.md` bullet: do not write a `DESIGN.md` for this deck.** Its design system of record is PHASE_4 itself — canvas, typography floors, the fixed light palette, the layout patterns — unless the environment supplies deck scaffolding, in which case ENVIRONMENT_ADAPTATION makes that scaffolding authoritative and PHASE_4's numbers become floors. Never stand a second system beside either one.
- **Image generation and the capture directory** — governed by this card's Higgsfield-first rule in CRITICAL_CONSTRAINTS and its fall-through in ENVIRONMENT_ADAPTATION, not by the table above; the no-text lock, the visual inspection, and the escalation ladder are tool-independent and survive any substitution. With no capture directory, create one at the project's convention (e.g. `.playwright-mcp/`) for the per-image inspection files and slide captures; with no automation at all, open each generated image manually and say so in the evidence line. The one path this card never allows is inserting an image nobody looked at.
- **Session state** — `<deck-name>_진행상태.md` per CRITICAL_CONSTRAINTS, written and read by hand at every tier boundary where `/context-save` and `/context-restore` are absent. It exists so a compaction never re-buys images already generated and inspected.
</ENVIRONMENT_SKILLS>

<SELF_VERIFICATION>
After completing the HTML, perform the following in order and report the results as tables. Your own draft's assertions are not evidence about the draft — every row below must come from an image you opened, a value you measured in the rendered output, or a sentence you found in the source document.

1. **이미지 문자 검수표** first. For every inserted generated image:
   `슬라이드 번호 | 등급(히어로/분할/스팟) | 장면 유형 | 육안 확인 여부(O/X) | 문자 발견(없음/전경/배경/로고) | 재생성 횟수 | 최종 처리(사용/크롭/SVG대체)`
   If any row has X for visual inspection, inspect it now and update the table. The number of rows left as "사용" while characters were found must be zero.
2. **카드 감사표**. For every card and panel:
   `슬라이드 번호 | 카드 이름 | 내부 요소 수 | 내부 충전율(%) | 높이 지정 여부(auto/고정) | 레이블만 있는 행 수`
   Fix any card below 70% fill, with a fixed height, or with label-only rows, then update the table.
3. **밀도 계측표**. For every slide:
   `번호 | 잉크 존 점유(n/9) | IU 수 | 시각 요소 종류 수 | 하단 밴드(O/X) | 최대 빈 영역 크기 | 사다리 처리 단계(1/2/3) | 이미지 등급 | 본문 글자 수`
4. **수치 출처 대조표** — data integrity. For every figure that appears anywhere in the deck:
   `슬라이드 번호 | 표기된 수치 | 원문 근거 문장(발췌) | 원문 위치 | 판정(일치/불일치/근거없음)`
   Any row judged 불일치 is corrected; any row judged 근거없음 must carry `[unverified]` on the slide itself, or the figure is removed. Do not sample here — every figure gets a row.
5. Walk the 22 ACCEPTANCE_CRITERIA items one at a time against real evidence and mark pass/fail.
6. Pick 3 slides at random and judge "from 5m away, is it clear within 3 seconds what this says?" If the answer is "it's full but I can't tell what it says", you crossed the density ceiling — remove elements.
7. Report the total count of inspected-and-passed images, the share of slides carrying an image, the number of additional images generated for residual space, and the number of slots replaced by SVG.
8. List the infographic types and layout patterns used and report the counts.
9. **Independent verification** — dispatch a fresh-context subagent that has not seen this report, hand it only the finished .html, the source document, and the ACCEPTANCE_CRITERIA, and have it re-derive the verdicts on its own. Default model Sonnet 5; Haiku 4.5 is sufficient for the mechanical counting passes (IU counts, character counts, color counts, image counts); use Opus 5 for the hardest judgment — the image-character inspection and the 3-second-readability call. Where its verdict disagrees with yours, its verdict stands until you produce evidence that overturns it.
10. Anything still failing goes **up** the ladder, never around the same loop: ① redo that one item at a tightened scope — one slide, one card, one image slot; ② change method, not effort — a different layout pattern, a different substitute scene, an SVG in place of a generated image; repeating the identical fix is not a rung; ③ shelve that single item as `[SKIPPED]` with its reason and continue the rest of the checklist. State every shelved item explicitly rather than omitting it, and tag `[unverified]` anything you could not verify. Only the two CRITICAL_CONSTRAINTS exceptions (image generation still failing after 3 retries; characters still present after all 4 IMAGE_TEXT_SAFETY steps) stop the run.
11. **병렬 실행 감사** — list every fan-out with its write-allowlist and what came back, then confirm both directions. Nothing independent was trickled out one turn at a time: the evidence-inventory classes, the prompts within a single image tier, the per-image inspections, the slide-fragment writes, and the three measurement tables each left in one message. And nothing in the evidence standard was thinned for speed: item 9's fresh-context pass still ran, every image was still opened and looked at individually rather than sampled, no PASS was accepted without the command or the file behind it, and the .html was assembled by a single writer.
12. **환경 스킬 감사** — list every environment skill invoked, what it produced, and where that artifact sits. Then confirm three things. Every verdict in the tables above rests on an image you opened, a value you measured in the rendered output, or a sentence you found in the source document — never on the fact that a skill ran. No ACCEPTANCE_CRITERIA item was skipped, softened, or marked assumed-pass because a skill was absent, erroring, or unreadable; anything in that state was redone inline. And no file-editing skill certified the deck it had just edited — 카드 감사표, 밀도 계측표, and item 9 all ran against the post-fix `.html`. Record each skill-vs-inline divergence in one line with the verdict you followed.
</SELF_VERIFICATION>

<FINAL_REMINDER>
Confirming again:
- The deliverable is **a single .html**, fixed 1920×1080 canvases, **Korean text throughout**.
- **Zero letters inside any generated image.** Scenes containing signage, banners, menu boards, documents, screen UI, logos, or product labels are excluded at the design stage and replaced with human close-ups, shallow depth of field, macro shots, texture, and silhouettes. A Korean setting is expressed through character-free materiality — timber joinery, roof tiles, latticed doors, brassware — rather than signage.
- **Every image prompt carries the style lock plus the no-text lock.** If a negative-prompt field exists, the English no-text list goes there too.
- **Open and look at every image before inserting it.** Blurry lettering still counts as characters. On discovery: ① change the scene and regenerate (max 3) → ② crop with composition → ③ replace with an SVG infographic → ④ report.
- **Whitespace is measured in ink.** Card backgrounds, borders, and shadows are not "filled".
- **Containers shrink to their content.** `height: auto` + `align-items: start` instead of `height`, `min-height`, `flex: 1`, or `align-items: stretch`. Card heights are matched by content volume.
- **70%+ internal card fill**, internal row gaps 16–24px, internal padding 24–32px.
- **No label-only rows.** Blocks with two or fewer elements are not wrapped in a panel.
- **Residual-space ladder**: ① unused evidence → ② newly generated infographic or spot image → ③ white background **outside** the card. Unavoidable white space goes outside cards, never inside them.
- Three density floors: at least 8 ink zones / 7–12 IUs / at least 2 kinds of visual. The bottom 25% is filled.
- **Body text at least 28px, titles at least 56px.** Fonts are never enlarged to absorb white space.
- **At least 9 inspection-passed images, on 55–70% of slides.** At least 4 spot images.
- **At least 7 infographic types, at least 4 high-density layouts.** Figures absent from the source are never invented.
- Markers: `가정:` / `[unverified]` / `[SKIPPED]`, and nothing else.
- Keep `<deck-name>_진행상태.md` current at every tier boundary, so a compaction never re-buys an image already generated and inspected. A failing check climbs the ladder — tighten scope, change method, shelve that one item — instead of looping on the same fix.
- Dispatch independent work concurrently in a single message and never let a turn be spent only waiting — but one writer per path, contracts and verdicts serial, and independent fresh-context verification intact. Speed comes from overlapping work, never from checking less.
- Environment skills are accelerators, never assumptions — use only what this session actually exposes, fall through to the inline procedure silently when it does not, and never let a skill's run substitute for the evidence, the gates, or the acceptance criteria this card requires.
- Finish by reporting **이미지 문자 검수표 + 카드 감사표 + 밀도 계측표 + 수치 출처 대조표 + the 22 ACCEPTANCE_CRITERIA items** as tables, with the independent verification verdict alongside.
- 사용자 대면 보고는 한국어로 작성한다.
</FINAL_REMINDER>
