# actigence-prompts 변경 이력

## 1.0.0

- 최초 공개. ACTIGENCE 사이트의 프롬프트 카드 12종을 카드마다 스킬 하나로 싣는다(`skills/<카드 id>/references/prompt.md` 가 카드 원문이며 사이트와 byte-exact). 모두 `disable-model-invocation: true` 라 자동으로 발동하지 않고 `/actigence-prompts:<카드 id>` 로만 쓴다. `/actigence-prompts:actigence-prompts` 는 목록이다.
- 카드 파일·SKILL.md·`prompts/README.md`·`prompts/index.json` 은 `scripts/sync-prompts.mjs` 가 만든다. GitHub Actions `sync-prompts` 가 3시간마다 사이트에서 받아 바뀐 카드가 있으면 이 플러그인의 버전을 올려 커밋한다.
