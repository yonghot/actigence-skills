# Manual installer for actigence-skills (Windows PowerShell 5.1 and PowerShell 7). Same behavior as install.sh.
# This file is intentionally ASCII-only so Windows PowerShell 5.1 reads it correctly without a BOM.
$ErrorActionPreference = 'Stop'

$Marker = '.installed-by-actigence-skills'
$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
$Source = Split-Path -Parent $Here
$HomeDir = $env:USERPROFILE
if (-not $HomeDir) { $HomeDir = $HOME }
$Target = Join-Path (Join-Path $HomeDir '.claude') 'skills'
$Action = 'install'
$Dry = $false
$All = $false
$Force = $false
$Names = ''

function Show-Usage {
    @'
Usage: install.ps1 [--list] [--all | --skills a,b] [--target DIR] [--source DIR] [--uninstall] [--dry-run] [--force]

  --list        show available skills and where each one is already installed
  --all         install every available skill
  --skills a,b  install only these skills
  --target DIR  skills folder to install into (default: %USERPROFILE%\.claude\skills)
  --source DIR  clone root (has plugins\) or a folder of unzipped skill folders
  --uninstall   remove skills that carry the marker file written by this installer
  --dry-run     print what would happen, change nothing
  --force       install even if a synced\ or plugin copy of the skill exists

An existing same-name folder is moved to <target parent>\skill-backups\<name>-<timestamp>
(outside the skills folder, so it is not loaded as a skill).
'@
}

$i = 0
while ($i -lt $args.Count) {
    $a = [string]$args[$i]
    switch ($a.TrimStart('-').ToLower()) {
        'list' { $Action = 'list' }
        'all' { $All = $true }
        'skills' { $i++; $v = $args[$i]; if ($v -is [array]) { $v = $v -join ',' }; $Names = [string]$v }
        'target' { $i++; $Target = [string]$args[$i] }
        'source' { $i++; $Source = [string]$args[$i] }
        'uninstall' { $Action = 'uninstall' }
        'dry-run' { $Dry = $true }
        'dryrun' { $Dry = $true }
        'force' { $Force = $true }
        'h' { Show-Usage; exit 0 }
        'help' { Show-Usage; exit 0 }
        default { Write-Host "unknown argument: $a"; Show-Usage; exit 2 }
    }
    $i++
}

$BackupRoot = Join-Path (Split-Path -Parent $Target) 'skill-backups'
$PluginsJson = Join-Path (Join-Path (Join-Path $HomeDir '.claude') 'plugins') 'installed_plugins.json'

function Get-AvailableSkills {
    $found = @()
    $pluginsDir = Join-Path $Source 'plugins'
    if (Test-Path -LiteralPath $pluginsDir) {
        foreach ($p in Get-ChildItem -LiteralPath $pluginsDir -Directory) {
            $sd = Join-Path $p.FullName 'skills'
            if (Test-Path -LiteralPath $sd) {
                foreach ($s in Get-ChildItem -LiteralPath $sd -Directory) {
                    if (Test-Path -LiteralPath (Join-Path $s.FullName 'SKILL.md')) { $found += $s }
                }
            }
        }
    } else {
        foreach ($s in Get-ChildItem -LiteralPath $Source -Directory) {
            if (Test-Path -LiteralPath (Join-Path $s.FullName 'SKILL.md')) { $found += $s }
        }
    }
    return $found
}

function Get-SyncedCopy([string]$name) {
    $syncedRoot = Join-Path $Target 'synced'
    if (-not (Test-Path -LiteralPath $syncedRoot)) { return $null }
    foreach ($d in Get-ChildItem -LiteralPath $syncedRoot -Directory) {
        $c = Join-Path (Join-Path $d.FullName $name) 'SKILL.md'
        if (Test-Path -LiteralPath $c) { return (Join-Path $d.FullName $name) }
    }
    return $null
}

function Get-PluginCopy([string]$name) {
    if (-not (Test-Path -LiteralPath $PluginsJson)) { return $null }
    $text = [System.IO.File]::ReadAllText($PluginsJson)
    $m = [regex]::Match($text, '"' + [regex]::Escape($name) + '@[^"]*"')
    if ($m.Success) { return $m.Value.Trim('"') }
    return $null
}

