export const meta = {
  name: 'contract-review',
  description: '계약서를 특이·불리·정합성·숫자/오타 4관점으로 병렬 검토하고 지적마다 반증 검증 후 누락 비평',
  phases: [
    { title: 'Review', detail: '4관점 병렬 검토' },
    { title: 'Verify', detail: '관점별 지적을 원문 대조·최소 기준으로 반증' },
    { title: 'Critic', detail: '빠진 중요 항목 확인' },
  ],
}

const A = args || {}
const STANDARD = A.standard || `판정 기준(가장 중요): 조건은 이미 구두로 합의됐고 지금은 문서화 단계다. 모든 유불리를 따지지 말고 (1) 아주 간단하고 당연히 고쳐야 하는 것, (2) 조건 조정이 매우 시급하고 중요한 것만 최소한으로 낸다. 우리 측에 유리한 조항은 그 자체로 지적하지 않는다(그 조항 때문에 우리가 실제로 손해 볼 위험이 있을 때만 예외). 작성자가 색상·형광으로 표시한 확정 전 값과 빈칸은 그 자체로 지적하지 않되, 그 값들이 다른 조항과 충돌하면 지적한다. 문체 취향, 일반론적 법률 자문, "~도 고려해 보라" 식 제안은 내지 않는다.`
const CTX = `검토 대상: ${A.title || '계약서'}
- 본문 텍스트(UTF-8, PDF에서 뽑았으면 "=== p.N ===" 가 쪽 구분): ${A.text}
- 추출 요약(빈칸·사업자번호 검증·한글 금액 대조·별첨 언급): ${A.summary || '(없음)'}
- 쪽별 렌더 이미지: ${A.images || '(없음)'} (표·서식 확인이 필요할 때만 Read)
- 원본 파일: ${A.source}
당사자: 우리 측 = ${A.party}. 상대방 = ${A.counterparty}.
배경: ${A.background || '(추가 배경 없음)'}
작성자 표시(색상·형광·빈칸): ${A.marks || '(없음)'}
${STANDARD}
모든 출력은 한국어. 각 지적에는 원문을 그대로 짧게 인용(quote)하고, 바로 붙여 넣을 수 있는 수정 문안(fix)을 준다.
관점별 점검표: ${A.checklist || '(없음)'} 에서 해당 관점 절만 읽는다.`

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          clause: { type: 'string' },
          quote: { type: 'string' },
          issue: { type: 'string' },
          fix: { type: 'string' },
          tier: { type: 'string', enum: ['필수', '권장', '참고'] },
        },
        required: ['clause', 'quote', 'issue', 'fix', 'tier'],
      },
    },
  },
  required: ['findings'],
}

const VERDICTS = {
  type: 'object',
  properties: {
    verdicts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          index: { type: 'integer' },
          keep: { type: 'boolean' },
          tier: { type: 'string', enum: ['필수', '권장', '참고'] },
          reason: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['index', 'keep', 'tier', 'reason', 'fix'],
      },
    },
  },
  required: ['verdicts'],
}

const LENSES = [
  { key: '특이', prompt: '관점: 통상적인 같은 유형 계약과 비교해 특이하거나 이상한 부분. 빠진 내용(각 호·표 누락, 미첨부 별첨), 정의 없이 쓰인 용어, 소급·기간 처리, 구조상 어색한 부분. 점검표의 「1. 특이」 절.' },
  { key: '불리', prompt: '관점: 우리 측에 과도하게 불리하거나 실제 손해로 이어질 부분만. 대금 지급·정산·환수 근거, 증빙 확보, 책임 한도, 일방 권한, 지재권·데이터·계정, 개인정보. 계약이 이미 우리에게 유리하게 짜여 있으면 진짜 위험만 낸다. 점검표의 「2. 불리」 절.' },
  { key: '정합성', prompt: '관점: 논리 충돌·정합성. 조항 간 상호 참조(제X조 제Y항 제Z호)를 하나도 빠짐없이 실제 존재 여부와 대조하고, 일정 연쇄(집행·보고·검수·보완·지급·계약 종료), 기간 단위, 금액 구성, 존속 조항, 우선순위, 용어 일관성을 본다. 점검표의 「3. 정합성」 절.' },
  { key: '숫자오타', prompt: '관점: 숫자 계산 오류와 단순 오타. 금액 합계·한글 금액·VAT 표기, 비율, 사업자등록번호 검증번호(직접 계산), 날짜·요일, 법령명·조문 번호, 항·호 번호 체계, 띄어쓰기·표기 불일치, 서명란. 렌더 이미지로 서식 깨짐도 본다. 점검표의 「4. 숫자·오타」 절.' },
]

phase('Review')
const results = await pipeline(
  LENSES,
  l => agent(`${CTX}\n\n${l.prompt}\n\n지적이 없으면 빈 배열을 반환한다.`, { label: `review:${l.key}`, phase: 'Review', schema: FINDINGS }),
  (r, l) => {
    const fs = (r && r.findings) || []
    if (!fs.length) return { lens: l.key, kept: [], dropped: [] }
    const list = fs.map((f, i) => `[${i}] ${f.clause} | 인용: "${f.quote}" | 문제: ${f.issue} | 수정: ${f.fix} | 등급: ${f.tier}`).join('\n')
    return agent(`${CTX}\n\n아래는 "${l.key}" 관점 검토자가 낸 지적이다. 각 지적을 반박하려고 시도하라.\n1) 원문을 직접 열어 인용이 실제로 있는지, 지적한 사실이 맞는지 확인한다(상호 참조·숫자는 직접 대조·계산).\n2) 사실이어도 판정 기준에 못 미치면 keep=false.\n3) 애매하면 keep=false. 등급 재판정: 필수=서명 전 반드시 고칠 것, 권장=고치면 좋은 간단한 것, 참고=알아만 둘 것.\n\n${list}`, { label: `verify:${l.key}`, phase: 'Verify', schema: VERDICTS, effort: 'high' })
      .then(v => {
        const vs = (v && v.verdicts) || []
        return {
          lens: l.key,
          kept: vs.filter(x => x.keep && fs[x.index]).map(x => ({ ...fs[x.index], tier: x.tier, fix: x.fix, verifyReason: x.reason })),
          dropped: vs.filter(x => !x.keep && fs[x.index]).map(x => ({ clause: fs[x.index].clause, issue: fs[x.index].issue, reason: x.reason })),
        }
      })
  },
)

phase('Critic')
const ok = results.filter(Boolean)
const kept = ok.flatMap(r => r.kept.map(f => ({ ...f, lens: r.lens })))
const keptList = kept.map((f, i) => `[${i}] (${f.lens}/${f.tier}) ${f.clause}: ${f.issue}`).join('\n')
const critic = await agent(`${CTX}\n\n아래는 검증을 통과한 지적 목록이다. 원문 전체를 처음부터 끝까지 다시 읽고, 판정 기준에 맞는데 이 목록에 빠진 항목만 찾아라(같은 취지는 내지 말 것). 스스로 반증까지 거친 뒤 확실한 것만 낸다. 없으면 빈 배열.\n\n${keptList || '(없음)'}`, { label: 'critic', phase: 'Critic', schema: FINDINGS, effort: 'high' })

const failed = LENSES.length - ok.length
if (failed) log(`${failed}개 관점이 결과 없이 끝남 — 오케스트레이터가 해당 관점을 직접 보완할 것`)
return { kept, dropped: ok.flatMap(r => r.dropped.map(d => ({ ...d, lens: r.lens }))), critic: (critic && critic.findings) || [], failedLenses: failed }
