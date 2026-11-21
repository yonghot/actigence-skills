#!/usr/bin/env node
// Zero-dependency repo validator. Usage: node scripts/validate.mjs [plugin ...] [--update-card-hashes] [--root <dir>]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { checkPrompts, PLUGIN as PROMPTS_PLUGIN } from "./sync-prompts.mjs";

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_ROOT = path.resolve(path.dirname(SELF), "..");

const PENDING_SLOTS = new Set();
const COMMAND_KEYS = "argument-hint,description,disable-model-invocation,name";
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;
const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BINARY_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".ttf", ".otf", ".woff", ".woff2", ".docx", ".xlsx", ".pptx", ".pyc"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "__pycache__"]);
const JUNK_RE = /(\.bak|\.orig|~|\.swp|\.rej)$|^(\.DS_Store|Thumbs\.db|desktop\.ini)$/;

const HARD_PATHS = [
  { id: "windows-drive", re: /(?<![A-Za-z0-9])[A-Za-z]:[\\/]{1,2}(?=[A-Za-z0-9_.])/g },
  { id: "windows-drive-escaped", re: /(?<![A-Za-z0-9])[A-Za-z]:\\\\/g },
  { id: "unix-home", re: /(?<![A-Za-z0-9_.-])\/(Users|home)\/[A-Za-z]/g },
  { id: "mnt-skills", re: /\/mnt\/skills/g },
  { id: "mnt-user-data", re: /\/mnt\/user-data/g },
];

export class Report {
  constructor() { this.errors = []; this.warnings = []; }
  error(where, msg) { this.errors.push(`${where}: ${msg}`); }
  warn(where, msg) { this.warnings.push(`${where}: ${msg}`); }
}

const rel = (root, p) => path.relative(root, p).split(path.sep).join("/");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8").replace(/^﻿/, ""));
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");

export function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.isFile()) out.push(p);
  }
  return out;
}

export function isTextFile(p) {
  const base = path.basename(p);
  if (base === "mimetype") return false;
  return !BINARY_EXT.has(path.extname(p).toLowerCase());
}

