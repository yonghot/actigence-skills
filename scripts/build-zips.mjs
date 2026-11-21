#!/usr/bin/env node
// Builds dist/<skill>-<version>.zip per skill (top-level <skill>/ folder, forward slashes, fixed mtimes), then re-opens and verifies each zip.
// Usage: node scripts/build-zips.mjs [--skills a,b] [--out dist] [--no-verify]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { Report, validateSkillDir, walk, parseFrontmatter, loadAllow } from "./validate.mjs";
import { PLUGIN as PROMPTS_PLUGIN } from "./sync-prompts.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOS_TIME = 0;
const DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
const SKIP_NAME = /^(\.DS_Store|Thumbs\.db|desktop\.ini)$|\.(pyc|bak|orig)$/;

const args = process.argv.slice(2);
let only = null, outDir = path.join(ROOT, "dist"), verify = true;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--skills") only = args[++i].split(",").map((s) => s.trim()).filter(Boolean);
  else if (args[i] === "--out") outDir = path.resolve(args[++i]);
  else if (args[i] === "--no-verify") verify = false;
  else { console.error(`unknown argument ${args[i]}`); process.exit(2); }
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function buildZip(entries) {
  const locals = [], centrals = [];
  let offset = 0;
  for (const e of entries) {
    const name = Buffer.from(e.name, "utf8");
    const crc = crc32(e.data);
    let method = 0, body = e.data;
    if (!e.stored && e.data.length > 64) {
      const d = zlib.deflateRawSync(e.data, { level: 9 });
      if (d.length < e.data.length) { method = 8; body = d; }
    }
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(method, 8);
    lh.writeUInt16LE(DOS_TIME, 10); lh.writeUInt16LE(DOS_DATE, 12); lh.writeUInt32LE(crc, 14);
    lh.writeUInt32LE(body.length, 18); lh.writeUInt32LE(e.data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE((3 << 8) | 20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(method, 10);
    ch.writeUInt16LE(DOS_TIME, 12); ch.writeUInt16LE(DOS_DATE, 14); ch.writeUInt32LE(crc, 16);
    ch.writeUInt32LE(body.length, 20); ch.writeUInt32LE(e.data.length, 24); ch.writeUInt16LE(name.length, 28);
    ch.writeUInt32LE(((e.exec ? 0o100755 : 0o100644) << 16) >>> 0, 38); ch.writeUInt32LE(offset, 42);
    locals.push(lh, name, body);
    centrals.push(ch, name);
    offset += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, end]);
}

function readZip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error("end of central directory not found");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const out = [];
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("bad central directory entry");
    const method = buf.readUInt16LE(p + 10), crc = buf.readUInt32LE(p + 16), csize = buf.readUInt32LE(p + 20), usize = buf.readUInt32LE(p + 24);
    const nl = buf.readUInt16LE(p + 28), xl = buf.readUInt16LE(p + 30), cl = buf.readUInt16LE(p + 32), lo = buf.readUInt32LE(p + 42);
    const name = buf.slice(p + 46, p + 46 + nl).toString("utf8");
    const lnl = buf.readUInt16LE(lo + 26), lxl = buf.readUInt16LE(lo + 28);
    const raw = buf.slice(lo + 30 + lnl + lxl, lo + 30 + lnl + lxl + csize);
    const data = method === 8 ? zlib.inflateRawSync(raw) : raw;
    if (data.length !== usize) throw new Error(`${name}: size mismatch`);
    if (crc32(data) !== crc) throw new Error(`${name}: CRC mismatch`);
    out.push({ name, data });
    p += 46 + nl + xl + cl;
  }
  return out;
}

function collect(skillDir, skill) {
  const files = walk(skillDir).filter((f) => !SKIP_NAME.test(path.basename(f)));
  const rels = files.map((f) => ({ f, r: path.relative(skillDir, f).split(path.sep).join("/") }));
  rels.sort((a, b) => (a.r === "SKILL.md" ? -1 : b.r === "SKILL.md" ? 1 : a.r < b.r ? -1 : a.r > b.r ? 1 : 0));
  return rels.map(({ f, r }) => ({
    name: `${skill}/${r}`,
    data: fs.readFileSync(f),
    stored: path.basename(f) === "mimetype",
    exec: /\.sh$/.test(r),
  }));
}

