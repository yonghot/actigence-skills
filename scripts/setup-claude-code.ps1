# Usage: powershell -ExecutionPolicy Bypass -File scripts\setup-claude-code.ps1 [-Skills a,b] [-DryRun] [-KeepPersonalCopies]
#        irm https://raw.githubusercontent.com/yonghot/actigence-skills/main/scripts/setup-claude-code.ps1 | iex
param(
  [string]$Skills = "",
  [switch]$DryRun,
  [switch]$KeepPersonalCopies
)
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$Repo = 'yonghot/actigence-skills'
$Market = 'actigence-skills'
$ConfigDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $HOME '.claude' }
$SettingsPath = Join-Path $ConfigDir 'settings.json'
$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'

function Say($m) { Write-Host "[actigence-skills] $m" }
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
if ($Skills) {
  $names = @($Skills.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })
  $bad = @($names | Where-Object { $all -notcontains $_ })
  if ($bad.Count) { throw "unknown plugin(s): $($bad -join ', '). Available: $($all -join ', ')" }
}
Say "plugins: $($names -join ', ')"

$skillsDir = Join-Path $ConfigDir 'skills'
$backupRoot = Join-Path $ConfigDir 'skill-backups'
foreach ($n in $names) {
  $personal = Join-Path $skillsDir $n
  if ((Test-Path $personal) -and -not $KeepPersonalCopies) {
    $dest = Join-Path $backupRoot "$n-$Stamp"
    if ($DryRun) { Say "would move personal copy $personal -> $dest" }
    else { New-Item -ItemType Directory -Force $backupRoot | Out-Null; Move-Item $personal $dest; Say "moved personal copy $personal -> $dest (it would load twice next to the plugin)" }
  }
  if (Test-Path (Join-Path $skillsDir "synced\$n")) { Say "WARNING: $n is also synced from claude.ai (skills\synced\$n). Disable or delete that upload on claude.ai so it does not load twice." }
}

$offBefore = @()
if (Test-Path $SettingsPath) {
  $pre = [IO.File]::ReadAllText($SettingsPath)
  if ($pre.Trim()) {
    $preObj = FromJson $pre
    if ($preObj.enabledPlugins) { $offBefore = @($preObj.enabledPlugins.PSObject.Properties | Where-Object { $_.Value -eq $false } | ForEach-Object { $_.Name }) }
  }
}

$claude = Get-Command claude -ErrorAction SilentlyContinue
if ($claude -and -not $DryRun) {
  $env:CLAUDE_CODE_PLUGIN_PREFER_HTTPS = '1'
  & claude plugin marketplace add $Repo 2>&1 | Out-Null
  & claude plugin marketplace update $Market 2>&1 | Out-Null
  $installedFile = Join-Path $ConfigDir 'plugins\installed_plugins.json'
  $installed = @()
  if (Test-Path $installedFile) { $installed = @((FromJson ([IO.File]::ReadAllText($installedFile))).plugins.PSObject.Properties.Name) }
  foreach ($n in $names) {
    if ($installed -contains "$n@$Market" -or $offBefore -contains "$n@$Market") { continue }
    $out = & claude plugin install "$n@$Market" 2>&1 | Select-Object -Last 1
    Say "install $n@${Market}: $out"
  }
} elseif (-not $claude) {
  Say "claude CLI not on PATH: plugins will be downloaded at the next Claude Code session start from the settings below."
}

if (Test-Path $SettingsPath) { $raw = [IO.File]::ReadAllText($SettingsPath) } else { $raw = '' }
$s = if ($raw.Trim()) { FromJson $raw } else { [pscustomobject]@{} }
function EnsureObj($obj, $name) {
  if (-not ($obj.PSObject.Properties.Name -contains $name) -or $null -eq $obj.$name) { $obj | Add-Member -Force -NotePropertyName $name -NotePropertyValue ([pscustomobject]@{}) }
  return $obj.$name
}
$markets = EnsureObj $s 'extraKnownMarketplaces'
$entry = [pscustomobject]@{ source = [pscustomobject]@{ source = 'github'; repo = $Repo }; autoUpdate = $true }
$markets | Add-Member -Force -NotePropertyName $Market -NotePropertyValue $entry
$enabled = EnsureObj $s 'enabledPlugins'
foreach ($n in $names) {
  $key = "$n@$Market"
  if ($offBefore -contains $key) { $enabled | Add-Member -Force -NotePropertyName $key -NotePropertyValue $false }
  if ($enabled.PSObject.Properties.Name -contains $key) {
    if ($enabled.$key -eq $false) { Say "kept $key disabled (you turned it off before)" }
    continue
  }
  $enabled | Add-Member -NotePropertyName $key -NotePropertyValue $true
}
$json = $s | ConvertTo-Json -Depth 64
if ($DryRun) { Say "would write $SettingsPath with extraKnownMarketplaces.$Market.autoUpdate=true and $($names.Count) enabledPlugins"; return }
New-Item -ItemType Directory -Force $ConfigDir | Out-Null
if ($raw) { [IO.File]::WriteAllText("$SettingsPath.backup-$Stamp", $raw, (New-Object Text.UTF8Encoding $false)) }
[IO.File]::WriteAllText($SettingsPath, $json, (New-Object Text.UTF8Encoding $false))
Say "settings updated: $SettingsPath (previous copy: $SettingsPath.backup-$Stamp)"
Say "done. Restart Claude Code. Updates are pulled automatically after the first message of each session; new plugins added to the repo later need this script again."