function globToRe(g) {
  return new RegExp("^" + g.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*"));
}

export function loadAllow(root) {
  const p = path.join(root, "scripts", "validate-allow.json");
  if (!fs.existsSync(p)) return [];
  try { return readJson(p).allow || []; } catch { return []; }
}

function allowed(allow, file, text) {
  return allow.some((a) => (!a.file || globToRe(a.file).test(file)) && (!a.match || text.includes(a.match)));
}

export function parseFrontmatter(src) {
  const text = src.replace(/^﻿/, "");
  if (!text.startsWith("---\n")) return { error: "must start with a '---' line" };
  const end = text.indexOf("\n---", 4);
  if (end < 0) return { error: "frontmatter is not closed with '---'" };
  const block = text.slice(4, end);
  const afterEnd = text.indexOf("\n", end + 1);
  const body = afterEnd < 0 ? "" : text.slice(afterEnd + 1);
  const data = {};
  const problems = [];
  for (const [i, line] of block.split("\n").entries()) {
    if (!line.trim()) continue;
    const m = /^([A-Za-z_][\w-]*):[ \t]*(.*)$/.exec(line);
    if (!m) { problems.push(`line ${i + 2} is not a single-line "key: value" pair`); continue; }
    const [, k, v] = m;
    if (k in data) problems.push(`duplicate key ${k}`);
    if (/^".*"$/.test(v)) {
      try { data[k] = JSON.parse(v); } catch { problems.push(`${k}: invalid double-quoted string`); }
    } else if (k === "name" && NAME_RE.test(v)) {
      data[k] = v;
    } else if (k === "disable-model-invocation" && /^(true|false)$/.test(v)) {
      data[k] = v === "true";
    } else {
      problems.push(`${k}: value must be a single-line double-quoted string`);
      data[k] = v;
    }
  }
  return { data, body, problems };
}

function pyRunner() {
  for (const cmd of [["python"], ["python3"], ["py", "-3"]]) {
    const r = spawnSync(cmd[0], [...cmd.slice(1), "--version"], { encoding: "utf8" });
    if (r.status === 0) return cmd;
  }
  return null;
}
let PY;
const PY_CHECK = [
  "import ast,sys,os",
  "p=sys.argv[1]",
  "src=open(p,encoding='utf-8').read()",
  "compile(src,p,'exec')",
  "t=ast.parse(src)",
  "std=getattr(sys,'stdlib_module_names',None)",
  "mods=set()",
  "for n in ast.walk(t):",
  "  if isinstance(n,ast.Import): mods.update(a.name.split('.')[0] for a in n.names)",
  "  elif isinstance(n,ast.ImportFrom) and n.level==0 and n.module: mods.add(n.module.split('.')[0])",
  "local={f[:-3] for f in os.listdir(os.path.dirname(os.path.abspath(p))) if f.endswith('.py')}",
  "print(','.join(sorted(m for m in mods if std is not None and m not in std and m not in local)))",
].join("\n");

function checkScript(file, ctx) {
  const { report, root } = ctx;
  const where = rel(root, file);
  const ext = path.extname(file).toLowerCase();
  if (ext === ".mjs" || ext === ".js" || ext === ".cjs") {
    const r = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    if (r.status !== 0) report.error(where, `node --check failed: ${(r.stderr || "").trim().split("\n")[0]}`);
  } else if (ext === ".py") {
    if (PY === undefined) PY = pyRunner();
    if (!PY) { report.warn(where, "python not found, syntax check skipped"); return; }
    const r = spawnSync(PY[0], [...PY.slice(1), "-c", PY_CHECK, file], { encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" } });
    if (r.status !== 0) { report.error(where, `python compile failed: ${(r.stderr || "").trim().split("\n").pop()}`); return; }
    const third = (r.stdout || "").trim().split("\n").pop().split(",").filter(Boolean);
    if (third.length) {
      const src = fs.readFileSync(file, "utf8");
      if (!/ImportError|ModuleNotFoundError/.test(src)) report.error(where, `third-party import (${third.join(", ")}) without ImportError install hint`);
      else if (!/pip install/.test(src)) report.error(where, "ImportError handler does not print a 'pip install' hint");
    }
  } else if (ext === ".sh") {
    const r = spawnSync("bash", ["-n", file], { encoding: "utf8" });
    if (r.error) report.warn(where, "bash not found, syntax check skipped");
    else if (r.status !== 0) report.error(where, `bash -n failed: ${(r.stderr || "").trim().split("\n")[0]}`);
  }
}

export function validateSkillDir(skillDir, ctx) {
  const { report, root, allow } = ctx;
  const where = rel(root, skillDir);
  const folder = path.basename(skillDir);
  const skillMd = path.join(skillDir, "SKILL.md");
  if (!fs.existsSync(skillMd)) { report.error(where, "SKILL.md missing"); return; }
  const raw = fs.readFileSync(skillMd);
  const src = raw.toString("utf8");
  const fm = parseFrontmatter(src);
  const w = `${where}/SKILL.md`;
  if (fm.error) { report.error(w, `frontmatter: ${fm.error}`); return; }
  for (const p of fm.problems) report.error(w, `frontmatter: ${p}`);
  const keys = Object.keys(fm.data).sort();
  const promptSkill = where.startsWith(`plugins/${PROMPTS_PLUGIN}/`);
  if (promptSkill ? !["description,name", "description,disable-model-invocation,name", COMMAND_KEYS].includes(keys.join(",")) : keys.join(",") !== "description,name") report.error(w, `frontmatter keys must be exactly name and description${promptSkill ? " (plus disable-model-invocation, argument-hint)" : ""} (found: ${keys.join(", ") || "none"})`);
  const { name, description } = fm.data;
  if (name !== folder) report.error(w, `frontmatter name "${name}" must equal folder name "${folder}"`);
  if (name && !NAME_RE.test(name)) report.error(w, `name "${name}" must be lowercase letters, digits and hyphens`);
  if (typeof description !== "string" || !description.trim()) report.error(w, "description is empty");
  else {
    const len = [...description].length;
    if (len > 1024) report.error(w, `description is ${len} chars (hard limit 1024)`);
    else if (len > 500) report.warn(w, `description is ${len} chars (target <= 450, warning above 500)`);
    if (/반드시/.test(description)) report.warn(w, 'description contains "반드시"');
  }
  const lines = fm.body.split("\n").length;
  if (lines > 500) report.warn(w, `SKILL.md body is ${lines} lines (> 500)`);

  const refRe = /(?<![\w./-])((?:references|scripts|templates)\/[A-Za-z0-9_][A-Za-z0-9_./-]*)/g;
  const seen = new Set();
  for (const m of src.matchAll(refRe)) {
    let p = m[1].replace(/[.,;:)\]]+$/, "");
    if (seen.has(p) || /[<>*{}]/.test(p)) continue;
    seen.add(p);
    if (/\/$/.test(p)) { if (!fs.existsSync(path.join(skillDir, p))) report.error(w, `referenced folder missing: ${p}`); continue; }
    if (!fs.existsSync(path.join(skillDir, p))) report.error(w, `referenced path missing: ${p}`);
  }

  for (const re of [/data\/prompts\.json/, /actigence-next/i, /Actigence[\\/]/, /actigence\.ai\/vibe-coding-prompts/i, /로컬 분기/]) {
    if (re.test(src)) report.error(w, `site-internal reference must not appear in SKILL.md: ${re}`);
  }
  if (src.includes("!`")) report.error(w, "shell placeholder !` is not allowed in SKILL.md (Claude Code runs it when the skill is invoked)");

  for (const f of walk(skillDir)) {
    const fr = rel(root, f);
    const base = path.basename(f);
    if (JUNK_RE.test(base)) report.error(fr, "leftover/backup file must not be committed");
    if (!isTextFile(f)) continue;
    const buf = fs.readFileSync(f);
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) report.error(fr, "UTF-8 BOM not allowed");
    const text = buf.toString("utf8");
    if (text.includes("\r")) report.error(fr, "CRLF/CR line endings not allowed (use LF)");
    if (text.includes("�")) report.error(fr, "invalid UTF-8 (U+FFFD found)");
    text.split("\n").forEach((line, i) => {
      for (const { id, re } of HARD_PATHS) {
        for (const m of line.matchAll(re)) {
          const ctxText = line.slice(Math.max(0, m.index - 2), m.index + m[0].length + 40);
          if (!allowed(allow, fr, ctxText)) report.error(`${fr}:${i + 1}`, `hard-coded path (${id}): ${ctxText.trim().slice(0, 60)}`);
        }
      }
    });
    if (/\.(mjs|js|cjs|py|sh)$/.test(base)) checkScript(f, ctx);
  }
}

