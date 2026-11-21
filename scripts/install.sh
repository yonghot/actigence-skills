#!/usr/bin/env bash
# Manual installer for actigence-skills (macOS, Linux, Git Bash). Same behavior as install.ps1.
set -eu

MARKER=".installed-by-actigence-skills"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$(dirname "$HERE")"
HOME_DIR="${HOME:-$USERPROFILE}"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME_DIR/.claude}"
TARGET="$CLAUDE_DIR/skills"
ACTION="install"
DRY=0
ALL=0
FORCE=0
NAMES=""

usage() {
  cat <<'EOF'
Usage: install.sh [--list] [--all | --skills a,b] [--target DIR] [--source DIR] [--uninstall] [--dry-run] [--force]

  --list        show available skills and where each one is already installed
  --all         install every available skill
  --skills a,b  install only these skills
  --target DIR  skills folder to install into (default: ~/.claude/skills)
  --source DIR  clone root (has plugins/) or a folder of unzipped skill folders
  --uninstall   remove skills that carry the marker file written by this installer
  --dry-run     print what would happen, change nothing
  --force       install even if a synced/ or plugin copy of the skill exists

An existing same-name folder is moved to <target parent>/skill-backups/<name>-<timestamp>
(outside the skills folder, so it is not loaded as a skill).
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --list) ACTION="list" ;;
    --all) ALL=1 ;;
    --skills) [ $# -ge 2 ] || { echo "--skills needs a value" >&2; exit 2; }; shift; NAMES="$1" ;;
    --target) [ $# -ge 2 ] || { echo "--target needs a value" >&2; exit 2; }; shift; TARGET="$1" ;;
    --source) [ $# -ge 2 ] || { echo "--source needs a value" >&2; exit 2; }; shift; SOURCE="$1" ;;
    --uninstall) ACTION="uninstall" ;;
    --dry-run) DRY=1 ;;
    --force) FORCE=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "unknown argument: $1" >&2; usage >&2; exit 2 ;;
  esac
  shift
done

BACKUP_ROOT="$(dirname "$TARGET")/skill-backups"
PLUGINS_JSON="$CLAUDE_DIR/plugins/installed_plugins.json"

# prints "name<TAB>path" for each skill found in SOURCE
enumerate() {
  if [ -d "$SOURCE/plugins" ]; then
    for d in "$SOURCE"/plugins/*/skills/*/; do
      [ -f "${d}SKILL.md" ] && printf '%s\t%s\n' "$(basename "$d")" "${d%/}"
    done
  else
    for d in "$SOURCE"/*/; do
      [ -f "${d}SKILL.md" ] && printf '%s\t%s\n' "$(basename "$d")" "${d%/}"
    done
  fi
  return 0
}

SKILLS="$(enumerate)"
if [ -z "$SKILLS" ]; then
  echo "no skills found under $SOURCE (run from a clone, or pass --source with unzipped skill folders)" >&2
  exit 1
fi

path_of() { printf '%s\n' "$SKILLS" | awk -F '\t' -v n="$1" '$1==n {print $2}'; }

synced_copy() {
  for d in "$TARGET"/synced/*/"$1"; do
    [ -f "$d/SKILL.md" ] && { echo "$d"; return 0; }
  done
  return 1
}

plugin_copy() {
  [ -f "$PLUGINS_JSON" ] || return 1
  grep -o "\"$1@[^\"]*\"" "$PLUGINS_JSON" 2>/dev/null | head -n 1 | tr -d '"' | grep . || return 1
}

status_of() {
  s=""
  [ -f "$TARGET/$1/$MARKER" ] && s="$s installed-by-this-repo"
  if [ -d "$TARGET/$1" ] && [ ! -f "$TARGET/$1/$MARKER" ]; then s="$s personal-copy"; fi
  synced_copy "$1" >/dev/null && s="$s synced-copy"
  p="$(plugin_copy "$1" || true)"
  [ -n "$p" ] && s="$s plugin($p)"
  [ -z "$s" ] && s=" not-installed"
  echo "${s# }"
}

if [ "$ACTION" = "list" ]; then
  printf 'source: %s\ntarget: %s\n\n' "$SOURCE" "$TARGET"
  printf '%s\n' "$SKILLS" | while IFS="$(printf '\t')" read -r n p; do
    printf '%-26s %s\n' "$n" "$(status_of "$n")"
  done
  exit 0
fi

if [ "$ALL" = 1 ]; then
  SELECTED="$(printf '%s\n' "$SKILLS" | cut -f1)"
elif [ -n "$NAMES" ]; then
  SELECTED="$(printf '%s' "$NAMES" | tr ',' '\n' | sed 's/^ *//; s/ *$//' | grep .)"
else
  echo "choose --all or --skills a,b (or --list)" >&2
  usage >&2
  exit 2
fi

run() { if [ "$DRY" = 1 ]; then echo "[dry-run] $*"; else "$@"; fi; }
STAMP="$(date +%Y%m%d-%H%M%S)"
rc=0

for name in $SELECTED; do
  if [ "$ACTION" = "uninstall" ]; then
    if [ -f "$TARGET/$name/$MARKER" ]; then
      echo "remove    $name"
      run rm -rf "$TARGET/$name"
    elif [ -d "$TARGET/$name" ]; then
      echo "skip      $name (no marker file, not installed by this repo)"
    else
      echo "skip      $name (not installed)"
    fi
    continue
  fi

  src="$(path_of "$name")"
  if [ -z "$src" ]; then echo "unknown skill: $name" >&2; rc=1; continue; fi

  sc="$(synced_copy "$name" || true)"
  pc="$(plugin_copy "$name" || true)"
  if [ -n "$sc$pc" ] && [ "$FORCE" != 1 ]; then
    [ -n "$sc" ] && echo "WARN      $name: synced copy exists ($sc). Skipped to avoid duplicate triggers; use --force to install anyway."
    [ -n "$pc" ] && echo "WARN      $name: already installed as plugin $pc. Skipped to avoid duplicate triggers; use --force to install anyway."
    continue
  fi

  if [ -d "$TARGET/$name" ]; then
    bk="$BACKUP_ROOT/$name-$STAMP"
    echo "backup    $TARGET/$name -> $bk"
    run mkdir -p "$BACKUP_ROOT"
    run mv "$TARGET/$name" "$bk"
  fi
  echo "install   $name -> $TARGET/$name"
  run mkdir -p "$TARGET"
  run cp -R "$src" "$TARGET/$name"
  if [ "$DRY" != 1 ]; then
    find "$TARGET/$name" \( -name '__pycache__' -o -name '.DS_Store' \) -prune -exec rm -rf {} + 2>/dev/null || true
    printf 'source=actigence-skills\ninstalled=%s\n' "$STAMP" > "$TARGET/$name/$MARKER"
  fi
  if [ -d "$src/scripts" ] && ls "$src"/scripts/*.py >/dev/null 2>&1; then
    if command -v python3 >/dev/null 2>&1; then
      echo "          note: $name has Python scripts; install packages named in its SKILL.md with: python3 -m pip install <package>"
    elif command -v python >/dev/null 2>&1; then
      echo "          note: $name has Python scripts; install packages named in its SKILL.md with: python -m pip install <package>"
    else
      echo "          note: $name has Python scripts but python was not found on PATH"
    fi
  fi
done

exit $rc
