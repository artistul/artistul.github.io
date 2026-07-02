[CmdletBinding()]
param(
  [switch]$ValidateAfterUpdate,

  [Alias("Force", "PublishAnyway")]
  [switch]$AllowFailedTests
)

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

Write-Host "Updating the local InFlux website from GitHub..." -ForegroundColor Cyan

$branch = (git branch --show-current).Trim()
if ($branch -ne "main") {
  throw "Expected branch 'main', but the current branch is '$branch'."
}

$localChanges = git status --porcelain
if ($localChanges) {
  throw "Local edits exist. Publish, commit, or stash them before updating so they are not overwritten."
}

Invoke-Checked git fetch origin
Invoke-Checked git pull --ff-only origin main

if ($ValidateAfterUpdate) {
  Write-Host "`nValidating the downloaded website..." -ForegroundColor Cyan

  $validationArguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", "$repo\scripts\test-website-for-publish.ps1"
  )

  if ($AllowFailedTests) {
    Write-Warning "The failed-test override is enabled for post-update validation."
    $validationArguments += "-AllowFailedTests"
  }

  & powershell.exe @validationArguments
  if ($LASTEXITCODE -ne 0) {
    throw "The local website was updated, but validation failed."
  }
}
elseif ($AllowFailedTests) {
  Write-Warning "-AllowFailedTests has no effect unless -ValidateAfterUpdate is also used."
}

Write-Host "`nLocal website is up to date." -ForegroundColor Green
Write-Host "Normal publish:   .\scripts\publish-website.ps1"
Write-Host "Override publish: .\scripts\publish-website.ps1 -AllowFailedTests"
