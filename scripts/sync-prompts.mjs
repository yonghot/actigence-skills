#!/usr/bin/env node
// Usage: node scripts/sync-prompts.mjs [--source <url|file>] [--json]   (writes the repo)
//        node scripts/sync-prompts.mjs --check                          (exit 1 if generated files drifted)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_SOURCE = "https://actigence.ai/data/prompts.json";
export const PLUGIN = "actigence-prompts";
const REPO = "yonghot/actigence-skills";
const RAW = `https://raw.githubusercontent.com/${REPO}/main/`;
const BLOB = `https://github.com/${REPO}/blob/main/`;
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const p = (root, ...a) => path.join(root, ...a);
const read = (f) => fs.readFileSync(f, "utf8");
const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const exists = (f) => fs.existsSync(f);
export const cardPath = (id) => `plugins/${PLUGIN}/skills/${id}/references/prompt.md`;

function bump(v, level) {
  const [a, b, c] = v.split(/[.+-]/).map(Number);
  return level === "minor" ? `${a}.${b + 1}.0` : `${a}.${b}.${c + 1}`;
}

async function loadSource(src) {
  if (/^https?:\/\//.test(src)) {
    const r = await fetch(src, { headers: { "user-agent": "actigence-skills-sync" } });
    if (!r.ok) throw new Error(`fetch ${src}: HTTP ${r.status}`);
    return r.json();
  }
  return JSON.parse(read(src));
}

function titleOf(b) {
  const first = b.content.split("\n").find((l) => l.trim()) || "";
  const m = /^#\s+(.+?)\s*$/.exec(first);
  return (m ? m[1] : b.h2 || b.id).replace(/\s+/g, " ");
}

function oneLine(s, max) {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  if ([...t].length <= max) return t;
  const cut = [...t].slice(0, max - 1).join("");
  const dot = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("다. "), cut.lastIndexOf("— "));
  return (dot > max * 0.5 ? cut.slice(0, dot + 1) : cut).trim() + "…";
}

export function normalize(json, coupledByCard = {}) {
  if (!json || !Array.isArray(json.blocks) || !Array.isArray(json.tree)) throw new Error("source: expected {blocks[], tree[]}");
  const byId = new Map(json.blocks.map((b) => [b.id, b]));
  const order = [];
  const group = {};
  for (const t of json.tree) for (const h of t.h2_groups || []) for (const id of h.blocks || []) if (byId.has(id) && !group[id]) { group[id] = t.title; order.push(id); }
  for (const b of json.blocks) if (!group[b.id]) { group[b.id] = b.h1 || "기타"; order.push(b.id); }
  return order.map((id) => {
    const b = byId.get(id);
    if (!ID_RE.test(id)) throw new Error(`card id not usable as a folder name: ${id}`);
    if (typeof b.content !== "string" || !b.content.trim()) throw new Error(`card ${id}: empty content`);
    const content = b.content.replace(/\r\n?/g, "\n");
    return {
      id,
      title: titleOf(b),
      group: group[id],
      section: b.h2 || "",
      version: String(b.version || "0"),
      updatedAt: String(b.updatedAt || ""),
      description: oneLine(b.description, 300),
      path: cardPath(id),
      rawUrl: RAW + cardPath(id),
      skill: coupledByCard[id] || null,
      sha256: sha256(content),
      content,
    };
  });
}

export function cardSkillMd(c) {
  const desc = oneLine(`ACTIGENCE 프롬프트 카드 v${c.version} — ${c.description}`, 400);
  return `---
name: ${c.id}
description: ${JSON.stringify(desc)}
disable-model-invocation: true
argument-hint: "작업 요청 (예: 첨부한 PRD로 진행해줘)"
---

# ${c.title}

ACTIGENCE 프롬프트 카드 \`${c.id}\` v${c.version} (${c.updatedAt}). 분류: ${c.group}${c.section ? ` · ${c.section}` : ""}.

1. 이 스킬 폴더의 \`references/prompt.md\` 를 처음부터 끝까지 읽는다. 그 카드 원문이 이번 작업의 규칙 정본이다.
2. 명령 뒤에 적힌 요청(ARGUMENTS)과 첨부 파일·작업 폴더를 카드의 입력으로 삼아 카드대로 진행한다. 요청이 비어 있으면 카드가 요구하는 입력을 사용자에게 묻는다.
3. 컨텍스트가 압축되거나 새 세션으로 넘어가면 \`references/prompt.md\` 를 다시 읽고 이어 간다.
`;
}