function Get-Status([string]$name) {
    $parts = @()
    $dir = Join-Path $Target $name
    if (Test-Path -LiteralPath (Join-Path $dir $Marker)) { $parts += 'installed-by-this-repo' }
    elseif (Test-Path -LiteralPath $dir) { $parts += 'personal-copy' }
    if (Get-SyncedCopy $name) { $parts += 'synced-copy' }
    $pc = Get-PluginCopy $name
    if ($pc) { $parts += "plugin($pc)" }
    if ($parts.Count -eq 0) { return 'not-installed' }
    return ($parts -join ' ')
}

$Skills = @(Get-AvailableSkills)
if ($Skills.Count -eq 0) {
    Write-Host "no skills found under $Source (run from a clone, or pass --source with unzipped skill folders)"
    exit 1
}

if ($Action -eq 'list') {
    Write-Host "source: $Source"
    Write-Host "target: $Target"
    Write-Host ''
    foreach ($s in $Skills) { Write-Host ('{0,-26} {1}' -f $s.Name, (Get-Status $s.Name)) }
    exit 0
}

if ($All) { $Selected = @($Skills | ForEach-Object { $_.Name }) }
elseif ($Names) { $Selected = @($Names.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }) }
else { Write-Host 'choose --all or --skills a,b (or --list)'; Show-Usage; exit 2 }

$Stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$rc = 0

foreach ($name in $Selected) {
    $dest = Join-Path $Target $name
    if ($Action -eq 'uninstall') {
        if (Test-Path -LiteralPath (Join-Path $dest $Marker)) {
            Write-Host "remove    $name"
            if (-not $Dry) { Remove-Item -LiteralPath $dest -Recurse -Force } else { Write-Host "[dry-run] remove $dest" }
        } elseif (Test-Path -LiteralPath $dest) {
            Write-Host "skip      $name (no marker file, not installed by this repo)"
        } else {
            Write-Host "skip      $name (not installed)"
        }
        continue
    }

    $src = $Skills | Where-Object { $_.Name -eq $name } | Select-Object -First 1
    if (-not $src) { Write-Host "unknown skill: $name"; $rc = 1; continue }

    $sc = Get-SyncedCopy $name
    $pc = Get-PluginCopy $name
    if (($sc -or $pc) -and -not $Force) {
        if ($sc) { Write-Host "WARN      ${name}: synced copy exists ($sc). Skipped to avoid duplicate triggers; use --force to install anyway." }
        if ($pc) { Write-Host "WARN      ${name}: already installed as plugin $pc. Skipped to avoid duplicate triggers; use --force to install anyway." }
        continue
    }

    if (Test-Path -LiteralPath $dest) {
        $bk = Join-Path $BackupRoot "$name-$Stamp"
        Write-Host "backup    $dest -> $bk"
        if (-not $Dry) {
            New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
            Move-Item -LiteralPath $dest -Destination $bk
        } else { Write-Host "[dry-run] move $dest $bk" }
    }
    Write-Host "install   $name -> $dest"
    if (-not $Dry) {
        New-Item -ItemType Directory -Force -Path $Target | Out-Null
        Copy-Item -LiteralPath $src.FullName -Destination $dest -Recurse
        Get-ChildItem -LiteralPath $dest -Recurse -Force -Directory -Filter '__pycache__' -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force
        $enc = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText((Join-Path $dest $Marker), "source=actigence-skills`ninstalled=$Stamp`n", $enc)
    } else { Write-Host "[dry-run] copy $($src.FullName) $dest" }
    $scriptsDir = Join-Path $src.FullName 'scripts'
    if ((Test-Path -LiteralPath $scriptsDir) -and (Get-ChildItem -LiteralPath $scriptsDir -Filter '*.py' -ErrorAction SilentlyContinue)) {
        if ((Get-Command python -ErrorAction SilentlyContinue) -or (Get-Command python3 -ErrorAction SilentlyContinue) -or (Get-Command py -ErrorAction SilentlyContinue)) {
            Write-Host "          note: $name has Python scripts; install packages named in its SKILL.md with: python -m pip install <package> (python3 on macOS/Linux)"
        } else {
            Write-Host "          note: $name has Python scripts but python was not found on PATH"
        }
    }
}

exit $rc
