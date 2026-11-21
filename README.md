# actigence-skills

ACTIGENCE 의 한국어 중심 Claude 커스텀 스킬 모음과 프롬프트 카드 전체입니다. Claude Code 플러그인 마켓플레이스로 설치하면 어떤 PC·어떤 계정에서든 최신판을 자동으로 받습니다. claude.ai·데스크톱 앱 zip 업로드와 수동 복사도 됩니다. 라이선스는 MIT 입니다.

English summary: a Korean-first collection of Claude skills and all ACTIGENCE prompt cards, published as a Claude Code plugin marketplace (one plugin per skill, plus `actigence-prompts` for the cards) with auto-update, per-skill zips for claude.ai and the desktop app, and manual install scripts. Prompt cards are pulled from actigence.ai every 3 hours by a GitHub Action. MIT licensed. See [docs/INSTALL.md](docs/INSTALL.md).

## 빠른 시작 (어느 PC 든 한 번)

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.ps1 | iex
```

macOS·Linux·Git Bash:

```bash
curl -fsSL https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.sh | bash
```

이 스크립트는 마켓플레이스를 추가하고 자동 업데이트를 켠 뒤(`extraKnownMarketplaces.actigence-skills.autoUpdate` 와 PC별 `plugins/known_marketplaces.json`) 모든 플러그인을 설치·활성화합니다. 같은 이름의 개인 복사본(`~/.claude/skills/<이름>`)은 두 번 로드되지 않게 `~/.claude/skill-backups/` 로 옮깁니다. 다시 실행해도 바뀐 것이 없으면 아무것도 쓰지 않습니다. 그 뒤로는 대화형 Claude Code 세션에서 첫 메시지를 보내고 최대 10분 안에 새 판을 받고, 다음 실행(또는 `/reload-plugins`)부터 적용됩니다. 일부만 설치하는 명령은 [docs/INSTALL.md](docs/INSTALL.md) 0번에 있습니다(한 줄 명령 뒤에 옵션을 그냥 붙이면 동작하지 않습니다).

자동으로 되지 않는 것:

- 저장소에 새 플러그인이 추가된 경우: 스크립트를 한 번 더 실행해야 켜집니다(새 프롬프트 카드는 `actigence-prompts` 안에 들어오므로 해당 없음).
- `claude plugin marketplace add yonghot/actigence-skills` 를 손으로 다시 실행한 경우: settings.json 의 `autoUpdate` 가 지워집니다(2026-11-22 실측). 스크립트를 다시 실행하세요.
- `claude -p` 같은 비대화형 실행, `DISABLE_AUTOUPDATER`·`DISABLE_UPDATES`·`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 를 켠 환경.
- claude.ai·데스크톱 zip 업로드와 수동 복사본.

## 프롬프트 카드

ACTIGENCE 사이트의 프롬프트 카드 전부가 [prompts/](prompts/README.md) 에 있습니다. GitHub Actions(`sync-prompts`)가 3시간마다 사이트에서 카드를 받아 오고, 바뀐 카드가 있으면(본문·버전·제목·분류·설명·날짜 무엇이든) 플러그인 버전을 올려 커밋합니다. 그래서 자동 업데이트를 켠 PC 는 보통 몇 시간 안에 사이트 카드를 따라갑니다. 카드 삭제, 한 번에 5장 이상 변경, 절반 넘게 줄어든 카드, 형식이 깨진 카드, 검증 실패는 바로 반영하지 않고 "sync-prompts: change held for review" 이슈로 멈춰 사람이 확인합니다.

- Claude Code: `actigence-prompts` 플러그인의 `/actigence-prompts:<카드 id> 작업 요청`. 목록은 `/actigence-prompts:actigence-prompts`. 자동으로 발동하지 않고 명령으로만 씁니다.
- 그 밖의 도구·계정: [prompts/README.md](prompts/README.md) 표의 "원문" 링크(항상 최신판)를 복사해 붙여 넣습니다.
- 카드와 짝인 스킬(`oneshot-prototyping`, `fullstack-feature`, `seo-aeo-geo`)의 `references/prompt.md` 도 같은 동기화가 맞춥니다. `debug-rootcause` 는 카드보다 앞선 판이라 카드가 바뀌면 이슈로 알리고 손으로 합칩니다.

