# image-recipes

브랜드 에셋과 이미지 생성 레시피. 상한·비용·호출 주체 규칙은 카드(DESIGN_ELEVATION)에 있다. 생성 호출은 오케스트레이터만 한다. Brand assets 절은 UI 를 만들 때마다, Image recipe 절은 호스트 매트릭스에 이미지 도구가 있을 때만 읽는다.

## Brand assets

### 탐색 순서
1. PRD·채팅에 적힌 경로·폴더·URL
2. 프로젝트의 `public/`, `assets/`, `brand/`, `static/`
3. 상위 폴더에서 이름에 `brand`, `kit`, `asset`, `design` 이 든 폴더(깊이 2)
4. 같은 브랜드의 다른 프로젝트 폴더의 로고·캐릭터(`public/brand`, `public/mascot`). 그 서비스의 사진·히어로·일러스트는 가져오지 않는다(같은 오너의 서비스와 똑같아 보이지 않게).
5. 웹 다운로드는 사용자·PRD 가 출처를 명시해 승인한 경우만. 승인 문구를 brand-pack 에 인용한다. 검색으로 찾은 타사 에셋은 쓰지 않는다.

탐색 경로와 결과를 brand-pack 에 적는다.

### 사용 범위
- 킷 README·라이선스의 사용 범위 조항을 brand-pack 에 옮기고, 승인 범위 밖 프로젝트에는 쓰지 않는다.
- 로고·캐릭터를 새로 그리거나 변형·합성하지 않는다(색·비율 변형 포함).
- 라이선스·사용 승인 문구가 없거나 이 프로젝트가 승인 범위인지 확인되지 않은 에셋은 쓰지 않고 "에셋 없을 때"로 처리한다.
- 탐색 4번 에셋은 PRD·채팅·킷 README 가 이 프로젝트에서 써도 된다고 적은 경우만 쓰고, 그 문구를 brand-pack 에 그대로 인용한다.

### 배치 최소치 (에셋이 있을 때)
- 로고: 헤더, 푸터, 히어로의 "○○이 함께하는" 칩. 협력 로고는 흰 칩에 담아 관련 카드 위에 둔다.
- 캐릭터: 메인 히어로 1, 섹션 히어로 묶음마다 1, 빈 상태·완료·선정 안내·알림 배너·푸터, 사진 없는 카드의 캐릭터 썸네일, 모바일 추천 버튼·아바타.
- 브랜드 질감: 히어로 1, 다크 밴드·푸터.
- 협력·제휴 로고는 PRD 가 제휴를 명시하고 로고 파일이 오너가 제공·승인한 킷에 있을 때만. 아니면 칩을 만들지 않는다. 타사 로고를 그리거나 내려받지 않는다.

### 에셋 없을 때
- 로고 원본이 없으면 PRD 제품명으로 텍스트 워드마크(SVG 또는 웹폰트, 브랜드 토큰 색, `data-brand-asset="logo"`)를 헤더·푸터·파비콘에 쓴다. 기존 브랜드 로고를 흉내 내지 않는다.
- 빈자리는 생성 이미지, 코드 일러스트, 패턴으로 채운다. 캐릭터·실존 브랜드 로고를 지어내지 않는다.
- 로고 검사는 항상 적용하고 홈 브랜드 에셋 수·히어로 캐릭터 검사만 N/A 로 두려면(`brandAssetPatterns`·`characterPatterns` 비움) 탐색 경로와 결과가 brand-pack 에 있어야 한다.

## Image recipe

### 도구 점검 (부트스트랩, 호스트 표를 읽는다)
1. 호출 순서는 카드 호스트 매트릭스의 사슬(Higgsfield → codex → 이미지 MCP)이다. 도구마다 상태를 따로 점검해 기록한다(Higgsfield CLI 의 `higgsfield account status` 와 MCP `generate_image`, codex, 다른 이미지 MCP). 사슬에서 처음 connected 인 것이 이번 실행의 `imageTool` 이다.
2. codex 실행 파일 탐색: PATH 의 `codex` → Windows `%LOCALAPPDATA%\OpenAI\Codex\bin\*\codex.exe` 중 최신 → `~/.codex/.sandbox-bin/codex.exe`. 찾으면 `codex --version`, `codex login status`. 로그인돼 있으면 connected, 아니면 needs_auth(로그인은 사용자 몫, 설치하지 않는다).
3. 지연 로드 도구는 ToolSearch 로 `higgsfield`, `generate image` 를 검색한 뒤에도 없을 때만 "없음".
4. 도구 이름·상태(connected·needs_auth·none)를 FIX_PLAN `장애 로그` 한 줄에, `uplift-gate.json` 의 `imageTool` 에는 `connected` 또는 `none` 만 쓴다. PRD `경로: LOCAL` 이면 `none`.

