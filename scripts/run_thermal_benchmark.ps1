$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

python -m app.main --benchmark --benchmark-output outputs\benchmark_scaling.csv
Write-Host "Benchmark written to outputs\benchmark_scaling.csv"
