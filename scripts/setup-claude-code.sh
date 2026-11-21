#!/usr/bin/env bash
# Usage: bash scripts/setup-claude-code.sh [--skills a,b] [--dry-run] [--keep-personal-copies]
#        curl -fsSL https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.sh | bash
set -euo pipefail

REPO="yonghot/actigence-skills"
MARKET="actigence-skills"
CONFIG_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SETTINGS="$CONFIG_DIR/settings.json"
STAMP="$(date +%Y%m%d-%H%M%S)"
SKILLS=""
DRY=0
KEEP=0
while [ $# -gt 0 ]; do
  case "$1" in
    --skills) SKILLS="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --keep-personal-copies) KEEP=1; shift ;;
    *) echo "unknown argument $1" >&2; exit 2 ;;
  esac
done
say() { echo "[actigence-skills] $*"; }

JSONRUN=""
if command -v node >/dev/null 2>&1; then JSONRUN="node"
elif command -v python3 >/dev/null 2>&1 && python3 -c "import json" >/dev/null 2>&1; then JSONRUN="python3"
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || true)"
if [ -n "$HERE" ] && [ -f "$HERE/../.claude-plugin/marketplace.json" ]; then MP="$(cat "$HERE/../.claude-plugin/marketplace.json")"
else MP="$(curl -fsSL "https://raw.githubusercontent.com/$REPO/main/.claude-plugin/marketplace.json")"
fi
ALL="$(printf '%s' "$MP" | grep -o '"name": *"[a-z0-9-]*"' | sed 's/.*"\([a-z0-9-]*\)"$/\1/' | grep -v "^$MARKET$" || true)"
if [ -n "$SKILLS" ]; then
  NAMES="$(printf '%s' "$SKILLS" | tr ',' '\n' | sed 's/^ *//;s/ *$//' | grep -v '^$')"
  for n in $NAMES; do printf '%s\n' "$ALL" | grep -qx "$n" || { echo "unknown plugin: $n. Available: $(echo $ALL)" >&2; exit 2; }; done
else NAMES="$ALL"
fi
say "plugins: $(echo $NAMES)"

for n in $NAMES; do
  p="$CONFIG_DIR/skills/$n"
  if [ -e "$p" ] && [ "$KEEP" = 0 ]; then
    dest="$CONFIG_DIR/skill-backups/$n-$STAMP"
    if [ "$DRY" = 1 ]; then say "would move personal copy $p -> $dest"
    else mkdir -p "$CONFIG_DIR/skill-backups"; mv "$p" "$dest"; say "moved personal copy $p -> $dest (it would load twice next to the plugin)"
    fi
  fi
  [ -e "$CONFIG_DIR/skills/synced/$n" ] && say "WARNING: $n is also synced from claude.ai (skills/synced/$n). Disable or delete that upload on claude.ai so it does not load twice."
done

if command -v claude >/dev/null 2>&1 && [ "$DRY" = 0 ]; then
  export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1
  claude plugin marketplace add "$REPO" >/dev/null 2>&1 || true
  claude plugin marketplace update "$MARKET" >/dev/null 2>&1 || true
  INST="$CONFIG_DIR/plugins/installed_plugins.json"
  for n in $NAMES; do
    if [ -f "$INST" ] && grep -q "\"$n@$MARKET\"" "$INST"; then continue; fi
    if [ -f "$SETTINGS" ] && grep -q "\"$n@$MARKET\": *false" "$SETTINGS"; then say "kept $n@$MARKET disabled (you turned it off before)"; continue; fi
    say "install $n@$MARKET: $(claude plugin install "$n@$MARKET" 2>&1 | tail -1)"
  done
elif ! command -v claude >/dev/null 2>&1; then
  say "claude CLI not on PATH: plugins will be downloaded at the next Claude Code session start from the settings below."
fi

if [ "$DRY" = 1 ]; then say "would set extraKnownMarketplaces.$MARKET.autoUpdate=true and enable: $(echo $NAMES)"; exit 0; fi
if [ -z "$JSONRUN" ]; then
  say "neither node nor python3 found, so $SETTINGS was not edited. In Claude Code run /plugin, open Marketplaces, select $MARKET and turn on auto-update."
  exit 0
fi
mkdir -p "$CONFIG_DIR"
[ -f "$SETTINGS" ] && cp "$SETTINGS" "$SETTINGS.backup-$STAMP"
NAMES_CSV="$(echo $NAMES | tr ' ' ',')"
if [ "$JSONRUN" = node ]; then
  SETTINGS="$SETTINGS" REPO="$REPO" MARKET="$MARKET" NAMES_CSV="$NAMES_CSV" node -e '
const fs = require("fs"); const f = process.env.SETTINGS;
const s = fs.existsSync(f) && fs.readFileSync(f, "utf8").trim() ? JSON.parse(fs.readFileSync(f, "utf8")) : {};
s.extraKnownMarketplaces = s.extraKnownMarketplaces || {};
s.extraKnownMarketplaces[process.env.MARKET] = { ...(s.extraKnownMarketplaces[process.env.MARKET] || {}), source: { source: "github", repo: process.env.REPO }, autoUpdate: true };
s.enabledPlugins = s.enabledPlugins || {};
for (const n of process.env.NAMES_CSV.split(",").filter(Boolean)) { const k = n + "@" + process.env.MARKET; if (!(k in s.enabledPlugins)) s.enabledPlugins[k] = true; else if (s.enabledPlugins[k] === false) console.log("[actigence-skills] kept " + k + " disabled (you turned it off before)"); }
fs.writeFileSync(f, JSON.stringify(s, null, 2) + "\n");'
else
  SETTINGS="$SETTINGS" REPO="$REPO" MARKET="$MARKET" NAMES_CSV="$NAMES_CSV" python3 - <<'PY'
import json, os
f = os.environ["SETTINGS"]; m = os.environ["MARKET"]
s = {}
if os.path.exists(f) and open(f, encoding="utf-8").read().strip():
    s = json.load(open(f, encoding="utf-8"))
mk = s.setdefault("extraKnownMarketplaces", {})
entry = dict(mk.get(m) or {})
entry.update({"source": {"source": "github", "repo": os.environ["REPO"]}, "autoUpdate": True})
mk[m] = entry
en = s.setdefault("enabledPlugins", {})
for n in [x for x in os.environ["NAMES_CSV"].split(",") if x]:
    k = n + "@" + m
    if k not in en: en[k] = True
    elif en[k] is False: print("[actigence-skills] kept " + k + " disabled (you turned it off before)")
with open(f, "w", encoding="utf-8") as fh:
    json.dump(s, fh, ensure_ascii=False, indent=2); fh.write("\n")
PY
fi
say "settings updated: $SETTINGS (previous copy: $SETTINGS.backup-$STAMP)"
say "done. Restart Claude Code. Updates are pulled automatically after the first message of each session; new plugins added to the repo later need this script again."
