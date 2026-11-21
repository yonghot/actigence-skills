# Usage: powershell -ExecutionPolicy Bypass -File scripts\setup-claude-code.ps1 [-Skills a,b] [-DryRun] [-KeepPersonalCopies]
#        irm https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.ps1 | iex
#        & ([scriptblock]::Create((irm https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.ps1))) -Skills gmp,factcheck
param(
  [string[]]$Skills = @(),
  [switch]$DryRun,
  [switch]$KeepPersonalCopies
)
$__prevEap = $ErrorActionPreference
$__prevHttps = $env:CLAUDE_CODE_PLUGIN_PREFER_HTTPS
$ErrorActionPreference = 'Stop'
try {
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$Repo = 'yonghot/actigence-skills'
$Market = 'actigence-skills'
$ConfigDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$SettingsPath = Join-Path $ConfigDir 'settings.json'
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

function Say($m) { Write-Host "[actigence-skills] $m" }
# PowerShell 5.1 drops embedded double quotes from native arguments, so the node code uses single quotes only.
function Format-JsonFile($file) {
  if (Get-Command node -CommandType Application -ErrorAction SilentlyContinue) { & node -e 'const fs=require(''fs''),f=process.argv[1];fs.writeFileSync(f,JSON.stringify(JSON.parse(fs.readFileSync(f,''utf8'')),null,2)+String.fromCharCode(10))' $file }
}
function FromJson($text) {
  if ($PSVersionTable.PSVersion -ge [version]'7.5') { return $text | ConvertFrom-Json -DateKind String }
  return $text | ConvertFrom-Json
}

$localMarket = if ($PSScriptRoot) { Join-Path (Split-Path $PSScriptRoot -Parent) '.claude-plugin\marketplace.json' } else { '' }
if ($localMarket -and (Test-Path $localMarket)) { $mp = FromJson ([IO.File]::ReadAllText($localMarket)) }
else {
  $r = Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/$Repo/main/.claude-plugin/marketplace.json"
  $mp = FromJson ([Text.Encoding]::UTF8.GetString($r.RawContentStream.ToArray()))
}
$all = @($mp.plugins | ForEach-Object { $_.name })
$names = $all
$wanted = @($Skills | ForEach-Object { $_ -split '[,\s]+' } | Where-Object { $_ })
if ($wanted.Count) {
  $names = $wanted
  $bad = @($names | Where-Object { $all -notcontains $_ })
  if ($bad.Count) { throw "unknown plugin(s): $($bad -join ', '). Available: $($all -join ', ')" }
}
Say "plugins: $($names -join ', ')"

$offBefore = @()
$raw = if (Test-Path $SettingsPath) { [IO.File]::ReadAllText($SettingsPath) } else { '' }
if ($raw.Trim()) {
  $preObj = FromJson $raw
  if ($preObj.enabledPlugins) { $offBefore = @($preObj.enabledPlugins.PSObject.Properties | Where-Object { $_.Value -eq $false } | ForEach-Object { $_.Name }) }
}

$claude = Get-Command claude -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
if ($claude -and -not $DryRun) {
  $env:CLAUDE_CODE_PLUGIN_PREFER_HTTPS = '1'
  # Native stderr must not abort the script (PowerShell 5.1 turns it into a terminating error under 'Stop').
  $ErrorActionPreference = 'Continue'
  try {
    # `marketplace add` rewrites the settings entry without autoUpdate, so it runs only when the marketplace is new here.
    $knownFile = Join-Path $ConfigDir 'plugins\known_marketplaces.json'
    $isKnown = (Test-Path $knownFile) -and ((FromJson ([IO.File]::ReadAllText($knownFile))).PSObject.Properties.Name -contains $Market)
    if (-not $isKnown) { & $claude.Source plugin marketplace add $Repo 2>&1 | Out-Null }
    & $claude.Source plugin marketplace update $Market 2>&1 | Out-Null
    $installedFile = Join-Path $ConfigDir 'plugins\installed_plugins.json'
    $installed = @()
    if (Test-Path $installedFile) { $installed = @((FromJson ([IO.File]::ReadAllText($installedFile))).plugins.PSObject.Properties.Name) }
    foreach ($n in $names) {
      if ($installed -contains "$n@$Market" -or $offBefore -contains "$n@$Market") { continue }
      $out = & $claude.Source plugin install "$n@$Market" 2>&1 | Select-Object -Last 1
      Say "install $n@${Market}: $out"
    }
  } finally { $ErrorActionPreference = 'Stop' }
} elseif (-not $claude) {
  Say "claude CLI not on PATH: plugins will be downloaded at the next Claude Code session start from the settings below."
}

if (Test-Path $SettingsPath) { $raw = [IO.File]::ReadAllText($SettingsPath) }
$s = if ($raw.Trim()) { FromJson $raw } else { [pscustomobject]@{} }
$dirty = $false
function EnsureObj($obj, $name) {
  if (-not ($obj.PSObject.Properties.Name -contains $name) -or $null -eq $obj.$name) { $obj | Add-Member -Force -NotePropertyName $name -NotePropertyValue ([pscustomobject]@{}) }
  return $obj.$name
}
$markets = EnsureObj $s 'extraKnownMarketplaces'
$wantSource = [pscustomobject]@{ source = 'github'; repo = $Repo }
if ($markets.PSObject.Properties.Name -contains $Market -and $markets.$Market -is [pscustomobject]) {
  $entry = $markets.$Market
  $src = $entry.source
  if (-not ($src -is [pscustomobject] -and $src.source -eq 'github' -and $src.repo -eq $Repo)) { $entry | Add-Member -Force -NotePropertyName source -NotePropertyValue $wantSource; $dirty = $true }
  if ($entry.autoUpdate -ne $true) { $entry | Add-Member -Force -NotePropertyName autoUpdate -NotePropertyValue $true; $dirty = $true }
} else {
  $markets | Add-Member -Force -NotePropertyName $Market -NotePropertyValue ([pscustomobject]@{ source = $wantSource; autoUpdate = $true })
  $dirty = $true
}
$enabled = EnsureObj $s 'enabledPlugins'
foreach ($n in $names) {
  $key = "$n@$Market"
  if ($enabled.PSObject.Properties.Name -contains $key) {
    if ($enabled.$key -eq $false) { Say "kept $key disabled (you turned it off before)" }
    continue
  }
  if ($offBefore -contains $key) { $enabled | Add-Member -NotePropertyName $key -NotePropertyValue $false; $dirty = $true; Say "kept $key disabled (you turned it off before)"; continue }
  $enabled | Add-Member -NotePropertyName $key -NotePropertyValue $true
  $dirty = $true
}

if ($DryRun) {
  if ($dirty) { Say "would write $SettingsPath with extraKnownMarketplaces.$Market.autoUpdate=true and $($names.Count) enabledPlugins" } else { Say "settings already up to date: $SettingsPath" }
} elseif ($dirty) {
  New-Item -ItemType Directory -Force $ConfigDir | Out-Null
  $note = ''
  if ($raw) { [IO.File]::WriteAllText("$SettingsPath.backup-$Stamp", $raw, (New-Object Text.UTF8Encoding $false)); $note = " (previous copy: $SettingsPath.backup-$Stamp)" }
  [IO.File]::WriteAllText($SettingsPath, ($s | ConvertTo-Json -Depth 64), (New-Object Text.UTF8Encoding $false))
  Format-JsonFile $SettingsPath
  Say "settings updated: $SettingsPath$note"
} else {
  Say "settings already up to date: $SettingsPath"
}
# Same per-computer flag the /plugin auto-update toggle writes; it still applies if a later `claude plugin marketplace add` drops the settings value.
$known = Join-Path $ConfigDir 'plugins\known_marketplaces.json'
if (-not $DryRun -and (Test-Path $known)) {
  $k = FromJson ([IO.File]::ReadAllText($known))
  if ($k.PSObject.Properties.Name -contains $Market -and $k.$Market.autoUpdate -ne $true) {
    $k.$Market | Add-Member -Force -NotePropertyName autoUpdate -NotePropertyValue $true
    [IO.File]::WriteAllText($known, ($k | ConvertTo-Json -Depth 64), (New-Object Text.UTF8Encoding $false))
    Format-JsonFile $known
    Say "auto-update also turned on in $known"
  }
}

$skillsDir = Join-Path $ConfigDir 'skills'
$backupRoot = Join-Path $ConfigDir 'skill-backups'
foreach ($n in $names) {
  $personal = Join-Path $skillsDir $n
  if ((Test-Path $personal) -and -not $KeepPersonalCopies) {
    $dest = Join-Path $backupRoot "$n-$Stamp"
    if ($DryRun) { Say "would move personal copy $personal -> $dest" }
    else { New-Item -ItemType Directory -Force $backupRoot | Out-Null; Move-Item $personal $dest; Say "moved personal copy $personal -> $dest (it would load twice next to the plugin)" }
  }
  $synced = @(Get-ChildItem -Directory -ErrorAction SilentlyContinue (Join-Path $skillsDir 'synced') | Where-Object { Test-Path (Join-Path $_.FullName $n) })
  if ($synced.Count -or (Test-Path (Join-Path $skillsDir "synced\$n"))) { Say "WARNING: $n is also an upload synced from a claude.ai account (skills\synced). Disable that upload on claude.ai so the skill does not load twice." }
}
if (-not $DryRun) { Say "done. Restart Claude Code. Updates are pulled automatically after the first message of each session; new plugins added to the repo later need this script again." }
} finally {
  $ErrorActionPreference = $__prevEap
  $env:CLAUDE_CODE_PLUGIN_PREFER_HTTPS = $__prevHttps
}
