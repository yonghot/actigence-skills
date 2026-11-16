# design-recipes

UI 레시피 모음. 규칙·판정은 카드 DESIGN_ELEVATION 에 있다. 용어는 예시이므로 PRD 도메인 명사로 바꾸고 구조만 유지한다. BD=brand-dark. 그림자·색은 토큰으로 쓴다(`color-mix(in srgb, var(--brand-dark) 30%, transparent)`).

| 작업자 | 읽을 절 |
|--|--|
| UI 킷 FeatureEngineer | Techniques, Motion catalog |
| 기능 화면 FeatureEngineer | Screen recipes |
| DesignImplementer | 전부 |
| HarnessBootstrap | design/ file templates |

## Techniques

### 위계
데스크톱 본문 18px 기준.

| 역할 | 크기/굵기 | 자간 |
|--|--|--|
| 메인 히어로 H1 | 64–72px/900 | -0.035em |
| 섹션 히어로 H1 | 52–58px/900 | -0.035em |
| H2 | 40–44px/700 | -0.025em |
| H3 대표 카드 | 28–32px/700 | -0.02em |
| 숫자 강조 | 40–66px/900 | -0.04em |
| 카드 제목 | 20–21px/700 | |
| 본문 | 17–18px/400, 행간 1.6 | |

- 모바일 393px: H1 38–42, H2 28–30. 768px 이상 H1 은 64px 이상 고정(유동 clamp 로 줄이지 않는다).
- 아이브로: H2 위 16px bold 라벨, 앞에 24×4px 액센트 바(액센트가 글자색 금지면 바에만).
- 숫자: 900 크게, 단위 18px bold, 위험 숫자는 경고색 글자.
- 마커 밑줄: 핵심 단어에 `box-shadow: inset 0 -0.25em 0 var(--accent)`.
- 섹션 머리: 좌 [아이브로/H2/설명], 우 "전체 보기 →", `align-items:flex-end`. 섹션 안은 대표 1(큰 제목, 16:9) + 컴팩트 리스트.

### 표면 5단
| 단 | 처리 |
|--|--|
| 0 바탕 | 흰색 |
| 1 밴드 | muted 배경 |
| 2 카드 | 1px 테두리, 평소 그림자 없음, hover 때 들림 |
| 3 떠 있는 패널 | 상시 그림자: 검색 폼, 현황 카드, 신청 카드, 핵심 정보 띠, 말풍선 |
| 4 다크 밴드 | brand-dark 배경, 페이지당 1–3번(높이 120px 미만 띠 제외) |

그림자는 BD 반투명, 음수 spread 로 아래만 퍼뜨린다.
- 떠 있는 패널 `0 28px 56px -24px BD/.30, 0 2px 6px BD/.06`; 작은 카드 `0 20px 40px -18px BD/.35`; 사진 프레임 `0 34px 64px -28px BD/.5`
- hover 카드 `perspective(900px) rotateX(2deg) translateY(-6px)` + `0 24px 48px -20px BD/.38`, 180ms; hover 버튼 `translateY(-2px)` + `0 12px 22px -12px BD/.55`, 150ms
- 선택 카드는 반전(다크 배경, 흰 글자, 흰 아이콘 박스)

### 섹션 리듬
- 인접 섹션 배경이 같지 않게 흰 → muted → 다크로 번갈고 패턴 유무로도 구분한다.
- 상하 패딩 96–120px, 컨테이너 1280px, 좌우 40px(모바일 16px), 머리–본문 36–44px, 카드 간격 14–24px.
- 홈 예: 헤더 → 히어로(muted+별+워터마크) → 티커(다크) → 탐색 그리드(흰+도트) → 대표+리스트(muted+모눈) → 벤토(다크+흰 도트) → 카드 그리드 → 일정·지역 → 성과 숫자(워터마크) → 배너 → 푸터(다크).

