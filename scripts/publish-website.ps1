[CmdletBinding()]
param(
  [Alias("Force", "PublishAnyway")]
  [switch]$AllowFailedTests,

  [switch]$NonInteractive
)

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

function Invoke-PublishValidation {
  param([switch]$AllowFailures)

  $arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "$repo\scripts\test-website-for-publish.ps1"
  )

  if ($AllowFailures) {
    $arguments += "-AllowFailedTests"
  }

  & powershell.exe @arguments
}

Write-Host "Publishing the InFlux website..." -ForegroundColor Cyan

Write-Host "`nPreparing optimized website assets..." -ForegroundColor Cyan
Invoke-Checked npm.cmd run prepare:site

$branch = (git branch --show-current).Trim()
if ($branch -ne "main") {
  throw "Expected branch 'main', but the current branch is '$branch'."
}

$overrideWasUsed = $false

if ($AllowFailedTests) {
  Write-Warning "The failed-test publishing override is enabled. Tests will still run and report every detected failure."
  Invoke-PublishValidation -AllowFailures
  if ($LASTEXITCODE -ne 0) {
    throw "The validation script could not complete. This looks like a script or tool error, not an overridable test failure."
  }
  $overrideWasUsed = $true
}
else {
  Invoke-PublishValidation
  $validationExitCode = $LASTEXITCODE

  if ($validationExitCode -ne 0) {
    if ($NonInteractive) {
      throw "Website tests failed. Non-interactive publishing will not bypass them without -AllowFailedTests."
    }

    Write-Host "`nWebsite validation failed." -ForegroundColor Red
    Write-Host "Publishing anyway can put a broken version online." -ForegroundColor Yellow
    $confirmation = Read-Host "Type PUBLISH ANYWAY to continue, or press Enter to cancel"

    if ($confirmation -ne "PUBLISH ANYWAY") {
      throw "Publishing cancelled because the tests failed."
    }

    Write-Warning "Failed-test override confirmed. Re-running all validation stages in reporting mode before publishing."
    Invoke-PublishValidation -AllowFailures
    if ($LASTEXITCODE -ne 0) {
      throw "The validation script could not complete in override mode. Publishing was cancelled."
    }

    $overrideWasUsed = $true
  }
}

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

if ($overrideWasUsed) {
  Write-Host "`nPublished with the failed-test override enabled." -ForegroundColor Yellow
}
else {
  Write-Host "`nPublished successfully." -ForegroundColor Green
}

Write-Host "GitHub: https://github.com/artistul/artistul.github.io"
Write-Host "Live:   https://influxorigin.ro"