function verifyZip(file, skill) {
  const problems = [];
  let entries;
  try { entries = readZip(fs.readFileSync(file)); } catch (e) { return [`${path.basename(file)}: ${e.message}`]; }
  for (const e of entries) {
    if (e.name.includes("\\") || e.name.startsWith("/") || e.name.split("/").includes("..") || /^[A-Za-z]:/.test(e.name)) problems.push(`bad entry name ${e.name}`);
    if (!e.name.startsWith(`${skill}/`)) problems.push(`entry outside top-level folder: ${e.name}`);
  }
  if (!entries.some((e) => e.name === `${skill}/SKILL.md`)) problems.push("SKILL.md not at <skill>/SKILL.md");
  if (problems.length) return problems;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "actigence-zip-"));
  try {
    for (const e of entries) {
      const dest = path.join(tmp, ...e.name.split("/"));
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, e.data);
    }
    const report = new Report();
    validateSkillDir(path.join(tmp, skill), { report, root: tmp, allow: loadAllow(ROOT) });
    for (const e of report.errors) problems.push(`unzipped validation: ${e}`);
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  return problems;
}

const pluginsDir = path.join(ROOT, "plugins");
const plugins = fs.existsSync(pluginsDir) ? fs.readdirSync(pluginsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort() : [];
fs.mkdirSync(outDir, { recursive: true });
let failed = 0, built = 0;
for (const pl of plugins) {
  const pj = path.join(pluginsDir, pl, ".claude-plugin", "plugin.json");
  const sdir = path.join(pluginsDir, pl, "skills");
  if (!fs.existsSync(pj) || !fs.existsSync(sdir)) { console.log(`skip ${pl}: incomplete plugin`); continue; }
  const version = JSON.parse(fs.readFileSync(pj, "utf8").replace(/^﻿/, "")).version;
  if (pl === PROMPTS_PLUGIN) {
    if (only && !only.includes(pl)) continue;
    const top = "actigence-prompt-cards";
    const files = fs.readdirSync(sdir).filter((id) => fs.existsSync(path.join(sdir, id, "references", "prompt.md")))
      .map((id) => ({ name: `${top}/${id}.md`, data: fs.readFileSync(path.join(sdir, id, "references", "prompt.md")) }));
    files.push({ name: `${top}/index.json`, data: fs.readFileSync(path.join(ROOT, "prompts", "index.json")) });
    const file = path.join(outDir, `${top}-${version}.zip`);
    fs.writeFileSync(file, buildZip(files));
    built++;
    const bad = verify ? readZip(fs.readFileSync(file)).filter((e) => !e.name.startsWith(`${top}/`) || e.name.includes("\\")) : [];
    if (bad.length) { failed++; console.error(`FAIL ${path.basename(file)}: bad entries ${bad.map((e) => e.name).join(", ")}`); }
    else console.log(`ok   ${path.basename(file)} (${fs.statSync(file).size} bytes, ${files.length - 1} cards; command-style skills are not built as claude.ai skill zips)`);
    continue;
  }
  for (const skill of fs.readdirSync(sdir)) {
    if (only && !only.includes(skill)) continue;
    const skillDir = path.join(sdir, skill);
    if (!fs.existsSync(path.join(skillDir, "SKILL.md"))) { console.log(`skip ${skill}: no SKILL.md`); continue; }
    const fm = parseFrontmatter(fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8"));
    if (fm.error || fm.data.name !== skill) { console.error(`FAIL ${skill}: invalid frontmatter`); failed++; continue; }
    const file = path.join(outDir, `${skill}-${version}.zip`);
    fs.writeFileSync(file, buildZip(collect(skillDir, skill)));
    built++;
    const problems = verify ? verifyZip(file, skill) : [];
    if (problems.length) { failed++; console.error(`FAIL ${path.basename(file)}`); problems.forEach((p) => console.error(`  ${p}`)); }
    else console.log(`ok   ${path.basename(file)} (${fs.statSync(file).size} bytes)${verify ? " verified" : ""}`);
  }
}
console.log(`\nbuild-zips: ${built} built, ${failed} failed`);
process.exit(failed || (only && !built) ? 1 : 0);