## 스킬 목록

<!-- skills-table:start -->
| 스킬 | 용도 | 주요 트리거 | 의존성 | 카드 연동 | 버전 |
|---|---|---|---|---|---|
| `gmp` | 프롬프트·스킬 설계·개선 | 프롬프트 변환, 메타 프롬프트, GMP, 스킬 설계 | 없음 | 없음 | 2.7.0 |
| `factcheck` | 문서 7축 팩트체크, 개선본 .md | 팩트체크, 사실 확인, 제출 전 오류 점검 | 웹 검색·열람 도구 권장(없으면 등급 상한 C, [미확인] 표시) | 없음 | 1.1.0 |
| `infographic` | 일반 문서 인쇄용 인포그래픽 HTML | 인포그래픽, 도식화 | 헤드리스 브라우저는 선택(없으면 텍스트 점검) | 없음 | 1.0.0 |
| `gov-doc-infographic` | 정부지원 제출 문서 전체·개요 셀 인포그래픽 | 제출 문서 인포그래픽·도식화 | 헤드리스 브라우저는 선택 | 없음 | 1.2.0 |
| `gov-startup-bizplan` | 정부지원사업 사업계획서 .docx 작성 | 사업계획서, 정부지원사업, 예비·초기창업패키지, TIPS | python-docx, lxml, 웹 검색 권장, .hwpx 변환은 외부 hwpx 스킬(수동, 선택) | 없음 | 1.0.0 |
| `paper-quality-enhancer` | 논문 원고 개선·심사 시뮬레이션 | 논문 개선·고도화, 투고 전 검토, Reviewer 2 | 웹 검색 권장, mammoth 선택 | 없음 | 1.1.0 |
| `session-handoff` | 세션 핸드오프 문서 | 핸드오프, 세션 이관 | 없음 | 없음 | 1.1.0 |
| `matjip-scout` | 근본 맛집 교차검증 리포트 | 맛집 추천·선정 | 웹 검색·열람 도구 필요 | 없음 | 1.1.0 |
| `business-case` | 사업 타당성 정량 분석 | 사업성, 시장성, CAC·LTV, 유닛 이코노믹스 | 웹 검색 권장, Python 표준 라이브러리 | 없음 | 1.1.0 |
| `contract-review` | 서명 전 계약서 검토, A4 1쪽 요약 | 「계약서 검토」 문구 | pymupdf, python-docx, Chrome·Edge(PDF 내보내기), .hwpx 는 외부 hwpx 스킬(선택). 계약서 본문은 공개 세션에 붙여 넣지 말 것 | 없음 | 1.0.2 |
| `fullstack-feature` | 기능 1개를 전 계층에 추가 | 풀스택 + 구현 두 단어 모두 | git 저장소와 배포·DB 접근. 자율 배포 경고 참고 | dev-merged-4 v1.12 (exact) | 1.0.0 |
| `debug-rootcause` | 근본 원인 추적·회귀 테스트 | 디버깅 단어 | git 저장소와 테스트 도구. 자율 배포 경고 참고 | dev-merged-5 v1.11 (ahead-of-card) | 1.0.0 |
| `seo-aeo-geo` | 운영 사이트 SEO·AEO·GEO 적용, PR 마감 | SEO 단어 | git 저장소, 빌드 가능한 사이트 | setup-seo-aeo-geo v1.14 (exact) | 1.0.0 |
| `oneshot-prototyping` | PRD 하나로 빈 폴더에서 production 배포까지(게이트 4단 자율 반복) | 「프로토타이핑」 단어 + PRD 첨부(또는 폴더에 PRD 파일) | git·Node, 배포 CLI(예: vercel), gcloud 선택(구글 시트 프로비저닝), playwright 선택(실측 디자인 게이트), 이미지 도구 선택. 자율 배포 경고 참고 | setup-fullstack-prototype v2.2 (exact) | 2.2.0 |
| `prd-vibecoding` | 아이템 설명에서 바이브코딩용 PRD.md 작성 | PRD 만들어줘·작성해줘, 바이브코딩 PRD·사양서, write a PRD | Node 선택(PRD 린터) | 없음 | 4.3.0 |
| `actigence-prompts` | 프롬프트 카드 전체를 명령으로 실행 | 자동 발동 없음 — `/actigence-prompts:<카드 id>` | 카드마다 다름(각 카드 본문 참고) | 사이트 카드 전체(자동 동기화) | 1.0.0 |

