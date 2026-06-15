$ErrorActionPreference = "Stop"

$repo = "C:\Users\Stefan\Documents\Influx"
Set-Location -LiteralPath $repo

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command failed with exit code $LASTEXITCODE."
  }
}

Write-Host "Publishing the InFlux website..." -ForegroundColor Cyan

$branch = (git branch --show-current).Trim()
if ($branch -ne "main") {
  throw "Expected branch 'main', but the current branch is '$branch'."
}

Invoke-Checked powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$repo\scripts\test-website-for-publish.ps1"

Invoke-Checked git add --all
git diff --cached --quiet
$hasStagedChanges = $LASTEXITCODE -ne 0

if ($hasStagedChanges) {
  $message = "Publish website $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
  Invoke-Checked git commit -m $message
}
else {
  Write-Host "`nNo new local changes to commit." -ForegroundColor Yellow
}

Invoke-Checked git fetch origin
$behind = [int](git rev-list --count HEAD..origin/main)
if ($behind -gt 0) {
  Write-Host "`nGitHub has newer commits. Rebasing the tested local commit(s)..." -ForegroundColor Cyan
  Invoke-Checked git pull --rebase origin main
}

Invoke-Checked git push origin main

Write-Host "`nPublished successfully." -ForegroundColor Green
Write-Host "GitHub: https://github.com/artistul/artistul.github.io"
Write-Host "Live:   https://influxorigin.ro"
