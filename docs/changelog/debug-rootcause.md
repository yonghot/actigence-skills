# debug-rootcause 변경 이력

## 1.0.0

- 최초 공개. `references/prompt.md` 는 카드 `dev-merged-5` v1.11 에 Recurrence 확장(재발 방지 3종: Detection · Constraint restoration · Workaround retirement, 자가 검증 4번과 최종 알림 줄 확장)을 더한 상위 사본이다. 카드 쪽은 아직 v1.11 이므로 상태는 `ahead-of-card`. 카드 승격은 별도 카드 개정 작업이다.
- 공개용으로 SKILL.md 를 다시 씀: 로컬 분기 경고 절과 사이트 파일 경로 포인터를 제거하고 "카드 v1.11 + Recurrence 확장"으로 서술.
- description 과 본문의 모순 수정: 재현 가능 시나리오 확보 전 수정 금지가 아니라 프롬프트의 Iron Law(근본 원인이 증거로 확인되기 전 코드 수정 금지)와 재현 실패 시 약 3회 시도 규칙에 맞춤.
- 사용자 제외 조항(배포 금지·공유·운영 DB 금지 시 `[SKIPPED]`)과 자율 배포 주의 문구 추가, 영어 발동 단어 debugging 추가, 모델 이름 등급 해설 추가.
- 백업 사본은 포함하지 않았고 prompt.md 의 줄바꿈은 CRLF 에서 LF 로 정규화했다(내용 동일).