### 소스 순서
1. 오너가 제공·승인한 실사 사진
2. 생성 이미지
3. 캐릭터 썸네일(pale 배경, 캐릭터 하단 정렬, 패턴)
4. 코드 일러스트(브랜드 도형·아이콘·패턴 SVG)
5. 아이콘 타일(최후)

최종 빌드에 회색 박스·라벨 슬롯을 남기지 않는다.

### 프롬프트 규칙
- 모든 프롬프트 끝에 같은 아트디렉션 꼬리말을 붙인다. `<STYLE>` 은 PRD Design Context 와 브랜드 톤으로 정해 trend-pack 에 적는다.
  ```
  <STYLE>, <brand color> accents, <domain> <audience>, no text, no logos, no watermark, no off-brand color cast, no heavy filter
  ```
  - 서비스업·현장: `photorealistic editorial photograph, natural daylight, warm neutral palette, 35mm, shallow depth of field, candid`
  - 그 밖(개발 도구, SaaS, 어린이·게임 등): 브랜드 일러스트·3D·추상 중 하나를 골라 같은 꼬리말로 고정
- 장면(사실적 사진): 대상 사용자층이 실제 현장에서 일하는 모습. 손·작업·옆모습 위주, 정면 증명사진 구도 금지, 글자·카드가 겹칠 한쪽 1/3 비움.
- 다양성: 슬롯 표 전체에서 대상층의 세대·성별을 고르게(예: 20–30대 창업자부터 중장년).
- 실사감: 카메라 질감·노이즈·자연스러운 비대칭, 광택 피부·과보정·완벽한 대칭·비현실 조명 회피.
- 같은 오너의 다른 서비스 사진과 구도·색감·소품이 겹치지 않는 고유 톤을 정해 trend-pack 에 적는다.
- 글자·실존 인물 닮음·AI 인물 사용 제한은 카드 "Images and brand assets" 규칙을 따른다. 프롬프트에 시크릿·개인정보·오너 미확정 정보(실주소·연락처)를 넣지 않는다.

### 후처리·검수
- 용량·형식·저장 경로·검수·재생성 한도·출처 기록은 카드 "Images and brand assets" 규칙을 따른다.

### codex CLI
내장 `image_gen` 을 `codex exec` 로 부른다(API 키 없이 로그인 계정 사용). 슬롯 1개에 `codex exec` 1회, `image_gen` 1회, 백그라운드 최대 3개.
- 작업 폴더: 프로젝트 루트 `.imagegen/`(`.gitignore` 에 추가). 원본 PNG(장당 2~3MB)·로그·마지막 메시지를 두고, `public/` 에는 후처리 파일만 둔다.
- 명령(PowerShell, `$codex` 는 점검에서 찾은 실행 파일, `$root` 는 프로젝트 루트 절대 경로):
  ```powershell
  & $codex exec --skip-git-repo-check -s workspace-write -C $root -o "$root\.imagegen\<slot>.txt" "<프롬프트>" *> "$root\.imagegen\<slot>.log"
  ```
  bash: `"$codex" exec --skip-git-repo-check -s workspace-write -C "$root" -o "$root/.imagegen/<slot>.txt" "<프롬프트>" > "$root/.imagegen/<slot>.log" 2>&1`. `-o` 와 로그는 절대 경로.
- 프롬프트 틀(영문 한 문단, 큰따옴표 금지):
  ```
  Generate exactly one image with the built-in image_gen tool (imagegen skill, built-in mode, a single call, no variants). Image prompt: <scene>, <art-direction tail>. Orientation: <landscape | portrait | square>. After the image is generated, copy the generated file from the Codex generated_images folder into ./.imagegen/<slot>.png inside the current working directory. Do not create, edit or delete any other file. Reply with one line containing the absolute source path and the destination path.
  ```