export function indexSkillMd(cards) {
  const rows = cards.map((c) => `| \`/${PLUGIN}:${c.id}\` | ${c.title} | ${c.group}${c.section ? ` · ${c.section}` : ""} | v${c.version} |`).join("\n");
  return `---
name: ${PLUGIN}
description: "ACTIGENCE 프롬프트 카드 목록. 카드를 쓰려면 /${PLUGIN}:<카드 id> 뒤에 작업 요청을 적는다."
disable-model-invocation: true
---

# ACTIGENCE 프롬프트 카드

아래 표를 사용자에게 보여 주고, 어떤 카드를 쓸지 정하도록 돕는다. 카드를 실행하지는 않는다.

| 명령 | 카드 | 분류 | 버전 |
|---|---|---|---|
${rows}

카드 원문은 카드마다 스킬 폴더 안의 references 폴더에 있고, ACTIGENCE 사이트에 게시된 카드와 같다.
`;
}

export function catalogMd(cards) {
  const rows = cards.map((c) => `| ${c.group}${c.section ? ` · ${c.section}` : ""} | \`${c.id}\` | ${c.title} | ${c.version} | ${c.updatedAt} | [보기](${BLOB}${c.path}) · [원문](${c.rawUrl}) | ${c.skill ? `[${c.skill}](../plugins/${c.skill})` : "-"} |`).join("\n");
  return `# 프롬프트 카드

ACTIGENCE 사이트([actigence.ai/vibe-coding-prompts](https://actigence.ai/vibe-coding-prompts))의 프롬프트 카드 ${cards.length}종입니다. 이 폴더와 \`plugins/${PLUGIN}\` 는 사이트에서 자동으로 동기화되므로 직접 고치지 마세요(\`scripts/sync-prompts.mjs\`, GitHub Actions \`sync-prompts\`).

- Claude Code: \`${PLUGIN}\` 플러그인을 설치하면 \`/${PLUGIN}:<카드 id> 작업 요청\` 으로 바로 씁니다. 목록은 \`/${PLUGIN}:${PLUGIN}\`.
- 다른 도구: 아래 "원문" 링크의 내용을 그대로 복사해 붙여 넣습니다. 링크는 항상 최신판을 가리킵니다.
- 기계가 읽는 목록: [index.json](index.json)

| 분류 | 카드 id | 제목 | 버전 | 갱신일 | 원문 | 연동 스킬 |
|---|---|---|---|---|---|---|
${rows}
`;
}

export function indexJson(cards, source) {
  return JSON.stringify({
    source,
    cards: cards.map(({ content, ...c }) => c),
  }, null, 2) + "\n";
}

function loadCoupled(root) {
  const f = p(root, "docs", "card-hashes.json");
  const data = JSON.parse(read(f));
  const byCard = {};
  for (const [skill, e] of Object.entries(data.skills || {})) if (e.card) byCard[e.card] = skill;
  return { file: f, data, byCard };
}

function replaceReadmeVersion(readme, name, version) {
  return readme.replace(new RegExp(`^(\\| \`${name}\` \\|.*\\| )([0-9]+\\.[0-9]+\\.[0-9]+)( \\|)$`, "m"), `$1${version}$3`);
}

function prependChangelog(root, name, version, lines) {
  const f = p(root, "docs", "changelog", `${name}.md`);
  const head = `# ${name} 변경 이력\n\n`;
  const old = exists(f) ? read(f) : head;
  const body = old.startsWith(head) ? old.slice(head.length) : old;
  fs.writeFileSync(f, `${head}## ${version}\n\n${lines.map((l) => `- ${l}`).join("\n")}\n\n${body}`);
}

function setPluginVersion(root, name, level) {
  const f = p(root, "plugins", name, ".claude-plugin", "plugin.json");
  const j = JSON.parse(read(f));
  j.version = bump(j.version, level);
  fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  return j.version;
}

