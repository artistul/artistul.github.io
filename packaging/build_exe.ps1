param(
    [switch]$Clean
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if ($Clean) {
    Remove-Item -LiteralPath "$Root\build" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath "$Root\dist\InFluxThermalMoldAnalyzer" -Recurse -Force -ErrorAction SilentlyContinue
}

python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python -m PyInstaller packaging\InFluxThermalMoldAnalyzer.spec --noconfirm

Write-Host "Executable folder: $Root\dist\InFluxThermalMoldAnalyzer"