`prd-vibecoding` 으로 PRD 를 만들고 `oneshot-prototyping` 으로 그 PRD 를 배포까지 끌고 가는 한 쌍입니다(PRD 의 `## Ralph Loop` 섹션이 둘 사이의 계약).

짝 스킬: `infographic` ↔ `gov-doc-infographic`, `factcheck` ↔ `paper-quality-enhancer`, `gov-startup-bizplan` ↔ `business-case`. 서로의 제외 대상이므로 둘 다 설치해 두면 요청에 맞는 쪽만 반응합니다. 문서 종류가 불분명한 사업계획서 인포그래픽 요청은 제출용인지 먼저 확인하세요. `session-handoff` 는 다른 세션으로 작업을 넘길 때 쓰며 PROGRESS.md 갱신이나 다른 핸드오프·컨텍스트 저장 스킬(handoff-doc, context-save)을 대체하지 않습니다. 같은 요청에 여러 개가 반응하면 쓰지 않을 쪽을 끄세요.
<!-- skills-table:end -->

## 설치

자세한 절차는 [docs/INSTALL.md](docs/INSTALL.md) 에 있습니다.

1. Claude Code 플러그인 마켓플레이스 (권장): 위 "빠른 시작" 스크립트가 아래 과정을 대신 하고 자동 업데이트까지 켭니다. 직접 하려면

   ```
   claude plugin marketplace add yonghot/actigence-skills
   claude plugin install <스킬이름>@actigence-skills
   ```

   그다음 `/plugin` → Marketplaces → `actigence-skills` 에서 자동 업데이트를 켭니다(제3자 마켓플레이스는 기본이 꺼짐).

