# gov-startup-bizplan changelog

## 1.0.0

Base: desktop copy of the skill (SKILL.md, 3 references, scripts/helpers_template.py).

Applied:
- GBP-1 (P0): replaced real person names, company name and product name in examples with fictional placeholders (홍길동, OO테크, OO 서비스); reworded the bad example naming another team's company to a fictional name ((주)가나다랩) and kept the sentence; also generalized product-specific figures and tool names in examples (TAM figure, bid-prediction outsourcing item, PWA wording in references).
- GBP-2 (P0): added an environment block: python-docx and lxml install command, helper copy step, font note; helpers_template.py prints an install hint on ImportError.
- GBP-3 (P1): RULE-1/2 degrade without a web search tool: state it, mark [미확인], never present as verified.
- GBP-4 (P1): RULE-8 follows the announcement's cost categories; two lines (인건비, 외주용역비) only as default.
- GBP-5 (P1): existing "_완성.docx" is never overwritten; PS re-run and an already-written ST pass go to a new numbered file.
- GBP-6 (P2): description rewritten to the standard template with negatives (gov-doc-infographic, business-case); .docx to .hwpx is a manual hand-off with the external hwpx skill , not performed here.
- S2/S3/S4 wording added in the environment block.

Skipped: GBP-7 repetition trim (needs a dry-run comparison, plan marks it optional).
