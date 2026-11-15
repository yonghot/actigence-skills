# 설치 안내

세 가지 경로가 있습니다. 같은 스킬을 두 경로로 중복 설치하지 마세요(README 의 "중복 트리거와 백업" 참고).

## 1. Claude Code 플러그인 마켓플레이스

스킬 하나가 플러그인 하나입니다. 필요한 것만 골라 설치하면 설명이 매 턴 컨텍스트에 올라가는 비용을 아낄 수 있습니다.

```
claude plugin marketplace add yonghot/actigence-skills
claude plugin install gmp@actigence-skills
```

저장소 약칭(`yonghot/actigence-skills`)으로 추가하는 경로와 claude.ai zip 업로드는 첫 공개 뒤에 시험하기 전까지 확인되지 않았습니다. 로컬 폴더 경로로 추가하는 방식만 확인했습니다.

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

플러그인별 토큰 비용은 `claude plugin details gmp@actigence-skills` 로 볼 수 있습니다. 제3자 마켓플레이스는 자동 업데이트가 기본으로 꺼져 있으니 `/plugin` 에서 켜거나 위 명령을 직접 실행하세요.

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
