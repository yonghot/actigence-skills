#!/usr/bin/env node
// Pre-publication secret / personal-data scan. Usage: node scripts/scan.mjs [--root <dir>] [--verbose]
// Allow-list: scripts/scan-allow.json (justified, committed). Blocklist of personal strings: scripts/.scan-blocklist.local (local only, gitignored).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);
let root = path.resolve(path.dirname(SELF), "..");
const args = process.argv.slice(2);
for (let i = 0; i < args.length; i++) if (args[i] === "--root") root = path.resolve(args[++i]);

const SKIP_DIRS = new Set([".git", "node_modules", "dist"]);
const BINARY_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".ttf", ".otf", ".woff", ".woff2", ".pyc", ".hwpx", ".docx", ".xlsx", ".pptx"]);
const JUNK_FILE = /(\.bak|\.orig|~|\.swp|\.rej)$|^(\.DS_Store|Thumbs\.db)$/;
const ENV_FILE = /^\.env(\..+)?$/;
const PLACEHOLDER_EMAIL = /@(example\.(com|org|net)|users\.noreply\.github\.com)$/i;
const PLACEHOLDER_PHONE = /^(010-?0000-?0000|010-?1234-?5678|010-?0000-?\d{4}|010-?XXXX-?XXXX)$/i;
const PLACEHOLDER_BRN = /^(000-00-00000|123-45-67890|111-11-11111|123-45-12345)$/;

const rules = [
  { id: "user-path-windows", re: /(?<![A-Za-z0-9])[A-Za-z]:[\\/]{1,2}Users[\\/]{1,2}[A-Za-z0-9_.-]+/g },
  { id: "dev-folder-path", re: new RegExp("(?<![A-Za-z0-9])[A-Za-z]:[\\\\/]{1,2}Claude" + "Code", "g") },
  { id: "user-path-unix", re: /(?<![A-Za-z0-9_.-])\/(Users|home)\/[A-Za-z][A-Za-z0-9_.-]*/g },
  { id: "aws-key", re: /AKIA[0-9A-Z]{16}/g, secret: true },
  { id: "github-token", re: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}/g, secret: true },
  { id: "openai-or-anthropic-key", re: /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/g, secret: true },
  { id: "google-api-key", re: /AIza[0-9A-Za-z_-]{35}/g, secret: true },
  { id: "slack-token", re: /xox[baprs]-[0-9A-Za-z-]{10,}/g, secret: true },
  { id: "jwt", re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}/g, secret: true },
  { id: "private-key-block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, secret: true },
  { id: "credential-assignment", re: /\b(api[_-]?key|secret|access[_-]?token|auth[_-]?token|password|passwd)\b["']?\s*[:=]\s*["']?(?![<{$(%\[])[A-Za-z0-9_\-/+=.]{16,}/gi, secret: true },
  { id: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, skip: (m) => PLACEHOLDER_EMAIL.test(m) },
  { id: "kr-mobile", re: /(?<![\d-])01[016789]-?\d{3,4}-?\d{4}(?![\d-])/g, skip: (m) => PLACEHOLDER_PHONE.test(m) },
  { id: "kr-landline", re: /(?<![\d-])0(?:2|[3-6][1-5])-\d{3,4}-\d{4}(?![\d-])/g, skip: (m) => /-(0000|1234)-?\d{4}$/.test(m) },
  { id: "kr-resident-number", re: /(?<![\d-])\d{6}-[1-4]\d{6}(?![\d-])/g, secret: true },
  { id: "kr-company-name", re: /(?:\(주\)|주식회사)\s?[가-힣]{2,}/g, skip: (m) => /(OO테크|가나다랩|샘플기획|예시상사|OO)/.test(m) },
  { id: "kr-business-number", re: /(?<![\d-])\d{3}-\d{2}-\d{5}(?![\d-])/g, skip: (m) => PLACEHOLDER_BRN.test(m) },
];

function globToRe(g) {
  return new RegExp("^" + g.split("*").map((s) => s.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*"));
}

let allow = [];
const allowFile = path.join(root, "scripts", "scan-allow.json");
if (fs.existsSync(allowFile)) {
  try {
    allow = JSON.parse(fs.readFileSync(allowFile, "utf8")).allow || [];
  } catch (e) { console.error(`scan-allow.json unreadable: ${e.message}`); process.exit(2); }
  for (const a of allow) if (!a.reason || !a.rule) { console.error("scan-allow.json: every entry needs rule and reason"); process.exit(2); }
}
const isAllowed = (rule, file, text) => allow.some((a) => a.rule === rule && (!a.file || globToRe(a.file).test(file)) && (!a.match || text.includes(a.match)));

const blocklist = [];
const blFile = path.join(root, "scripts", ".scan-blocklist.local");
if (fs.existsSync(blFile)) {
  for (const l of fs.readFileSync(blFile, "utf8").split(/\r?\n/)) {
    const t = l.trim();
    if (!t || t.startsWith("#")) continue;
    if (t.startsWith("re:")) { try { blocklist.push(new RegExp(t.slice(3), "i")); } catch { /* ignore bad pattern */ } }
    else blocklist.push(new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else if (e.isFile()) out.push(p);
  }
  return out;
}

const redact = (s, secret) => (secret ? s.slice(0, 4) + "..." + `(${s.length} chars)` : s.length > 80 ? s.slice(0, 77) + "..." : s);

const findings = [];
let scanned = 0;
for (const f of walk(root)) {
  const r = path.relative(root, f).split(path.sep).join("/");
  const base = path.basename(f);
  if (r === "scripts/.scan-blocklist.local") continue;
  if (JUNK_FILE.test(base)) { findings.push([r, 0, "leftover-file", base]); continue; }
  if (ENV_FILE.test(base) && base !== ".env.example") { findings.push([r, 0, "env-file", base]); continue; }
  if (BINARY_EXT.has(path.extname(f).toLowerCase())) continue;
  const buf = fs.readFileSync(f);
  if (buf.includes(0)) continue;
  scanned++;
  const lines = buf.toString("utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const rule of rules) {
      for (const m of line.matchAll(rule.re)) {
        const text = m[0];
        if (rule.skip && rule.skip(text)) continue;
        if (isAllowed(rule.id, r, text)) continue;
        findings.push([r, i + 1, rule.id, redact(text, rule.secret)]);
      }
    }
    blocklist.forEach((re, bi) => { if (re.test(line) && !isAllowed("blocklist", r, "")) findings.push([r, i + 1, "blocklist", `local blocklist entry #${bi + 1}`]); });
  });
}

for (const [file, line, rule, text] of findings) console.log(`${file}${line ? ":" + line : ""}  [${rule}]  ${text}`);
console.log(`\nscan: ${scanned} text file(s) scanned, ${findings.length} finding(s)${blocklist.length ? `, ${blocklist.length} local blocklist entr${blocklist.length === 1 ? "y" : "ies"} applied` : ", no local blocklist present"}`);
process.exit(findings.length ? 1 : 0);
