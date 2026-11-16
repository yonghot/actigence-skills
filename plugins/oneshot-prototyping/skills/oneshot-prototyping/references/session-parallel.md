# 하위세션 병렬 프로토콜 (session-parallel) v2.0

카드(`prompt.md`)의 PARALLEL_EXECUTION 이 규칙의 정본이다. 이 문서는 하위세션 워커 절차만 담는다.

## 1. 적용 조건

아래 셋이 모두 참일 때만 적용한다. 하나라도 아니면 N/A 이고 카드의 서브에이전트 구성으로 진행한다. 차단 사유가 아니다.

1. `start_session` 이 이 실행에 있다(이름만 보이면 ToolSearch 로 `select:mcp__ccd_session__start_session`). CLI·헤드리스에는 없다.
2. `feature_list.json` 기능이 10개 이상이다.
3. 쓰기 경로가 겹치지 않는 독립 슬라이스가 3개 이상으로 잘린다.

- 하위세션은 PREPARING 에서만 쓴다. 이후 모드는 서브에이전트와 오케스트레이터가 한다.
- 세션 시작이 거부되면 같은 허용 경로의 서브에이전트로 넘기고 한 줄 알린다.
- 이 스킬 호출이 시작의 승인이므로 `initiation: "user_asked"` 로 시작한다. 호스트가 이를 거부하거나 제안 카드에서 멈추면(`own_initiative` 로 바꾸지 않는다) 서브에이전트로 진행하고 FIX_PLAN 에 `가정:` 한 줄을 남긴다.
- 메시지는 오케스트레이터를 거치고 첫 줄에 파일·심볼과 하려는 변경을 쓰고, 답이 필요할 때만 맨 앞에 `[답 필요]` 를 붙인다.

## 2. 시작 전 선행 조건

Plan Contract·`feature_list.json`, 스키마·DAL 인터페이스·`demo-mock`, 토큰(`verify:tokens` 녹색)·UI 킷, 라우트 지도·소유 지도·조각 파일 타입이 체크포인트로 커밋된 뒤에 띄운다.

## 3. 슬라이스 컷과 소유 지도

- 기능을 라우트 묶음 기준으로 3~5개 슬라이스로 자른다. 한 기능은 한 슬라이스에만 속한다.
- 슬라이스마다 쓰기 허용 경로를 적는다: 라우트·전용 컴포넌트·전용 테스트 디렉터리, `src/features/<slice>/`, 보고 파일 `smoke-results/sessions/<slice>-r*.md`. 겹치면 다시 자른다(경로당 작성자 1명).
- 공유 표면(`package.json`·잠금파일·설정, 전역 CSS·토큰·UI 킷, DAL·스키마·`fixtures/**`, `public/**`, 내비·루트 레이아웃·진입 화면, `design/**`·`scripts/**`·상태 문서)은 슬라이스 세션이 쓰지 않는다. 카드 Concurrency map 의 소유자만 쓰고, 소유자가 적히지 않은 표면(내비·루트 레이아웃·전역 CSS·설정)은 오케스트레이터가 쓴다.
- 내비·진입 화면에 한 줄씩 보태는 일은 조각 파일(`src/features/<slice>/manifest.ts`)로 내고 오케스트레이터가 모은다.
- 소유 지도는 `FULLSTACK_FIX_PLAN.md` 의 "하위세션 지도" 표에 적는다. 열: 슬라이스 · 세션 이름 · 세션 id · 기능 ID · 쓰기 허용 경로 · 상태 · 마지막 보고 경로. 프로젝트 `CLAUDE.md` 머리에 "하위세션 병렬 적용 중: FIX_PLAN 의 '하위세션 지도' 참조" 한 줄을 적는다.

## 4. start_session 인자

슬라이스 전부를 한 메시지에서 띄우고 반환된 세션 id 를 소유 지도에 적는다.

- `initiation: "user_asked"`, `context: "fresh"`(`background` 80자 이상)
- `use_worktree: false` (충돌은 경로 분리로 막는다)
- `model`: 항상 명시한다(생략하면 오케스트레이터 모델을 물려받는다). 별칭 `sonnet` 을 받으면 별칭, 아니면 환경이 알려 준 최신 Sonnet id(지어내지 않는다).
- `name`: 슬라이스 이름(소문자·숫자·하이픈, 24자 이하)
- `wake_when_done: true`
- `permission_mode`: 생략(오케스트레이터의 모드를 물려받는다)

`prompt`(브리프)는 카드의 7항목 브리프 계약을 채운다. 하위세션은 이 대화를 보지 못하므로 `PRD.md`·Plan Contract·`design/principles.md`·`design/required.md`·`design/forbidden.md`·DAL 모듈은 요약하지 않고 절대 경로와 심볼로 인용한다. 오케스트레이터 세션 id, dev 서버 주소, 소유 지도 전체도 넣는다.

### 워커 브리프 블록 (브리프에 그대로 붙인다)

