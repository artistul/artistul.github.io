$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

python -m pytest tests\test_thermal_analyzer.py
python -m app.main --headless-smoke
