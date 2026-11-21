#!/usr/bin/env bash
# Usage: bash scripts/setup-claude-code.sh [--skills a,b] [--dry-run] [--keep-personal-copies]
#        curl -fsSL https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.sh | bash
#        curl -fsSL https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.sh | bash -s -- --skills gmp,factcheck
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

MP=""
SRC="${BASH_SOURCE[0]:-}"
if [ -n "$SRC" ] && [ -f "$SRC" ]; then
  LOCAL="$(cd "$(dirname "$SRC")" && pwd)/../.claude-plugin/marketplace.json"
  if [ -f "$LOCAL" ] && grep -q "\"name\": *\"$MARKET\"" "$LOCAL"; then MP="$(cat "$LOCAL")"; fi
fi
[ -n "$MP" ] || MP="$(curl -fsSL "https://raw.githubusercontent.com/$REPO/main/.claude-plugin/marketplace.json")"
case "$JSONRUN" in
  node) ALL="$(printf '%s' "$MP" | node -e 'let d="";process.stdin.on("data",(c)=>d+=c).on("end",()=>console.log(JSON.parse(d.replace(/^\uFEFF/,"")).plugins.map((p)=>p.name).join("\n")))')" ;;
  python3) ALL="$(printf '%s' "$MP" | python3 -c 'import json,sys; print("\n".join(p["name"] for p in json.loads(sys.stdin.read().lstrip("\uFEFF"))["plugins"]))')" ;;
  *) ALL="$(printf '%s' "$MP" | grep -o '"name": *"[a-z0-9-]*"' | sed 's/.*"\([a-z0-9-]*\)"$/\1/' | grep -v "^$MARKET$" || true)" ;;
esac
if [ -n "$SKILLS" ]; then
  NAMES="$(printf '%s' "$SKILLS" | tr ', ' '\n\n' | grep -v '^$')"
  for n in $NAMES; do printf '%s\n' "$ALL" | grep -qx "$n" || { echo "unknown plugin: $n. Available: $(echo $ALL)" >&2; exit 2; }; done
else NAMES="$ALL"
fi
say "plugins: $(echo $NAMES)"

if command -v claude >/dev/null 2>&1 && [ "$DRY" = 0 ]; then
  export CLAUDE_CODE_PLUGIN_PREFER_HTTPS=1
  # `marketplace add` rewrites the settings entry without autoUpdate, so it runs only when the marketplace is new here.
  if ! { [ -f "$CONFIG_DIR/plugins/known_marketplaces.json" ] && grep -q "\"$MARKET\": *{" "$CONFIG_DIR/plugins/known_marketplaces.json"; }; then
    claude plugin marketplace add "$REPO" >/dev/null 2>&1 || true
  fi
  claude plugin marketplace update "$MARKET" >/dev/null 2>&1 || true
  INST="$CONFIG_DIR/plugins/installed_plugins.json"
  for n in $NAMES; do
    if [ -f "$INST" ] && grep -q "\"$n@$MARKET\"" "$INST"; then continue; fi
    if [ -f "$SETTINGS" ] && grep -q "\"$n@$MARKET\": *false" "$SETTINGS"; then say "kept $n@$MARKET disabled (you turned it off before)"; continue; fi
    say "install $n@$MARKET: $(claude plugin install "$n@$MARKET" 2>&1 | tail -1 || true)"
  done
elif ! command -v claude >/dev/null 2>&1; then
  say "claude CLI not on PATH: plugins will be downloaded at the next Claude Code session start from the settings below."
fi

NAMES_CSV="$(echo $NAMES | tr ' ' ',')"
if [ -z "$JSONRUN" ]; then
  say "neither node nor python3 found, so $SETTINGS was not edited. In Claude Code run /plugin, open Marketplaces, select $MARKET and turn on auto-update."
else
  mkdir -p "$CONFIG_DIR"
  if [ "$JSONRUN" = node ]; then
    SETTINGS="$SETTINGS" REPO="$REPO" MARKET="$MARKET" NAMES_CSV="$NAMES_CSV" STAMP="$STAMP" DRY="$DRY" node -e '
