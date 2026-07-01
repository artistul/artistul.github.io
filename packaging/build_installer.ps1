$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$Iscc = (Get-Command iscc -ErrorAction SilentlyContinue).Source
if (-not $Iscc) {
    $Candidates = @(
        "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles(x86)}\Inno Setup 6\ISCC.exe",
        "${env:ProgramFiles}\Inno Setup 6\ISCC.exe"
    )
    foreach ($Candidate in $Candidates) {
        if (Test-Path -LiteralPath $Candidate) {
            $Iscc = $Candidate
            break
        }
    }
}

if (-not (Test-Path -LiteralPath "$Root\dist\InFluxThermalMoldAnalyzer\InFluxThermalMoldAnalyzer.exe")) {
    & "$Root\packaging\build_exe.ps1"
}

if (-not $Iscc) {
    throw "Inno Setup compiler not found. Install Inno Setup 6, then rerun packaging\build_installer.ps1."
}

& $Iscc "$Root\installer\InFluxThermalMoldAnalyzer.iss"
Write-Host "Installer output: $Root\installer\Output\InFluxThermalMoldAnalyzerSetup.exe"