2. claude.ai·데스크톱 앱: [Releases](https://github.com/yonghot/actigence-skills/releases) 에서 스킬별 zip(`<스킬이름>-<버전>.zip`)을 받아 Customize > Skills 에서 업로드합니다. 프롬프트 카드는 스킬이 아니라 `actigence-prompt-cards-<버전>.zip`(카드별 `.md` + `index.json`) 한 묶음입니다. 올린 zip 은 새 판이 나와도 바뀌지 않으니 릴리스가 나오면 다시 올리세요. 마켓플레이스 추가 화면으로 설치하는 경로와 GitHub 저장소 약칭(`yonghot/actigence-skills`)으로 추가하는 경로, claude.ai zip 업로드는 공개 후 시험 전이라 확인되지 않았습니다.

3. 수동 설치: 저장소를 받은 뒤 `bash scripts/install.sh --all` 또는 `powershell -ExecutionPolicy Bypass -File scripts\install.ps1 --all` 을 실행합니다. `--list` 로 이미 설치된 상태를 먼저 볼 수 있습니다.

## 중복 트리거와 백업

같은 스킬이 두 경로로 설치되면 설명이 두 번 로드되어 같은 요청에 두 번 반응할 수 있습니다.

- 플러그인으로 설치한 스킬은 개인 폴더(`~/.claude/skills/<이름>`)에 같은 이름의 복사본이 있어도 둘 다 스킬 목록에 올라옵니다(한 PC 에서 관찰, 공식 문서에 명시된 동작은 아님). 플러그인 설치 후 개인 복사본은 지우세요.
- claude.ai 에 올린 스킬은 같은 계정으로 로그인한 Claude Code 에 `~/.claude/skills/synced/<계정 폴더>/<이름>` 으로 동기화됩니다(관찰). 같은 스킬을 플러그인으로 쓰려면 claude.ai 쪽 업로드를 끄세요.
- 설치 스크립트는 `synced/` 복사본과 플러그인 설치본을 찾으면 경고하고 건너뜁니다(`--force` 로 무시 가능).
- 같은 이름의 폴더가 이미 있으면 스킬 폴더 밖의 `~/.claude/skill-backups/<이름>-<시각>/` 으로 옮긴 뒤 설치합니다. 이 스크립트가 설치한 폴더에는 `.installed-by-actigence-skills` 표식 파일이 들어가며, `--uninstall` 은 표식이 있는 폴더만 지웁니다.

## 스킬별 요구 사항

스킬마다 필요한 것이 다릅니다. 정확한 내용은 각 스킬의 `SKILL.md` 와 `plugins/<이름>/` 에 있습니다.

- Python 패키지: 스크립트가 있는 스킬은 첫 실행에서 설치 안내를 한 줄로 출력합니다. 설치는 `python3 -m pip install <패키지>`(Windows 는 `python`) 입니다.
- 웹 검색·열람 도구: 사실 확인이 필요한 스킬은 도구가 없으면 그 사실을 밝히고 확인하지 못한 내용을 `[미확인]` 으로 표시합니다.
- 파일 접근이 가능한 에이전트 환경(작업 폴더에 파일 저장)이 필요한 스킬이 있습니다. 규칙은 [docs/PORTABILITY.md](docs/PORTABILITY.md) 에 있습니다.

## 경고: 자율 배포

`oneshot-prototyping` 은 확인 질문 없이 production 배포까지 가고, gcloud 에 로그인돼 있으면 GCP 프로젝트·서비스 계정·구글 시트를 만들어 연결합니다. 배포를 원하지 않으면 PRD 의 `## Ralph Loop` → `### 자율성 강도` 에서 production 배포 모드를 `DRY-RUN` 으로, 시트를 원하지 않으면 `### 데이터 저장소` 의 저장소를 `file` 또는 `none` 으로 적으세요.

`fullstack-feature` 와 `debug-rootcause` 는 사용자의 요청 범위 안에서 프로덕션 배포와 공유 DB 마이그레이션까지 자율로 수행하도록 설계된 스킬입니다. 이런 일을 원하지 않으면 요청에 "배포하지 말 것", "공유·운영 DB 는 건드리지 말 것" 이라고 명시하세요. 두 스킬은 그 경우 해당 단계를 건너뜁니다. 처음 쓸 때는 테스트 저장소에서 시험해 보기를 권합니다.

## 버전

- 버전의 단일 출처는 각 `plugins/<이름>/.claude-plugin/plugin.json` 의 `version`(semver)입니다. SKILL.md 앞부분에는 `name` 과 `description` 만 둡니다.
- Claude Code 는 버전이 바뀐 플러그인만 다시 받습니다. 스킬 파일을 고치면 같은 커밋에서 `plugin.json` 버전을 올리고 `docs/changelog/<이름>.md` 맨 위에 그 버전을 적고 README 표의 버전 칸을 맞추세요. 버전을 안 올린 수정은 어느 PC 에도 전달되지 않으므로 CI(`scripts/check-bumps.mjs`)가 실패시키고, 세 곳의 버전이 어긋나면 `validate.mjs` 가 실패시킵니다.
- 스킬별 변경 내역은 `docs/changelog/<이름>.md` 에 있습니다.
- 릴리스 태그는 `vYYYY.MM.DD` 이고, 태그가 올라가면 CI 가 스킬별 zip 을 빌드해 릴리스에 첨부합니다.
- 프롬프트 카드와 짝을 이루는 스킬은 `docs/card-hashes.json` 으로 `references/prompt.md` 의 변경을 감시합니다. 카드보다 앞선 사본은 `ahead-of-card` 로 표시됩니다.

## 기여와 검증

```
node scripts/validate.mjs
node scripts/check-bumps.mjs origin/main
node scripts/scan.mjs
node scripts/build-zips.mjs
```

Node 22 이상이 필요하고 외부 패키지는 쓰지 않습니다. `scan.mjs` 는 비밀 값·개인정보·사용자 경로를 찾습니다. 개인 문자열 차단 목록은 로컬 파일 `scripts/.scan-blocklist.local` 에 두며 저장소에는 올라가지 않습니다.

## 서드파티 안내

HWPX 스킬(`hwpx`)은 이 저장소에 포함되어 있지 않습니다. 제3자 저작물이며 라이선스가 확인되지 않았기 때문입니다. 한글(HWPX) 문서가 필요한 스킬은 이를 선택적 외부 스킬로만 언급하며, 필요하면 원 저장소 [Canine89/hwpxskill](https://github.com/Canine89/hwpxskill) 를 직접 확인하세요.

## 라이선스

MIT. 저작권 표기는 [LICENSE](LICENSE) 를 보세요.