### 겹친 사진 프레임 (히어로)
1. 뒤판: 브랜드색 블록 `inset:40px 24px 70px 60px; border-radius:40px; rotate(5deg)`, 위에 흰 도트를 같은 inset·회전으로.
2. 사진: `border:8px solid var(--on-dark); border-radius:36px; rotate(-1.5deg)` + 사진 프레임 그림자, `object-fit:cover`+`object-position`.
3. 레벨 3 카드 2–3개를 가장자리에 걸친다: 우상단 맥박점 마감 카드, 좌하단 숫자 3개 현황, 우하단 캐릭터+말풍선.
4. 페이지마다 회전 방향을 바꾸고 사진 2장 겹침 변형도 쓴다.

### 벤토 그리드
`grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:20px`. 대표 `span 2×2`(사진+협력 로고 칩), 보조 `span 2`(pale+패턴+캐릭터), 소형(아이콘 박스 52px+이름+한 줄). 다크 밴드 소형은 `color-mix(in srgb, var(--on-dark) 8%, transparent)` 면과 18% 테두리.

### 배경 패턴·질감·워터마크
패턴 SVG 는 `fill="black"` 모양만 담고 색은 토큰으로 마스크에 칠한다.
```css
.pat{position:relative;isolation:isolate}
.pat::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background-color:var(--pattern-ink);opacity:var(--pattern-opacity,.10);
  -webkit-mask:var(--pattern-url) repeat 0 0/var(--pattern-size);mask:var(--pattern-url) repeat 0 0/var(--pattern-size)}
.pat-dots{--pattern-url:url(/patterns/dots.svg);--pattern-size:24px 24px}
.pat-grid{--pattern-url:url(/patterns/grid.svg);--pattern-size:40px 40px}
.pat-stars{--pattern-url:url(/patterns/stars.svg);--pattern-size:120px 120px}
.pat-on-dark{--pattern-ink:var(--on-dark)}
```
- 전역 기본 배경: `body` 또는 전체를 덮는 `position:fixed` 층에 `.pat-dots`/`.pat-grid` 를 opacity 0.06 이하로 항상 깐다. 패턴 위 콘텐츠는 레벨 2 카드·패널로 받친다.
- 5종: 도트 24px(흰 섹션), 모눈 40px(목록·일정), 별 120px(히어로·캐릭터 카드), 흰 도트 24px(다크 밴드), 브랜드 질감 이미지(킷에 있을 때만, 모서리 크롭, opacity .07–.5).
- 워터마크: 150–230px/900 대형 단어, `color:transparent; -webkit-text-stroke:2px` 브랜드색 12%(다크 위 흰색 10%), `aria-hidden="true"`, `pointer-events:none`.

### 텍스트 입체감
단색 오프셋 레이어만 쓴다(그라디언트 없음). 28px 이상(한글은 36px 이상), 한 방향 통일, 대비 4.5:1(큰 글자 3:1), 글자는 텍스트 노드로 둔다.

| 이름 | 용도 | 값 (L=brand-light, P=brand-pale, B=brand) |
|--|--|--|
| 돌출 | 히어로 H1, 큰 숫자 | `1px 1px 0 L … 5px 5px 0 L, 8px 10px 18px BD/.22` |
| 얕은 | H2 | `2px 2px 0 P, 3px 3px 0 P` |
| 숫자 | 통계 | `2px 2px 0 P, 4px 4px 0 P` |
| 흰 글자 | 다크 밴드 제목 | `0 2px 0 B, 0 4px 0 B, 0 7px 12px BD/.22` |

### 브랜드 에셋 배치
- 캐릭터 포즈는 뜻과 짝짓는다: 인사(히어로·푸터·빈 결과), 가리키기(탐색), 확성기(마감·공지), 엄지(완료), 노트북(학습·필터), 하트(성과), 휴대폰(알림·마이), 여행(해외), 운동(문화), 선물(혜택), 행성(흩어진 정보). 실제 대응표는 brand-pack 의 에셋 이름으로 고정한다. 마스코트가 없으면 아이콘·일러스트로.
- 한 뷰포트에 주인공 캐릭터 하나, 가장자리에 걸친다. 검색창·버튼·입력을 덮지 않는다.
- 시트에서 한 캐릭터만 쓰기: `overflow:hidden` 상자 안에서 이미지를 2배로 키우고 오프셋으로 자른다(원본 픽셀 유지).
- 상태에 따라 교체(질문 중 가리키기 → 모두 통과 엄지).

