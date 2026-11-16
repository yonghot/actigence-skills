# contract-review 변경 이력

## 1.0.2

- export-dc-pdf.mjs Windows 수정: Chrome 이 끝난 직후에도 자식 프로세스가 임시 프로필을 잠깐 붙잡고 있어 프로필 삭제가 EPERM 으로 실패했다(4회 중 1회 꼴). 그러면 PDF 가 만들어졌는데도 종료 코드 1 로 끝나고 실패한 프로필(회당 수~수십 MB)이 임시 폴더에 쌓였다. 이제 삭제를 재시도하고, 그래도 실패하면 무시한다. 다음 실행 때 10분 지난 `contract-review-pdf-*` 프로필을 정리한다.

## 1.0.1

- export-dc-pdf.mjs 보안 강화: 입력 HTML 의 script 태그·인라인 이벤트 핸들러·javascript: URL 을 두 입력 경로 모두에서 제거하고, 조립한 페이지에 스크립트를 차단하는 Content-Security-Policy 를 넣는다. Linux 의 `--no-sandbox` 는 root 로 실행할 때만 붙인다.

## 1.0.0

- 최초 공개판. 비식별 처리: references/onepager.dc.html 과 SKILL.md 예시의 실제 당사자·금액·날짜·파일명을 가상 값(예시상사, 샘플기획, 12,000,000원, 2029년)으로 교체하고, 특정 PC 경로와 NOTES.md 기록 관례를 삭제. 산출 .md 는 사용자가 지정한 폴더(없으면 원본 계약서 옆, claude.ai 는 /mnt/user-data/outputs/)에 저장.
- STEP 0 사전 점검 추가: Python 실행기 선택, `python -I -c "import pymupdf, docx"`, 설치 명령. extract.py·check_onepage.py 는 패키지가 없으면 설치 명령 한 줄을 출력하고 끝난다.
- DOCX→PDF 경로에 Word 가 없을 때의 LibreOffice(soffice) 경로 추가. DOCX 직접 추출이 읽지 못하는 것(변경 추적·메모·머리글/바닥글·텍스트 상자) 명시.
- 아트보드 대체 경로: Artifact 의 Design 타입이 없으면 export-dc-pdf.mjs 가 만드는 단독 HTML(A4 1쪽)을 산출물로 내고, 최종 확인 뒤 PDF 생성. export-dc-pdf.mjs 는 Edge·Chrome·Chromium(Windows 사용자별 설치, macOS, Linux, Playwright 캐시)을 찾고 `CHROME` 환경변수를 지원하며, 일반 HTML 도 받는다. 템플릿의 ./support.js 는 Design 캔버스 런타임이 제공함을 주석으로 명시.
- 계약서 본문 기밀 유지 조항 추가(공개 세션·검색어·공유 링크에 넣지 않음).
- HWPX 입력은 선택 외부 스킬 hwpx를 쓰도록 안내. 이 저장소에는 포함하지 않음.
- description 을 "무엇을 한다 / Use when / Do NOT use for" 형식으로 정리하고 발동 조건(「계약서 검토」 문구)은 유지.
