<##
.SYNOPSIS
Generate aggregated Javadocs and copy them into docs/javadoc/apidocs so GitHub Pages can serve them.

Usage:
  PowerShell (from any folder):
    C:\> pwsh -File .\docs\scripts\generate_javadocs.ps1
  or from PowerShell (Windows PowerShell / PowerShell Core):
    PS> .\docs\scripts\generate_javadocs.ps1
#>

$ErrorActionPreference = 'Stop'

# Resolve repository root (assumes this script lives in docs/scripts)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
n$repoRoot = Resolve-Path (Join-Path $scriptDir '..\..')

nWrite-Host "Repository root: $repoRoot"

# Verify Maven is available
if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) {
    Write-Error "Maven (mvn) not found in PATH. Install Maven and ensure 'mvn' is available on the PATH."
    exit 1
}

Push-Location $repoRoot
ntry {
    Write-Host "Running: mvn -T 1C -DskipTests clean javadoc:aggregate"
    mvn -T 1C -DskipTests clean javadoc:aggregate
} catch {
    Write-Error "Maven failed: $_"
    Pop-Location
    exit 2
}

$src = Join-Path $repoRoot "target\site\apidocs"
$dest = Join-Path $repoRoot "docs\javadoc\apidocs"

if (-not (Test-Path $src)) {
    Write-Error "Expected generated javadocs at: $src (not found)."
    Pop-Location
    exit 3
}

nif (-not (Test-Path $dest)) {
    Write-Host "Creating destination: $dest"
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
}

Write-Host "Copying generated apidocs from $src to $dest ..."
Copy-Item -Path (Join-Path $src '*') -Destination $dest -Recurse -Force
Write-Host "Javadocs copied to: $dest"

Pop-Location
exit 0

