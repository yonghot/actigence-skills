# 프롬프트 카드 연동

이 저장소의 일부 스킬은 ACTIGENCE 사이트(actigence.ai/vibe-coding-prompts)의 프롬프트 카드를 그대로 싣는다. 이 스킬들의 `references/prompt.md` 가 카드 본문이고, `SKILL.md` 는 발동 조건과 라우팅만 담당한다.

| 스킬 | 카드 id | 카드 버전 | prompt.md 상태 |
|---|---|---|---|
| fullstack-feature | dev-merged-4 | 1.12 | exact (카드와 byte-exact) |
| debug-rootcause | dev-merged-5 | 1.11 | ahead-of-card (카드 + Recurrence 확장) |
| seo-aeo-geo | setup-seo-aeo-geo | 1.14 | exact (카드와 byte-exact) |

oneshot-prototyping 과 prd-vibecoding 도 같은 방식으로 연동되며, 해당 자리는 별도 작업이 채운다. 대기 중인 항목은 docs/pending-slots.json 에 있다.

## 규칙

- `references/prompt.md` 는 이 저장소에서 절대 편집하지 않는다. 오탈자도 고치지 않는다.
- 내용을 바꾸려면 ACTIGENCE 사이트의 카드를 먼저 개정(버전 올림)한 뒤 그 본문을 그대로 다시 복사하고 `docs/card-hashes.json` 의 해시를 갱신한다.
- `exact` 상태는 prompt.md 가 카드 본문과 바이트까지 같다는 뜻이다. `ahead-of-card` 는 저장소 사본이 카드의 상위 집합이라는 뜻이며, 카드에 반영되면 `exact` 로 바꾼다.
- 줄바꿈은 LF 를 쓴다.
- 스킬 고유의 보완(사용자 제외 조항, 영어 발동 단어, 출처 표기, 모델 이름 해설)은 SKILL.md 에만 쓰고 카드 규칙을 덮어쓰지 않는다.
- 카드 본문의 모델 이름은 등급을 뜻한다. 카드를 개정할 때 등급어로 바꾸는 작업은 별도 카드 개정에 묶어 처리한다.