function checkDeny(root, report, names) {
  let deny = { names: [], prefixes: [] };
  try { deny = readJson(path.join(root, "scripts", "deny-skills.json")); } catch { report.warn("scripts/deny-skills.json", "missing or unreadable"); }
  for (const [where, n] of names) {
    if (!n) continue;
    if (deny.names.includes(n) || deny.prefixes.some((p) => n === p || n.startsWith(p))) report.error(where, `"${n}" is on the third-party deny-list`);
  }
}

function checkCardHashes(root, report, update) {
  const p = path.join(root, "docs", "card-hashes.json");
  if (!fs.existsSync(p)) { report.error("docs/card-hashes.json", "missing"); return; }
  let data;
  try { data = readJson(p); } catch (e) { report.error("docs/card-hashes.json", `invalid JSON: ${e.message}`); return; }
  let changed = false;
  for (const [skill, e] of Object.entries(data.skills || {})) {
    const file = path.join(root, e.path || "");
    const where = `docs/card-hashes.json[${skill}]`;
    if (!["exact", "ahead-of-card"].includes(e.status)) report.error(where, `status must be exact or ahead-of-card (got ${e.status})`);
    if (!fs.existsSync(file)) {
      if (PENDING_SLOTS.has(skill)) report.warn(where, "skill slot not filled yet, hash check skipped");
      else report.warn(where, `${e.path} not present yet, hash check skipped`);
      continue;
    }
    const buf = fs.readFileSync(file);
    if (buf.includes(13)) report.error(e.path, "prompt.md must use LF line endings");
    const h = sha256(buf);
    if (update) { if (e.sha256 !== h) { e.sha256 = h; changed = true; } continue; }
    if (!e.sha256) report.warn(where, "sha256 not recorded yet (run --update-card-hashes after the skill is final)");
    else if (e.sha256 !== h) report.error(e.path, `prompt.md differs from recorded hash (${e.status}); card-coupled files must stay byte-exact. If the card was revised on purpose, run --update-card-hashes and record why.`);
  }
  if (update && changed) { fs.writeFileSync(p, JSON.stringify(data, null, 2) + "\n"); console.log("docs/card-hashes.json updated"); }
  const coupled = new Set(Object.keys(data.skills || {}));
  const pluginsDir = path.join(root, "plugins");
  if (fs.existsSync(pluginsDir)) for (const pl of fs.readdirSync(pluginsDir)) {
    const pm = path.join(pluginsDir, pl, "skills", pl, "references", "prompt.md");
    if (fs.existsSync(pm) && !coupled.has(pl)) report.warn(`plugins/${pl}`, "has references/prompt.md but is not listed in docs/card-hashes.json");
  }
}