### 인터랙션 패턴
- 필터 칩 `aria-pressed`, 선택 시 다크 배경+✓, 칩 아래 "고른 조건" 요약
- 세그먼트 탭(트랙 muted, 선택 다크, 목록 전환 모션), 선택 → "N건 보기" 띠 즉시 변경
- 찜: 아이콘 pop, `aria-live` 토스트, 채움 상태
- 목록: 필터·정렬 3종·그리드/리스트 전환·활성 칩 제거·초기화·건수 전환
- 인라인 다단계 신청: 대기 → 확인(체크 전부 해야 제출) → 완료(캐릭터)
- 자격 자가진단(PRD 에 대상 조건이 있을 때): 질문 2–3개 예/아니오, 결과 문구+캐릭터 교체
- 빈 상태: 캐릭터+다음 행동+초기화. 아코디언: 화살표 180°

### UI 킷 컴포넌트
`PageHero`(main/section/compact, 이미지·캐릭터 슬롯, 떠 있는 카드 슬롯, 패턴·워터마크 옵션), `SectionHeader`, `Surface`(level 0–4), `PhotoFrame`, `StatNumber`(카운트업·단위·입체), `Reveal`, `Stagger`, `Marquee`(일시정지 버튼), `MotionToggle`, `CharacterImage`(포즈 → 에셋, 크롭), `PatternBackground`, `BentoGrid`, 도메인 카드(썸네일 포함), `EmptyState`, `FloatingCard`, `Ticker`, hover·press 유틸(`tilt`, `lift`, `press`). 이름과 props 는 `design/principles.md` 에 먼저 고정한다.

## Screen recipes

채울 데이터가 있는 요소만 둔다(없는 성과 숫자·티커·배너·벤토는 만들지 않고, PRD 에 없는 기능 섹션도 만들지 않는다). 1–2화면 범위면 패턴·워터마크·입체 제목·다크 배경을 기존 섹션에 입힌다.
- **홈/진입**: 메인 히어로(H1 디스플레이, 사진 프레임 또는 캐릭터 무대, 시드에서 계산한 현황 카드, 주 행동) · 기한 있는 데이터의 티커 · 탐색 그리드 · 대표+리스트 · 다크 벤토 · 탭 필터 카드 그리드 · 성과 숫자·배너·핵심 정보 띠(레벨 3 패널, 히어로만으로는 상시 그림자가 5개쯤이라 6개를 채운다) · 배너 2–3, 푸터.
  - 성과 숫자는 카운트업, 시드 계산값만, 데모 바가 보일 때만. 실제 성과·후기·수상·인증처럼 읽히는 문구는 만들지 않는다.
- **섹션 히어로**: 묶음마다 하나. 배경 단·사진·포즈·레이아웃 변형을 달리해 반복을 피한다.
- **목록**: 사진 컴팩트 히어로, 캐릭터 팁 필터 사이드바, 썸네일 카드, 정렬·보기 전환, 캐릭터 빈 상태.
- **상세**: 사진 히어로 → 겹치는 핵심 정보 띠(레벨 3, 카운트업) → 신청 카드(D-day 대형 숫자, 진행 막대, 인라인 신청) → 일정 단계(진행선 그리기) → 관련 항목 썸네일.
- **대시보드/마이**: 숫자가 주인공, 다크 밴드 인사, 캐릭터 1.
- **폼**: 진행 표시, 인라인 검증. **빈 화면/오류/404**: 캐릭터+원인+다음 행동.

## Motion catalog

단계·시간·앰비언트 상한·`transition` 금지 범위는 카드 "Motion rules" 가 정본이다. 아래는 구현 카탈로그와 코드뿐이다.