export function planWrite(root, cards, source) {
  const files = new Map();
  for (const c of cards) {
    files.set(c.path, c.content);
    files.set(`plugins/${PLUGIN}/skills/${c.id}/SKILL.md`, cardSkillMd(c));
  }
  files.set(`plugins/${PLUGIN}/skills/${PLUGIN}/SKILL.md`, indexSkillMd(cards));
  files.set("prompts/README.md", catalogMd(cards));
  files.set("prompts/index.json", indexJson(cards, source));
  return files;
}

function skillDirsOnDisk(root) {
  const d = p(root, "plugins", PLUGIN, "skills");
  return exists(d) ? fs.readdirSync(d, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
}

export async function sync({ root = ROOT, source = DEFAULT_SOURCE } = {}) {
  const coupled = loadCoupled(root);
  const cards = normalize(await loadSource(source), coupled.byCard);
  const before = exists(p(root, "prompts", "index.json")) ? JSON.parse(read(p(root, "prompts", "index.json"))).cards : [];
  const beforeById = new Map(before.map((c) => [c.id, c]));
  const nowIds = new Set(cards.map((c) => c.id));
  const changed = [], added = [], removed = [], attention = [], bumped = {};

  for (const c of cards) {
    const prev = beforeById.get(c.id);
    if (!prev) added.push(c.id);
    else if (prev.sha256 !== c.sha256 || prev.version !== c.version) changed.push(c.id);
  }
  for (const id of skillDirsOnDisk(root)) if (id !== PLUGIN && !nowIds.has(id)) removed.push(id);

  const files = planWrite(root, cards, source);
  let wrote = 0;
  for (const [rel, text] of files) {
    const f = p(root, rel);
    if (exists(f) && read(f) === text) continue;
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, text);
    wrote++;
  }
  for (const id of removed) { fs.rmSync(p(root, "plugins", PLUGIN, "skills", id), { recursive: true, force: true }); wrote++; }

  let readme = read(p(root, "README.md"));
  const hashes = coupled.data;
  let hashesDirty = false;
  for (const [skill, e] of Object.entries(hashes.skills || {})) {
    const card = cards.find((c) => c.id === e.card);
    if (!card) { attention.push(`${skill}: card ${e.card} no longer exists on the site`); continue; }
    if (e.status !== "exact") {
      if (card.version !== e.cardVersion) attention.push(`${skill}: status ${e.status}, site card ${e.card} is now v${card.version} (repo copy based on v${e.cardVersion}) — merge by hand`);
      continue;
    }
    const target = p(root, e.path);
    if (exists(target) && read(target) === card.content && e.cardVersion === card.version) continue;
    const oldVersion = e.cardVersion;
    fs.writeFileSync(target, card.content);
    e.sha256 = sha256(card.content);
    e.cardVersion = card.version;
    hashesDirty = true;
    const v = setPluginVersion(root, skill, "patch");
    bumped[skill] = v;
    prependChangelog(root, skill, v, [`카드 \`${card.id}\` v${card.version}(${card.updatedAt}) 원문으로 \`references/prompt.md\` 를 자동 동기화했다(이전 v${oldVersion}).`]);
    readme = replaceReadmeVersion(readme, skill, v);
    for (const rel of [`plugins/${skill}/skills/${skill}/SKILL.md`, "docs/card-coupling.md", "README.md"]) {
      const f = p(root, rel);
      const cur = rel === "README.md" ? readme : read(f);
      const next = cur.split(`\`${card.id}\` v${oldVersion}`).join(`\`${card.id}\` v${card.version}`)
        .replace(new RegExp(`(\\| ${skill} \\| ${card.id} \\| )${oldVersion.replace(/\./g, "\\.")}( \\|)`), `$1${card.version}$2`)
        .replace(new RegExp(`(${card.id} v)${oldVersion.replace(/\./g, "\\.")}( \\(exact\\))`), `$1${card.version}$2`);
      if (rel === "README.md") readme = next; else if (next !== cur) fs.writeFileSync(f, next);
    }
    wrote++;
  }
  if (hashesDirty) fs.writeFileSync(coupled.file, JSON.stringify(hashes, null, 2) + "\n");

  if (before.length && (added.length || removed.length || changed.length)) {
    const level = added.length || removed.length ? "minor" : "patch";
    const v = setPluginVersion(root, PLUGIN, level);
    bumped[PLUGIN] = v;
    const lines = [
      ...added.map((id) => `카드 추가: \`${id}\` v${cards.find((c) => c.id === id).version}`),
      ...removed.map((id) => `카드 삭제: \`${id}\``),
      ...changed.map((id) => {
        const c = cards.find((x) => x.id === id), pv = beforeById.get(id).version;
        return pv === c.version ? `카드 본문 갱신: \`${id}\` v${c.version}` : `카드 갱신: \`${id}\` v${pv} → v${c.version}(${c.updatedAt})`;
      }),
    ];
    prependChangelog(root, PLUGIN, v, lines.map((l) => `${l} (자동 동기화)`));
    readme = replaceReadmeVersion(readme, PLUGIN, v);
  }
  if (readme !== read(p(root, "README.md"))) fs.writeFileSync(p(root, "README.md"), readme);
  return { source, cards: cards.length, added, removed, changed, bumped, attention, wrote };
}

