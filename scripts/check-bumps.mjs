#!/usr/bin/env node
// Usage: node scripts/check-bumps.mjs <base-ref>
// Fails when files under plugins/<name>/ differ from <base-ref> but plugin.json version did not change:
// Claude Code installs by version, so such an edit would never reach any PC.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (...a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8" });

const base = process.argv[2];
if (!base || /^0+$/.test(base)) { console.log("check-bumps: no base commit, skipped"); process.exit(0); }
if (git("cat-file", "-e", `${base}^{commit}`).status !== 0) { console.log(`check-bumps: base ${base} not available, skipped`); process.exit(0); }

const changed = new Set();
for (const out of [git("diff", "--name-only", base).stdout, git("ls-files", "--others", "--exclude-standard").stdout]) {
  for (const f of (out || "").split("\n")) {
    const m = f.match(/^plugins\/([^/]+)\//);
    if (m) changed.add(m[1]);
  }
}
const problems = [];
for (const name of [...changed].sort()) {
  const pj = `plugins/${name}/.claude-plugin/plugin.json`;
  if (!fs.existsSync(path.join(ROOT, pj))) continue;
  const old = git("show", `${base}:${pj}`);
  if (old.status !== 0) continue;
  const was = JSON.parse(old.stdout).version, now = JSON.parse(fs.readFileSync(path.join(ROOT, pj), "utf8")).version;
  if (was === now) problems.push(`${name}: files changed since ${base.slice(0, 12)} but version is still ${now}; bump plugins/${name}/.claude-plugin/plugin.json and add a docs/changelog/${name}.md entry`);
}
for (const p of problems) console.log(`ERROR ${p}`);
console.log(`check-bumps: ${changed.size} plugin(s) changed, ${problems.length} without a version bump`);
process.exit(problems.length ? 1 : 0);
