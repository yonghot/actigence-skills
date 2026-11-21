# 설치 안내

세 가지 경로가 있습니다. 같은 스킬을 두 경로로 중복 설치하지 마세요(README 의 "중복 트리거와 백업" 참고). 늘 최신판을 쓰려면 1번 경로에서 자동 업데이트를 켜야 합니다. zip 업로드와 수동 복사는 새 판이 나와도 저절로 바뀌지 않습니다.

## 0. 한 번에 설정 (권장)

```powershell
# Windows PowerShell 5.1 / 7
irm https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.ps1 | iex
# 일부만: & ([scriptblock]::Create((irm https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.ps1))) -Skills gmp,factcheck
```

```bash
# macOS, Linux, Git Bash
curl -fsSL https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.sh | bash
# 일부만: curl -fsSL https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.sh | bash -s -- --skills gmp,factcheck
```

하는 일:

1. 같은 이름의 개인 복사본(`~/.claude/skills/<이름>`)을 `~/.claude/skill-backups/<이름>-<시각>/` 으로 옮깁니다(`-KeepPersonalCopies` / `--keep-personal-copies` 로 끔). claude.ai 에서 동기화된 사본(`skills/synced/<이름>`)이 있으면 경고만 합니다.
2. `claude` 명령이 있으면 마켓플레이스를 추가하고 설치되지 않은 플러그인을 설치합니다. 없으면 다음 세션 시작 때 Claude Code 가 설정을 보고 내려받습니다.
3. `~/.claude/settings.json`(또는 `CLAUDE_CONFIG_DIR`)에 `extraKnownMarketplaces.actigence-skills` 를 `autoUpdate: true` 로 넣고 플러그인을 `enabledPlugins` 에 켭니다. 전에 직접 끈 플러그인은 그대로 둡니다. 원래 파일은 `settings.json.backup-<시각>` 으로 남깁니다.

자동 업데이트는 대화형 세션에서 첫 메시지를 보낸 뒤 최대 10분 안에 돌고, 받은 새 판은 다음 실행(또는 `/reload-plugins`)부터 적용됩니다. `DISABLE_AUTOUPDATER`·`DISABLE_UPDATES`·`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC` 를 켠 환경에서는 돌지 않습니다(`FORCE_AUTOUPDATE_PLUGINS=1` 로 되살림). 저장소에 새 플러그인이 추가되면 스크립트를 한 번 더 실행해야 켜집니다. 새 프롬프트 카드는 `actigence-prompts` 안에 들어오므로 다시 실행할 필요가 없습니다.

## 1. Claude Code 플러그인 마켓플레이스

스킬 하나가 플러그인 하나입니다. 필요한 것만 골라 설치하면 설명이 매 턴 컨텍스트에 올라가는 비용을 아낄 수 있습니다.

```
claude plugin marketplace add yonghot/actigence-skills
claude plugin install gmp@actigence-skills
```

저장소 약칭(`yonghot/actigence-skills`)으로 추가·설치하는 경로는 2026-11-16 에 확인했습니다. claude.ai zip 업로드는 아직 시험하지 않았습니다.

모든 사용자에게 적용되는 것이 기본(`--scope user`)입니다. 팀 저장소에만 적용하려면 `--scope project` 를 붙입니다.

한 번에 여러 개를 설치하려면 반복문을 씁니다.

```
# bash (macOS, Linux, Git Bash)
for p in gmp factcheck infographic; do claude plugin install "$p@actigence-skills"; done

# PowerShell
foreach ($p in 'gmp','factcheck','infographic') { claude plugin install "$p@actigence-skills" }
```

업데이트(적용하려면 Claude Code 를 다시 시작합니다):

```
claude plugin marketplace update actigence-skills
claude plugin update gmp@actigence-skills
```

플러그인별 토큰 비용은 `claude plugin details gmp@actigence-skills` 로 볼 수 있습니다. 제3자 마켓플레이스는 자동 업데이트가 기본으로 꺼져 있으니 0번 스크립트를 쓰거나 `/plugin` 에서 켜세요.

저장소 개발자는 `claude plugin validate <저장소 경로>` 로 마켓플레이스 형식을 확인할 수 있습니다.

## 2. claude.ai·데스크톱 앱

1. [Releases](https://github.com/yonghot/actigence-skills/releases) 에서 `<스킬이름>-<버전>.zip` 을 받습니다. zip 최상위는 스킬 이름과 같은 폴더입니다.
2. Customize > Skills 에서 Upload a skill 로 올립니다. 코드 실행과 파일 생성 기능이 켜져 있어야 합니다.
3. 이 업로드 경로는 공개 후 시험 전이라 확인되지 않았습니다. 웹 업로드는 SKILL.md 앞부분에 `name` 과 `description` 외의 키가 있으면 오류가 납니다. 이 저장소의 스킬은 그 두 키만 씁니다.

참고

- 같은 계정으로 로그인한 Claude Code 는 올린 스킬을 `~/.claude/skills/synced/` 로 동기화합니다. 이 스킬을 플러그인으로 또 설치하지 마세요.
- Customize 의 Add marketplace 화면에 저장소 주소를 넣는 방법은 확인되지 않았습니다(unverified). 동작하면 편하지만, 확실한 경로는 zip 업로드입니다.

## 3. 수동 설치 스크립트

저장소를 받은 뒤(또는 Releases 의 zip 을 풀고 `--source` 로 지정) 실행합니다.

```
git clone https://github.com/yonghot/actigence-skills.git
cd actigence-skills
bash scripts/install.sh --list
bash scripts/install.sh --skills gmp,factcheck
bash scripts/install.sh --all
```

Windows PowerShell 5.1 과 PowerShell 7 모두 같은 옵션을 씁니다.

```
powershell -ExecutionPolicy Bypass -File scripts\install.ps1 --list
powershell -ExecutionPolicy Bypass -File scripts\install.ps1 --skills gmp,factcheck
```

| 옵션 | 뜻 |
| --- | --- |
| `--list` | 사용 가능한 스킬과, 각각이 개인 폴더·synced·플러그인 중 어디에 이미 있는지 표시 |
| `--all` / `--skills a,b` | 설치 대상 |
| `--target DIR` | 설치할 스킬 폴더. 기본은 `~/.claude/skills` (Windows 는 `%USERPROFILE%\.claude\skills`) |
| `--source DIR` | 저장소 루트 또는 풀어 둔 스킬 폴더 모음 |
| `--uninstall` | 이 스크립트의 표식 파일(`.installed-by-actigence-skills`)이 있는 폴더만 삭제 |
| `--dry-run` | 실행하지 않고 계획만 출력 |
| `--force` | synced·플러그인 복사본이 있어도 설치 |

같은 이름의 폴더가 이미 있으면 `~/.claude/skill-backups/<이름>-<시각>/` 으로 옮깁니다. 백업은 스킬 폴더 밖에 두므로 스킬로 로드되지 않습니다. Python 스크립트가 있는 스킬은 설치 뒤 필요한 패키지를 `python3 -m pip install <패키지>`(없으면 `python`) 로 설치하라는 안내만 출력하고 자동 설치하지 않습니다.