export function checkPrompts(root = ROOT) {
  const problems = [];
  const idxFile = p(root, "prompts", "index.json");
  if (!exists(idxFile)) return ["prompts/index.json missing (run node scripts/sync-prompts.mjs)"];
  const idx = JSON.parse(read(idxFile));
  const coupled = loadCoupled(root);
  const cards = [];
  for (const c of idx.cards) {
    const f = p(root, c.path);
    if (!exists(f)) { problems.push(`${c.path}: missing`); continue; }
    const content = read(f);
    if (sha256(content) !== c.sha256) problems.push(`${c.path}: sha256 differs from prompts/index.json — card files are generated, do not edit them`);
    if (c.skill !== (coupled.byCard[c.id] || null)) problems.push(`prompts/index.json[${c.id}]: skill should be ${coupled.byCard[c.id] || null}`);
    cards.push({ ...c, content });
  }
  if (problems.length) return problems;
  for (const [rel, text] of planWrite(root, cards, idx.source)) {
    const f = p(root, rel);
    if (!exists(f)) problems.push(`${rel}: missing (generated file)`);
    else if (read(f) !== text) problems.push(`${rel}: differs from what sync-prompts.mjs generates`);
  }
  const ids = new Set(cards.map((c) => c.id));
  for (const d of skillDirsOnDisk(root)) if (d !== PLUGIN && !ids.has(d)) problems.push(`plugins/${PLUGIN}/skills/${d}: not in prompts/index.json`);
  for (const [skill, e] of Object.entries(coupled.data.skills || {})) {
    const card = cards.find((c) => c.id === e.card);
    if (!card) { problems.push(`docs/card-hashes.json[${skill}]: card ${e.card} not in prompts/index.json`); continue; }
    if (e.status !== "exact") continue;
    if (e.cardVersion !== card.version) problems.push(`docs/card-hashes.json[${skill}]: cardVersion ${e.cardVersion} but card ${e.card} is v${card.version}`);
    if (exists(p(root, e.path)) && read(p(root, e.path)) !== card.content) problems.push(`${e.path}: not byte-identical to ${card.path} (status exact)`);
  }
  return problems;
}

async function main() {
  const args = process.argv.slice(2);
  let source = DEFAULT_SOURCE, json = false, check = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--source") source = args[++i];
    else if (args[i] === "--json") json = true;
    else if (args[i] === "--check") check = true;
    else { console.error(`unknown argument ${args[i]}`); process.exit(2); }
  }
  if (check) {
    const problems = checkPrompts(ROOT);
    for (const m of problems) console.log(`ERROR ${m}`);
    console.log(`sync-prompts --check: ${problems.length} problem(s)`);
    process.exit(problems.length ? 1 : 0);
  }
  const r = await sync({ root: ROOT, source });
  if (json) console.log(JSON.stringify(r));
  else {
    console.log(`sync-prompts: ${r.cards} cards from ${r.source}`);
    for (const k of ["added", "removed", "changed"]) if (r[k].length) console.log(`  ${k}: ${r[k].join(", ")}`);
    for (const [n, v] of Object.entries(r.bumped)) console.log(`  bumped ${n} -> ${v}`);
    for (const a of r.attention) console.log(`  ATTENTION ${a}`);
    console.log(r.wrote ? `  ${r.wrote} file(s) written` : "  no changes");
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main().catch((e) => { console.error(e.message); process.exit(1); });