- 성공: 종료 코드 0 이고 `.imagegen/<slot>.png` 존재. 복사가 빠졌으면 `-o` 파일의 원본 경로(`~/.codex/generated_images/<thread>/exec-*.png`)에서 복사. 한 장에 1분 안팎(1536×1024 PNG 2.7MB 실측)이므로 셸 타임아웃 300초 이상 또는 백그라운드.
- 비율: 해상도는 도구가 정하고 슬롯 비율은 CSS `aspect-ratio`+`object-fit:cover` 로 맞춘다. 주제가 잘리면 장면 문구에 주제 위치·여백 방향을 적어 다시 생성한다.
- 변환: 묶음이 끝나면 `.imagegen/<slot>.png` 목록과 슬롯 표를 WebP·AVIF 로 변환해 `public/images/gen/<slot>.webp` 로 두고 슬롯 매핑 경로를 바꾼다(새 의존성은 먼저 추가).
- 실패: 종료 코드 비정상·파일 없음이면 로그 꼬리를 읽는다. 로그인 만료·사용량 한도·내장 도구 부재면 재호출 없이 다음 순위 도구, 없으면 다음 소스로 폴백하고 `imageTool` 을 고친다. 그 밖은 1회만 재호출. `scripts/image_gen.py`(API 키 필요 폴백)는 쓰지 않는다.
- 안전: `-s workspace-write` 고정(`--dangerously-bypass-approvals-and-sandbox`, `danger-full-access` 금지). 호출 전후 `git status --short` 를 비교해 `.imagegen/` 밖 새 변경 중 하위세션 쓰기 허용 경로와 오케스트레이터 자신의 작업에 속하지 않는 파일만 codex 산출물로 보고 되돌린 뒤 장애 로그에 남긴다. 판단이 서지 않는 변경과 하위세션·피어 세션 변경은 로그에만 남긴다.

### 경로 H·L 과 잇기
- 목업·레퍼런스 에셋은 카드 D2~D3 를 따른다(경로 H: `design/assets/higgsfield/`+`manifest.json`, 경로 L: 코드 이미지).
- 슬롯 래스터(`public/images/gen/`)는 카드 호스트 매트릭스 사슬의 도구로 만들고, 없으면 코드 일러스트로 간다.
- 슬롯 매핑 모듈(ContentWriter 소유)은 처음엔 폴백(코드 일러스트)을 가리켜 깨진 이미지가 없게 하고, 생성 파일이 들어오면 경로를 바꾼다.
- PREPARING 에서 codex 가 채운 슬롯은 D2 에셋 목록에서 뺀다. 목업이 그 파일을 쓰면 `manifest.json` 에 `model: codex-image_gen`, 크레딧 0, 프롬프트와 사용 위치를 올린다. 목록이 비면 경로 L(사유 "에셋 목록 없음").
- 경로 H 에셋은 D5 에서 `public/images/gen/<slot>.<확장자>` 로 복사하고 슬롯 매핑을 바꾼다. 같은 슬롯을 두 번 생성하지 않고 후처리는 사본에만 한다. 경로 L 이어도 codex 슬롯 에셋은 남고 R18 로 센다.
- 영상은 경로 H 브리프에 있을 때만 카드 D3 대로 만든다.

## Slot table

brand-pack 에 쓴다. 각 행에 장면·소스(오너 사진/생성/캐릭터/코드 일러스트)·상태(`요청중 n/2` 등)·출처를 적고, 표 머리에 도구 이름을 적는다. 호출 직전 상태를 갱신하고 시도 수는 표의 합으로 센다.

| 슬롯 | 비율 |
|--|--|
| 메인 히어로 | 4:5 또는 4:3 |
| GNB 묶음별 섹션 히어로 | 4:3·5:4·21:8 |
| 대표 카드 | 16:9 |
| 주요 enum 값별 기본 썸네일 | 16:10 |
| 직영·특집 항목별 썸네일 | 16:10 |
| 빈 상태·완료 일러스트 | — |