- 쓰기는 자기 허용 경로 안에서만 한다.
- git 은 `git --no-optional-locks` 로 `status`·`diff`·`log`·`show` 만 쓴다. 커밋하지 않는다.
- 빌드하지 않는다(`pnpm build`·`vercel`·배포 금지). dev 서버를 띄우지 않고 브리프의 dev 서버 주소를 `curl` 로 읽는다.
- 브라우저를 열지 않는다. 브라우저에서만 확인되는 것은 `unknowns` 에 `브라우저 미검증: <기능 ID>` 로 적는다.
- `package.json`·잠금파일을 고치거나 패키지를 설치하지 않는다. 의존성·이미지 생성·시드·UI 킷·토큰 변경은 메시지로 요청만 한다.
- 검증은 자기 경로에 한정한다(`pnpm vitest run <테스트>`, `pnpm eslint <경로>`, `pnpm exec tsc --noEmit --incremental false`). 남의 경로 오류는 보고에만 적는다.
- 로그인·자격증명·외부 호출을 만들지 않는다. 이미지는 슬롯 ID 로 참조한다.
- UI 킷과 카드 DESIGN_ELEVATION "Uplift from the first pass"·design-recipes "Screen recipes" 를 첫 패스부터 따르고 `design/required.md`·`forbidden.md` 의 마커를 지킨다.
- 서브에이전트는 3개 이하(`model` 명시). 다른 세션을 띄우지 않는다.
- 막히면 오케스트레이터에게 `SendMessage` 하고 막히지 않은 기능부터 계속한다. 계약 수정·범위 확장·빈칸 추측 금지.
- 턴 종료 전에 보고 파일을 쓴다. 스키마는 카드의 반환 스키마(`status`·`scope`·`findings`·`commands`·`writes`·`artifact`·`unknowns`)다. 마지막 메시지 첫 줄에 `status` 와 보고 경로를 적는다. `writes` 를 `git status --short` 와 대조해 허용 경로 밖 변경이 있으면 되돌리지 말고 보고에 적는다.

## 5. WAIT 와 통합

- 하위세션이 일하는 동안 턴을 끝낼 수 있는지는 카드 NON_STOP 의 invariant 5 가 정한다. 양보 직전과 재개 직후에 `list_sessions` 의 `linked: true` 로 상태를 확인하고 waiting 인 세션을 §6 으로 먼저 처리한다. 그 조건 밖에서는 읽지 않는 경로의 일을 하거나 한도 있는 폴링으로 기다린다.
- 세션이 턴을 끝내면 `git diff --name-only` 를 소유 지도에 대조하고(지도 밖 파일은 격리) 보고에 적힌 명령을 직접 다시 돌린다. 조각 통합 → 전체 lint·typecheck·test·build(빌드 전 dev 서버를 내린다) → 체크포인트 커밋 순이다.
- 게이트 1 판정·DESIGNING 진입 조건은 카드 PARALLEL_EXECUTION "Workers and loading" 이 정한다. 확인은 `list_sessions` 의 `linked: true` 로 한다.

## 6. FIX 와 장애 처리

- **FIX 배정**: 그 슬라이스 세션이 일하는 중(busy)이면 메시지로 보낸다. 이미 턴을 끝냈으면(idle) 메시지로 깨워 파일 수정을 맡기지 않고, 같은 슬라이스·같은 허용 경로로 후속 하위세션을 새로 띄운다. 브리프에 이전 보고와 FIX 목록을 인용하고 소유 지도의 행을 새 세션 id 로 바꾼다. FIX 가 3건 이하이고 한 디스패치로 끝나면 같은 허용 경로의 서브에이전트가 처리한다.
- **계약 변경**: 일하는 전 세션에 `[답 필요]` 로 쓰기 일시 중지를 보낸다 → 전원의 멈춤 응답을 받는다(응답 없이 턴을 끝낸 세션은 멈춘 것) → 계약과 기계적 사용처를 오케스트레이터가 고쳐 커밋한다 → 바뀐 심볼을 공지하고 재개시킨다.
- **멈춘 세션**: 권한 프롬프트·질문에서 멈춰 있으면(waiting) 대신 답하지 않는다. 그 슬라이스에 기대지 않는 일을 먼저 하고, 다른 일이 끝났는데도 멈춰 있으면 `stop_session` 으로 멈춘 것을 확인한 뒤 소유를 회수해 서브에이전트로 진행한다. 멈추지 못하면 그 슬라이스만 보류한다.
- **실패**: 그 슬라이스만 격리하고 브리프를 조여 후속 세션(거부되면 서브에이전트)으로 다시 보낸다. 2~3회 실패하면 소유를 회수해 직접 하거나 서브에이전트로 더 잘게 나눈다.
- 종료 시 HANDOVER.md 에 하위세션 목록(이름·id·슬라이스·마지막 보고 경로)을 적는다.
