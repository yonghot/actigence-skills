import { readFileSync } from 'node:fs';

const HEADERS = ['게이트 임계값', '추가 sub-agent', '자율성 강도', '추가 종료 조건', '건너뛸 Phase', '보안 강화 범위', '산출물 형태', '데이터 저장소', '데모 모드', '디자인 고도화'].map((h) => `### ${h}`);
const TYPES = ['web-app', 'browser-extension', 'desktop-app', 'cli', 'library', 'mobile', 'api-service'];
const BANNED = ['lorem', 'test1', '사용자1', '홍길동', 'example.com', '아이템 A'];
const THRESHOLD = '### 게이트 임계값';

const file = process.argv[2];
if (!file) {
  console.error('usage: node lint-prd.mjs <PRD.md>');
  process.exit(1);
}
let text;
try {
  text = readFileSync(file, 'utf8');
} catch (e) {
  console.error(`cannot read ${file}: ${e.message}`);
  process.exit(1);
}
const lines = text.replace(/^﻿/, '').split(/\r?\n/);
const fails = [];
const fail = (check, msg) => fails.push(`${check}: ${msg}`);

const ralphAt = lines.findIndex((l) => l === '## Ralph Loop');
let ralphEnd = lines.length;
let ralphHeaders = [];
if (ralphAt < 0) {
  fail('headers', 'missing exact line "## Ralph Loop"');
} else {
  for (let i = ralphAt + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) { ralphEnd = i; break; }
  }
  ralphHeaders = lines.slice(ralphAt + 1, ralphEnd).map((l, k) => ({ l, n: ralphAt + 2 + k })).filter((x) => /^###/.test(x.l));
  const got = ralphHeaders.map((x) => x.l);
  const missing = HEADERS.filter((h) => !got.includes(h));
  const extra = got.filter((h) => !HEADERS.includes(h));
  if (missing.length) fail('headers', `missing or not byte-exact: ${missing.join(' | ')}`);
  if (extra.length) fail('headers', `unexpected sub-section: ${extra.join(' | ')}`);
  if (!missing.length && !extra.length) {
    if (got.length !== HEADERS.length) fail('headers', `duplicate sub-section (found ${got.length}, expected ${HEADERS.length})`);
    else if (got.some((h, i) => h !== HEADERS[i])) fail('headers', 'order differs from canon');
  }
}

for (const w of BANNED) {
  const re = new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'iu');
  const hit = lines.findIndex((l) => re.test(l));
  if (hit >= 0) fail('placeholder', `"${w}" at line ${hit + 1}`);
}

let inFence = false;
const residue = [];
lines.forEach((l, i) => {
  if (/^\s*(```|~~~)/.test(l)) { inFence = !inFence; return; }
  if (inFence) return;
  const stripped = l.replace(/`[^`]*`/g, '').replace(/\/\{[A-Za-z_][\w-]*\}/g, '/');
  const m = stripped.match(/\{[^{}]{1,80}\}/);
  if (m) residue.push(`line ${i + 1} ${m[0]}`);
});
if (residue.length) fail('residue', `unreplaced {...}: ${residue.slice(0, 5).join(', ')}${residue.length > 5 ? ` (+${residue.length - 5})` : ''}`);

let section = null;
const lh = [];
lines.forEach((l, i) => {
  if (/^#{1,6}\s/.test(l)) section = l.trim();
  if (/lighthouse/i.test(l) && section !== THRESHOLD) lh.push(i + 1);
});
if (lh.length) fail('lighthouse', `outside "${THRESHOLD}": line ${lh.slice(0, 5).join(', ')}`);

const ng = lines.findIndex((l) => /^#{2,4}\s*5\.3\b/.test(l));
if (ng < 0) {
  fail('non-goals', 'section 5.3 heading not found');
} else {
  const level = lines[ng].match(/^#+/)[0].length;
  let count = 0;
  for (let i = ng + 1; i < lines.length; i++) {
    const h = lines[i].match(/^(#+)\s/);
    if (h && h[1].length <= level) break;
    if (/^\s*([-*]|\d+\.)\s+\S/.test(lines[i])) count++;
  }
  if (count < 3) fail('non-goals', `${count} item(s), need >= 3`);
}

const typeIn = (line) => {
  const m = line.match(/artifact_type[^\n]*?(web-app|browser-extension|desktop-app|cli|library|mobile|api-service)(?![\w-])/);
  return m ? m[1] : null;
};
const places = {};
const meta = lines.find((l) => /^>.*산출물 형태\s*\(artifact_type\)/.test(l));
places.metadata = meta ? typeIn(meta) : null;
if (ralphAt >= 0) {
  const at = ralphHeaders.find((x) => x.l === '### 산출물 형태');
  if (at) {
    const body = lines.slice(at.n, ralphEnd);
    const nxt = body.findIndex((l) => /^###?\s/.test(l));
    const sec = nxt < 0 ? body : body.slice(0, nxt);
    const hit = sec.map(typeIn).find(Boolean);
    places.ralph = hit || null;
  }
}
const s7 = lines.findIndex((l) => /^##\s*7\./.test(l));
if (s7 >= 0) {
  let hit = null;
  for (let i = s7 + 1; i < lines.length && !/^##\s/.test(lines[i]); i++) {
    hit = typeIn(lines[i]);
    if (hit) break;
  }
  places.section7 = hit;
}
const vals = ['metadata', 'ralph', 'section7'].map((k) => places[k] ?? null);
if (vals.some((v) => !v)) {
  fail('artifact_type', `value not found in: ${['metadata', 'ralph', 'section7'].filter((k, i) => !vals[i]).join(', ')}`);
} else if (new Set(vals).size > 1) {
  fail('artifact_type', `inconsistent: metadata=${vals[0]} ### 산출물 형태=${vals[1]} section7=${vals[2]}`);
} else if (!TYPES.includes(vals[0])) {
  fail('artifact_type', `unknown value ${vals[0]}`);
}

if (fails.length) {
  console.log(`lint-prd: FAIL (${fails.length})`);
  for (const f of fails) console.log(`- ${f}`);
  process.exit(1);
}
console.log('lint-prd: OK');
process.exit(0);