const fs = require("fs"); const e = process.env, f = e.SETTINGS, say = (m) => console.log("[actigence-skills] " + m);
const raw = fs.existsSync(f) ? fs.readFileSync(f, "utf8").replace(/^\uFEFF/, "") : "";
const s = raw.trim() ? JSON.parse(raw) : {};
const before = JSON.stringify(s);
s.extraKnownMarketplaces = s.extraKnownMarketplaces || {};
s.extraKnownMarketplaces[e.MARKET] = { ...(s.extraKnownMarketplaces[e.MARKET] || {}), source: { source: "github", repo: e.REPO }, autoUpdate: true };
s.enabledPlugins = s.enabledPlugins || {};
for (const n of e.NAMES_CSV.split(",").filter(Boolean)) { const k = n + "@" + e.MARKET; if (!(k in s.enabledPlugins)) s.enabledPlugins[k] = true; else if (s.enabledPlugins[k] === false) say("kept " + k + " disabled (you turned it off before)"); }
if (JSON.stringify(s) === before) say("settings already up to date: " + f);
else if (e.DRY === "1") say("would write " + f + " with extraKnownMarketplaces." + e.MARKET + ".autoUpdate=true");
else {
  let note = "";
  if (raw.trim()) { fs.writeFileSync(f + ".backup-" + e.STAMP, raw); note = " (previous copy: " + f + ".backup-" + e.STAMP + ")"; }
  fs.writeFileSync(f, JSON.stringify(s, null, 2) + "\n");
  say("settings updated: " + f + note);
}'
  else
    SETTINGS="$SETTINGS" REPO="$REPO" MARKET="$MARKET" NAMES_CSV="$NAMES_CSV" STAMP="$STAMP" DRY="$DRY" python3 - <<'PY'
import json, os
e = os.environ; f = e["SETTINGS"]; m = e["MARKET"]
say = lambda msg: print("[actigence-skills] " + msg)
raw = open(f, encoding="utf-8-sig").read() if os.path.exists(f) else ""
s = json.loads(raw) if raw.strip() else {}
before = json.dumps(s, sort_keys=True)
mk = s.setdefault("extraKnownMarketplaces", {})
entry = dict(mk.get(m) or {})
entry.update({"source": {"source": "github", "repo": e["REPO"]}, "autoUpdate": True})
mk[m] = entry
en = s.setdefault("enabledPlugins", {})
for n in [x for x in e["NAMES_CSV"].split(",") if x]:
    k = n + "@" + m
    if k not in en: en[k] = True
    elif en[k] is False: say("kept " + k + " disabled (you turned it off before)")
if json.dumps(s, sort_keys=True) == before:
    say("settings already up to date: " + f)
elif e["DRY"] == "1":
    say("would write " + f + " with extraKnownMarketplaces." + m + ".autoUpdate=true")
else:
    note = ""
    if raw.strip():
        open(f + ".backup-" + e["STAMP"], "w", encoding="utf-8").write(raw)
        note = " (previous copy: " + f + ".backup-" + e["STAMP"] + ")"
    with open(f, "w", encoding="utf-8") as fh:
        json.dump(s, fh, ensure_ascii=False, indent=2); fh.write("\n")
    say("settings updated: " + f + note)
PY
  fi
  # Same per-computer flag the /plugin auto-update toggle writes; it still applies if a later `claude plugin marketplace add` drops the settings value.
  KNOWN="$CONFIG_DIR/plugins/known_marketplaces.json"
  if [ "$DRY" = 0 ] && [ -f "$KNOWN" ]; then
    if [ "$JSONRUN" = node ]; then
      KNOWN="$KNOWN" MARKET="$MARKET" node -e 'const fs=require("fs"),f=process.env.KNOWN,m=process.env.MARKET;const k=JSON.parse(fs.readFileSync(f,"utf8").replace(/^\uFEFF/,""));if(k[m]&&k[m].autoUpdate!==true){k[m].autoUpdate=true;fs.writeFileSync(f,JSON.stringify(k,null,2)+"\n");console.log("[actigence-skills] auto-update also turned on in "+f)}'
    else
      KNOWN="$KNOWN" MARKET="$MARKET" python3 -c 'import json,os
f=os.environ["KNOWN"]; m=os.environ["MARKET"]; k=json.load(open(f,encoding="utf-8-sig"))
if m in k and k[m].get("autoUpdate") is not True:
    k[m]["autoUpdate"]=True; json.dump(k,open(f,"w",encoding="utf-8"),ensure_ascii=False,indent=2); print("[actigence-skills] auto-update also turned on in "+f)'
    fi
  fi
fi

for n in $NAMES; do
  p="$CONFIG_DIR/skills/$n"
  if [ -e "$p" ] && [ "$KEEP" = 0 ]; then
    dest="$CONFIG_DIR/skill-backups/$n-$STAMP"
    if [ "$DRY" = 1 ]; then say "would move personal copy $p -> $dest"
    else mkdir -p "$CONFIG_DIR/skill-backups"; mv "$p" "$dest"; say "moved personal copy $p -> $dest (it would load twice next to the plugin)"
    fi
  fi
  if [ -e "$CONFIG_DIR/skills/synced/$n" ] || ls -d "$CONFIG_DIR"/skills/synced/*/"$n" >/dev/null 2>&1; then
    say "WARNING: $n is also an upload synced from a claude.ai account (skills/synced). Disable that upload on claude.ai so the skill does not load twice."
  fi
done
[ "$DRY" = 1 ] || say "done. Restart Claude Code. Updates are pulled automatically after the first message of each session; new plugins added to the repo later need this script again."
