$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$index = [IO.File]::ReadAllText((Join-Path $root "index.html"))
$technical = [IO.File]::ReadAllText((Join-Path $root "technical.html"))
$styles = [IO.File]::ReadAllText((Join-Path $root "styles.css"))
$technicalStyles = [IO.File]::ReadAllText((Join-Path $root "technical.css"))
$script = [IO.File]::ReadAllText((Join-Path $root "script.js"))

$failures = [System.Collections.Generic.List[string]]::new()

function Assert-Website {
  param([bool]$Condition, [string]$Message)
  if (-not $Condition) { $failures.Add($Message) }
}

Assert-Website ($index -notmatch '<script[^>]+model-viewer\.min\.js') "model-viewer runtime must not load globally"
Assert-Website ($index -notmatch '<model-viewer') "3D model must be created only after user action"
Assert-Website ($index -match 'data-load-model') "3D load action is missing"
Assert-Website ($script -match 'loadModelViewerRuntime') "conditional model-viewer loader is missing"
Assert-Website ($script -match 'machine-assembly-optimized\.glb') "optimized 3D model is not used"
Assert-Website ($index -match 'role="tabpanel"') "tabpanel semantics are missing"
Assert-Website ($index -match 'aria-controls="versions"') "tab-to-panel relationship is missing"
Assert-Website ($script -match 'ArrowRight' -and $script -match 'ArrowLeft') "tab arrow-key behavior is missing"
Assert-Website ($styles -match ':focus-visible' -and $technicalStyles -match ':focus-visible') "focus-visible styling is missing"
Assert-Website ($styles -match '@media \(max-width: 360px\)') "small-screen hero breakpoint is missing"
Assert-Website ($technicalStyles -match 'scroll-margin-top') "technical anchor offset is missing"
Assert-Website ($index -match 'data-src="assets/machine-wireframe\.jpg"') "hidden-panel image hydration is missing"
Assert-Website ($index -match 'first-injected-part-angle-440\.webp') "optimized proof image is missing"
Assert-Website ($technical -match 'Confirmed platform summary') "confirmed specification summary is missing"
Assert-Website ($technical -match 'April 16, 2026') "validation evidence date is missing"
Assert-Website ($index -match 'team-stefan\.webp' -and $index -match 'team-david\.webp') "published team portraits are missing"
Assert-Website ($index -match 'motherboard-kicad-landscape\.webp') "Evidence 3 landscape asset is missing"
Assert-Website ($index -match 'Every action has a supervisor' -and $index -match 'running an STM32') "Evidence 3 copy is stale"
Assert-Website ($index -notmatch 'Rapid Mold Program') "removed Rapid Mold Program is still published"
Assert-Website ($index -match 'operator-dashboard\.webp' -and $index -match 'operator-run\.webp' -and $index -match 'operator-movement\.webp') "Operator app screen set is incomplete"
Assert-Website ($index -match 'class="fluid-meter"' -and $index -match 'role="progressbar"' -and $styles -match '@keyframes fluid-lobe') "animated fluid proof meters are missing"
Assert-Website ($script -match 'registerMediaState' -and $styles -match '\.media-loading') "shared media loading state is missing"
Assert-Website ($technical -match 'data-toc-toggle' -and $technicalStyles -match 'doc-toc\.is-open') "mobile dossier contents disclosure is missing"
Assert-Website ($index -match 'application/ld\+json' -and $technical -match 'application/ld\+json') "structured data is missing"
Assert-Website ($index -match 'rel="canonical"' -and $technical -match 'rel="canonical"') "canonical metadata is missing"
Assert-Website (Test-Path (Join-Path $root "CNAME")) "GitHub Pages custom-domain file is missing"
Assert-Website ($index -match 'https://influxorigin\.ro/' -and $technical -match 'https://influxorigin\.ro/technical\.html') "custom-domain canonical metadata is missing"
Assert-Website ($index -match '2026-06-15-fluid-v2' -and $technical -match '2026-06-13-p4') "explicit cache version is missing"
Assert-Website ($index -match '<span>Three levels</span> of maturity' -and $index -match 'InFlux Ecosystem') "updated section hierarchy labels are missing"
Assert-Website ("$index`n$script" -notmatch 'STEP.+GLB' -and $index -notmatch 'Orbit and zoom') "redundant 3D micro-label copy is still published"
Assert-Website (Test-Path (Join-Path $root "robots.txt")) "robots.txt is missing"
Assert-Website (Test-Path (Join-Path $root "sitemap.xml")) "sitemap.xml is missing"
Assert-Website (Test-Path (Join-Path $root "assets\checksums.txt")) "artifact checksums are missing"
Assert-Website ("$index`n$technical`n$script" -notmatch '[\u00C2\u00E2]') "mojibake characters detected"

foreach ($route in @("machine", "components", "team", "evidence", "downloads", "resources")) {
  Assert-Website (Test-Path (Join-Path $root "$route\index.html")) "route alias is missing: $route"
}

$assetReferences = [regex]::Matches("$index`n$technical", '(?:src|href|data-src)="([^"#?]+)"') |
  ForEach-Object { $_.Groups[1].Value } |
  Where-Object { $_ -notmatch '^(https?:|mailto:)' } |
  Sort-Object -Unique

foreach ($reference in $assetReferences) {
  Assert-Website (Test-Path (Join-Path $root $reference)) "missing local reference: $reference"
}

$srcsetReferences = [regex]::Matches($index, '(?:srcset|data-srcset)="([^"]+)"') |
  ForEach-Object { $_.Groups[1].Value -split "," } |
  ForEach-Object { ($_ -split "\s+")[0].Trim() } |
  Sort-Object -Unique
foreach ($reference in $srcsetReferences) {
  Assert-Website (Test-Path (Join-Path $root $reference)) "missing responsive image: $reference"
}

$initialAssets = @(
  "styles.css",
  "script.js",
  "assets/logo-mark.webp",
  "assets/machine-full.webp",
  "assets/first-injected-part-angle-440.webp",
  "assets/influx-origin-logo.svg"
)
$initialBytes = ($initialAssets | ForEach-Object { (Get-Item (Join-Path $root $_)).Length } | Measure-Object -Sum).Sum
Assert-Website ($initialBytes -lt 1.5MB) "estimated initial asset budget exceeds 1.5 MB"

$largePageAssets = Get-ChildItem (Join-Path $root "assets") -File |
  Where-Object { $_.Extension -match '^\.(png|jpg|jpeg|webp|glb|js|css)$' -and $_.Name -ne "model-viewer.min.js" }
foreach ($asset in $largePageAssets) {
  Assert-Website ($asset.Length -lt 700KB) "page asset exceeds 700 KB budget: $($asset.Name)"
}

$checksumText = [IO.File]::ReadAllText((Join-Path $root "assets\checksums.txt"))
foreach ($artifact in @("influx-operator-latest.apk", "influx-origin-technical-notebook.pdf", "influx-origin-logo.svg")) {
  $hash = (Get-FileHash (Join-Path $root "assets\$artifact") -Algorithm SHA256).Hash
  Assert-Website ($checksumText -match $hash) "checksum is stale or missing: $artifact"
}

if ($failures.Count) {
  $failures | ForEach-Object { Write-Error $_ }
  exit 1
}

Write-Host "Website checks passed."
Write-Host ("Estimated initial referenced assets: {0:N2} MB" -f ($initialBytes / 1MB))
Write-Host ("Technical stylesheet: {0} lines" -f ((Get-Content (Join-Path $root "technical.css")).Count))