function checkWrapperAnchors(root, report) {
  const dir = path.join(root, "plugins", "oneshot-prototyping", "skills", "oneshot-prototyping");
  const wrap = path.join(dir, "SKILL.md"), card = path.join(dir, "references", "prompt.md");
  if (!fs.existsSync(wrap) || !fs.existsSync(card)) return;
  const lines = fs.readFileSync(card, "utf8").split("\n");
  let rows = 0;
  for (const l of fs.readFileSync(wrap, "utf8").split("\n")) {
    if (!l.startsWith("| ") || l.startsWith("| 블록") || l.startsWith("|---")) continue;
    const cells = l.split("|").slice(1, -1).map((c) => c.trim());
    const anchors = [...(cells[1] || "").matchAll(/``\s?(.+?)\s?``|`([^`]+)`/g)].map((m) => m[1] || m[2]).filter((a) => a.startsWith("^"));
    if (!anchors.length) continue;
    rows++;
    for (const a of anchors) {
      let re;
      try { re = new RegExp(a); } catch (e) { report.error("plugins/oneshot-prototyping/skills/oneshot-prototyping/SKILL.md", `block anchor is not a valid regex: ${a}`); continue; }
      const hits = lines.filter((x) => re.test(x)).length;
      if (hits !== 1) report.error("plugins/oneshot-prototyping/skills/oneshot-prototyping/SKILL.md", `block anchor ${a} matches ${hits} card lines (must be exactly 1)`);
    }
  }
  if (!rows) report.error("plugins/oneshot-prototyping/skills/oneshot-prototyping/SKILL.md", "block index table not found");
}

function checkShared(root, report) {
  const gen = path.join(root, "shared", "build-design-rules.mjs");
  if (!fs.existsSync(gen)) return;
  const r = spawnSync(process.execPath, [gen, "--check"], { encoding: "utf8" });
  if (r.status !== 0) report.error("shared/design-rules", `derived copies differ from source (S6); run: node shared/build-design-rules.mjs. ${(r.stderr || r.stdout || "").trim().split(/\r?\n/).join("; ")}`);
}

export function validateRepo({ root = DEFAULT_ROOT, only = [], updateCardHashes = false } = {}) {
  const report = new Report();
  const allow = loadAllow(root);
  const ctx = { report, root, allow };
  for (const f of ["LICENSE", "README.md", ".gitattributes"]) if (!fs.existsSync(path.join(root, f))) report.error(f, "missing");

  let market = null;
  const mp = path.join(root, ".claude-plugin", "marketplace.json");
  if (!fs.existsSync(mp)) report.error(".claude-plugin/marketplace.json", "missing");
  else {
    try { market = readJson(mp); } catch (e) { report.error(".claude-plugin/marketplace.json", `invalid JSON: ${e.message}`); }
  }
  const entries = new Map();
  if (market) {
    const w = ".claude-plugin/marketplace.json";
    if (market.name !== "actigence-skills") report.error(w, `name must be "actigence-skills"`);
    if (!market.owner || !market.owner.name) report.error(w, "owner.name missing");
    if (!Array.isArray(market.plugins) || !market.plugins.length) report.error(w, "plugins[] missing or empty");
    for (const e of market.plugins || []) {
      if (!e.name || !e.source) { report.error(w, `entry needs name and source: ${JSON.stringify(e)}`); continue; }
      if (entries.has(e.name)) report.error(w, `duplicate entry ${e.name}`);
      entries.set(e.name, e);
      if (e.source !== `./plugins/${e.name}`) report.error(w, `entry ${e.name}: source must be ./plugins/${e.name} (got ${e.source})`);
      if ("version" in e) report.warn(w, `entry ${e.name}: do not duplicate version here, plugin.json is the single source`);
      if (!e.description) report.warn(w, `entry ${e.name}: description missing`);
    }
  }

  const pluginsDir = path.join(root, "plugins");
  const dirs = fs.existsSync(pluginsDir) ? fs.readdirSync(pluginsDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : [];
  const denyNames = [];
  const promptIdx = path.join(root, "prompts", "index.json");
  const cardIds = new Set(fs.existsSync(promptIdx) ? readJson(promptIdx).cards.map((c) => c.id) : []);
  for (const [name] of entries) {
    if (!dirs.includes(name)) {
      if (PENDING_SLOTS.has(name)) report.warn(`plugins/${name}`, "slot not filled yet (filled by a separate effort)");
      else report.error(`plugins/${name}`, "listed in marketplace.json but folder is missing");
    }
  }
  for (const d of dirs) {
    if (only.length && !only.includes(d)) continue;
    const pdir = path.join(pluginsDir, d);
    const where = `plugins/${d}`;
    denyNames.push([where, d]);
    if (!entries.has(d)) report.error(where, "folder is not listed in marketplace.json");
    const pj = path.join(pdir, ".claude-plugin", "plugin.json");
    if (!fs.existsSync(pj)) report.error(`${where}/.claude-plugin/plugin.json`, "missing");
    else {
      try {
        const j = readJson(pj);
        const w = `${where}/.claude-plugin/plugin.json`;
        if (j.name !== d) report.error(w, `name "${j.name}" must equal folder "${d}"`);
        if (typeof j.version !== "string" || !SEMVER.test(j.version)) report.error(w, `version must be semver (got ${JSON.stringify(j.version)})`);
        if (!j.description) report.error(w, "description missing");
        if (!j.author || j.author.name !== "ACTIGENCE") report.error(w, 'author.name must be "ACTIGENCE"');
        if (j.license !== "MIT") report.error(w, 'license must be "MIT"');
        if (j.repository !== "https://github.com/yonghot/actigence-skills") report.error(w, "repository URL mismatch");
        if (!Array.isArray(j.keywords) || !j.keywords.length) report.warn(w, "keywords missing");
      } catch (e) { report.error(`${where}/.claude-plugin/plugin.json`, `invalid JSON: ${e.message}`); }
    }
    const sdir = path.join(pdir, "skills");
    if (!fs.existsSync(sdir)) { report.error(where, "skills/ folder missing"); continue; }
    const skills = fs.readdirSync(sdir, { withFileTypes: true }).filter((s) => s.isDirectory()).map((s) => s.name);
    if (!skills.length) report.error(where, "no skill folder under skills/");
    if (!skills.includes(d)) report.warn(where, `expected skills/${d}/ (plugin and skill share one name)`);
    for (const s of skills) {
      if (!(d === PROMPTS_PLUGIN && cardIds.has(s))) denyNames.push([`${where}/skills/${s}`, s]);
      validateSkillDir(path.join(sdir, s), ctx);
    }
    for (const f of walk(pdir)) {
      const base = path.basename(f);
      if (JUNK_RE.test(base) && !f.includes(`${path.sep}skills${path.sep}`)) report.error(rel(root, f), "leftover/backup file must not be committed");
    }
  }
  checkDeny(root, report, denyNames);

  if (!only.length) {
    for (const f of walk(root)) {
      const r = rel(root, f);
      if (r.startsWith("plugins/") || !isTextFile(f)) continue;
      const buf = fs.readFileSync(f);
      if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) report.error(r, "UTF-8 BOM not allowed");
      if (buf.includes(13)) report.error(r, "CRLF/CR line endings not allowed (use LF)");
      if (JUNK_RE.test(path.basename(f))) report.error(r, "leftover/backup file must not be committed");
      if (r.startsWith("scripts/") && /\.(mjs|js|py|sh)$/.test(r)) checkScript(f, ctx);
    }
    checkCardHashes(root, report, updateCardHashes);
    for (const m of checkPrompts(root)) report.error("prompts", m);
    checkWrapperAnchors(root, report);
    checkShared(root, report);
  }
  return report;
}

function main() {
  const args = process.argv.slice(2);
  let root = DEFAULT_ROOT;
  const only = [];
  let update = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--root") root = path.resolve(args[++i]);
    else if (args[i] === "--update-card-hashes") update = true;
    else if (args[i].startsWith("--")) { console.error(`unknown flag ${args[i]}`); process.exit(2); }
    else only.push(path.basename(args[i].replace(/[\\/]+$/, "")));
  }
  const report = validateRepo({ root, only, updateCardHashes: update });
  for (const w of report.warnings) console.log(`WARN  ${w}`);
  for (const e of report.errors) console.log(`ERROR ${e}`);
  console.log(`\nvalidate: ${report.errors.length} error(s), ${report.warnings.length} warning(s)`);
  process.exit(report.errors.length ? 1 : 0);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