**카탈로그**
- 카운트업: rAF 1.0–1.6s, `1-(1-p)^3`
- 로테이팅 워드: 핵심 단어를 A/B 클래스 교대로 재생, 2.8s 간격, 최대 3회 교체 후 마지막 단어에서 멈춤(총 8.4s > 5s 이므로 MotionToggle 동반), 비활성 단어는 `aria-hidden="true"`
- 말풍선 동기 교체, 막대·진행바 자라기, 진행선 그리기
- 티커: 항목 2배 복제, `translateX(0 → -50%)`, hover·focus 일시정지, 정지 버튼, 루트에 `data-ticker`
- 스크롤 등장+순차, 둥실, 반짝, 맥박 링, 가로 비행
- 카드 tilt, 버튼 lift, 아이콘 흔들림, 찜 pop, 목록 교체
- MotionToggle: 헤더·푸터에 `data-motion-toggle`, 키보드 조작, 켜면 `<html data-motion="off">` 로 `@keyframes` 전부 `animation-play-state: paused` 와 JS 교체 중지

**reduced-motion**: 카드 "Motion rules" 의 CSS 규칙을 쓴다. JS 애니메이션은 `matchMedia('(prefers-reduced-motion: reduce)')` 이면 바로 최종값. 숨김 후 등장 요소는 reduce 일 때 숨기지 않는다.

**하이드레이션**: SSR 은 최종 상태(보이는 요소, 최종 숫자, 첫 단어)로 그린다. 숨김(`opacity:0`)은 마운트 후 `<html>` 에 붙는 `m-on` 아래에서만 적용한다.
```css
html.m-on .rv:not(.in){opacity:0;transform:translateY(16px)}
.rv{animation:rv-in 640ms var(--ease) both}
```
```js
requestAnimationFrame(()=>document.documentElement.classList.add('m-on'))
```
다른 클래스명이면 `<html data-hydrated>` 를 함께 붙인다. 카운트업은 화면 진입 뒤 시작(첫 화면 숫자는 1s 안). 초기 렌더에 `Math.random()`·`Date.now()`·`window` 금지, `matchMedia` 는 effect 안에서만. 애니메이션 요소 공간은 미리 잡는다.

**React/Next.js**
- `Reveal`·`CountUp`·`Marquee`·`RotatingWord` 는 클라이언트 컴포넌트, 키프레임은 전역 CSS.
- IntersectionObserver 하나 공유, `threshold:0`, `rootMargin:'0px'`(음수·양의 threshold 는 걸친 글자를 투명하게 남긴다).
- 순차 지연은 배치 내 상대 인덱스, 최대 8단계(~400ms). 전체 인덱스에 `i*50ms` 금지.
- 재생성은 키 교체가 아니라 A/B 클래스 교대.
- 비활성 프레임은 `aria-hidden="true"` 또는 DOM 제거, 툴팁·닫힌 메뉴는 `hidden`·`role="tooltip"`, 의도적 투명 장식 글자는 `data-motion-exempt`.

## design/ file templates

토큰 값은 `design/tokens.json` 에 쓰고 `scripts/gen-tokens` 로 `design/tokens.css` 를 컴파일한다. 별도 디자인 시스템 파일은 만들지 않는다.

**principles.md**: 위계 수치, 표면 5단, 섹션 리듬, "한 화면에 주인공 시각 요소 하나", 모션 4단계, 화면 레시피 요약, UI 킷 컴포넌트 이름·props.

**forbidden.md · required.md · trend-pack 강도표 · 토큰·반경 값**: 카드 DESIGN_ELEVATION "Design files" 가 정본이다(여기에 복사하지 않는다).

**tone.md**: 카피 톤, 캐릭터 말풍선(짧은 한 문장, 문체는 PRD 따름, 한국어 PRD 미지정 시 해요체), 자기지시형 AI 카피 금지.

**brand-pack.md**: 에셋 인벤토리(경로·출처·승인 근거·사용 범위·금지), 캐릭터 포즈 ↔ 의미 지도, 로고 위치, 이미지 슬롯 표(image-recipes Slot table), 아트디렉션 꼬리말과 이렇게/빼기 목록.

**trend-pack.md**: 채택한 기법과 강도, 생성 이미지 `<STYLE>`과 서비스 톤앤매너. "트렌드 금지"라고 쓰지 않는다.
