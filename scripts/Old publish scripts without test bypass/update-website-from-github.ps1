$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
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

Write-Host "`nLocal website is up to date." -ForegroundColor Green
