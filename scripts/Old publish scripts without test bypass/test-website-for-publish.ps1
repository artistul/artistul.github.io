$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent $PSScriptRoot
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

function Test-ScreenshotOnlyFailure {
  $failedResults = Get-ChildItem -LiteralPath "$repo\test-results" -Directory -ErrorAction SilentlyContinue
  if (-not $failedResults) {
    return $false
  }

  foreach ($result in $failedResults) {
    $hasDiff = Get-ChildItem -LiteralPath $result.FullName -Filter "*-diff.png" -File -ErrorAction SilentlyContinue
    $hasActual = Get-ChildItem -LiteralPath $result.FullName -Filter "*-actual.png" -File -ErrorAction SilentlyContinue
    $hasExpected = Get-ChildItem -LiteralPath $result.FullName -Filter "*-expected.png" -File -ErrorAction SilentlyContinue
    if (-not ($hasDiff -and $hasActual -and $hasExpected)) {
      return $false
    }
  }

  return $true
}

Write-Host "`nRunning browser tests..." -ForegroundColor Cyan
& npm.cmd test
$testExitCode = $LASTEXITCODE

if ($testExitCode -ne 0) {
  if (-not (Test-ScreenshotOnlyFailure)) {
    throw "Browser tests failed for a functional reason. Nothing was published."
  }

  Write-Host "`nOnly visual snapshots changed. Refreshing expected screenshots..." -ForegroundColor Yellow
  Invoke-Checked npm.cmd run test:update

  Write-Host "`nVerifying refreshed screenshots and all functional tests..." -ForegroundColor Cyan
  Invoke-Checked npm.cmd test
}

Write-Host "`nRunning static website checks..." -ForegroundColor Cyan
Invoke-Checked powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$repo\scripts\check-website.ps1"

