[CmdletBinding()]
param(
  [Alias("Force", "PublishAnyway")]
  [switch]$AllowFailedTests
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$index = [IO.File]::ReadAllText((Join-Path $root "index.html"))
$technical = [IO.File]::ReadAllText((Join-Path $root "technical.html"))
$styles = [IO.File]::ReadAllText((Join-Path $root "styles.css"))
$technicalStyles = [IO.File]::ReadAllText((Join-Path $root "technical.css"))
$script = [IO.File]::ReadAllText((Join-Path $root "script.js"))
$robots = [IO.File]::ReadAllText((Join-Path $root "robots.txt"))
$sitemap = [IO.File]::ReadAllText((Join-Path $root "sitemap.xml"))
$sponsorshipRoute = [IO.File]::ReadAllText((Join-Path $root "sponsorship\index.html"))
$contactRoute = [IO.File]::ReadAllText((Join-Path $root "contact\index.html"))
$llms = [IO.File]::ReadAllText((Join-Path $root "llms.txt"))
$llmsFull = [IO.File]::ReadAllText((Join-Path $root "llms-full.txt"))
$aiContext = [IO.File]::ReadAllText((Join-Path $root "ai-context.json"))

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
Assert-Website ($index -notmatch 'proof-stamp|First successful part') "removed home proof-stamp button is still published"
Assert-Website ($technical -match 'Confirmed platform summary') "confirmed specification summary is missing"
Assert-Website ($technical -match 'April 16, 2026') "validation evidence date is missing"
Assert-Website ($index -match 'team-stefan\.webp' -and $index -match 'team-david\.webp') "published team portraits are missing"
Assert-Website ($index -match 'motherboard-kicad-landscape\.webp') "Evidence 3 landscape asset is missing"
Assert-Website ($index -match 'settings, sensors and outputs are controlled by the motherboard' -and $index -match 'running an STM32') "Evidence 3 copy is stale"
Assert-Website ($index -notmatch 'Rapid Mold Program') "removed Rapid Mold Program is still published"
Assert-Website ($index -match 'operator-dashboard\.webp' -and $index -match 'operator-run\.webp' -and $index -match 'operator-movement\.webp') "Operator app screen set is incomplete"
Assert-Website ($index -match 'class="fluid-meter"' -and $index -match 'role="progressbar"' -and $styles -match '@keyframes fluid-lobe') "animated fluid proof meters are missing"
Assert-Website ($script -match 'registerMediaState' -and $styles -match '\.media-loading') "shared media loading state is missing"
Assert-Website ($technical -match 'data-toc-toggle' -and $technicalStyles -match 'doc-toc\.is-open') "mobile dossier contents disclosure is missing"
Assert-Website ($index -match 'application/ld\+json' -and $technical -match 'application/ld\+json') "structured data is missing"
Assert-Website ("$index`n$technical`n$sponsorshipRoute`n$contactRoute" -notmatch '"@type": "Product"|#product') "Product rich-result schema must not be published without offers, reviews, or aggregateRating"
Assert-Website ($index -match 'rel="canonical"' -and $technical -match 'rel="canonical"') "canonical metadata is missing"
Assert-Website (Test-Path (Join-Path $root "CNAME")) "GitHub Pages custom-domain file is missing"
Assert-Website ($index -match 'https://influxorigin\.ro/' -and $technical -match 'https://influxorigin\.ro/technical\.html') "custom-domain canonical metadata is missing"
Assert-Website ($index -match '2026-06-25-contact-clean' -and $technical -match '2026-06-25-contact-red-identity') "explicit cache version is missing"
Assert-Website ($script -match 'dataset\.fluidPhysics' -and $script -match 'stiffness' -and $script -match 'pressurePulse') "independent fluid physics are missing"
Assert-Website ($index -notmatch 'fluid-body-shine|data-fluid-sheen|stop-color="#ffffff"' -and $styles -notmatch 'fluid-sheen') "white fluid sheen layer is still published"
Assert-Website ($index -match 'Ciprian Ursu' -and $technical -match 'Ciprian Ursu') "Ciprian Ursu team patch is missing"
Assert-Website ($index -notmatch 'End goal:' -and ([regex]::Matches($index, 'class="proof-progress"[^>]+data-current="[^"]+"[^>]+data-final="[^"]+"')).Count -ge 4) "numeric proof targets are missing"
Assert-Website ($index -match 'data-unit="cycles"' -and $script -match 'currentTarget / finalTarget') "calculated proof meter behavior is missing"
Assert-Website ($index -match 'data-milestones="25,50,100,200"' -and $script -match 'fluid-milestone' -and $styles -match '\.fluid-milestone\.is-passed') "calculated proof milestones are missing"
Assert-Website ($index -match 'data-start="5000"' -and $index -match 'data-flipped' -and $script -match 'startTarget - currentTarget') "flipped reduction meter behavior is missing"
Assert-Website ($index -match '<h2>Sketches</h2>' -and $index -match '<h2>The beginning of InFlux</h2>' -and $index -match '<h2>Plan for MK1</h2>' -and $index -match '<h2>MK1</h2>' -and $index -match '<h2>Next up</h2>' -and $index -match 'InFlux Ecosystem') "updated section hierarchy labels are missing"
Assert-Website ($index -match 'data-nav="sponsorship"' -and $index -match 'data-nav="contact"' -and $index -match 'tonegari\.stefan@gmail\.com' -and $index -match 'david\.pintilei9@gmail\.com' -and $index -match 'sponsorship-uniform-render\.jpeg') "sponsors/contact content is incomplete"
Assert-Website ($index -match 'Thank you to our' -and $index -match 'Interested in becoming a sponsor\? Contact us!' -and $index -match 'data-nav-link="contact"' -and $index -match 'sponsor-01-taggo\.png' -and $index -match 'sponsor-02-termohabitat-fotovoltaice\.svg' -and $index -match 'sponsor-03-centrul-medical-biotest\.png' -and $index -match 'sponsor-06-banca-transilvania\.png') "sponsor logo wall is incomplete"
Assert-Website ($index -match 'assets/proof-56-parts\.jpg' -and (Test-Path (Join-Path $root "assets\proof-56-parts.jpg"))) "56-part proof evidence is missing"
Assert-Website ("$index`n$script" -notmatch 'STEP.+GLB' -and $index -notmatch 'Orbit and zoom') "redundant 3D micro-label copy is still published"
Assert-Website (Test-Path (Join-Path $root "robots.txt")) "robots.txt is missing"
Assert-Website (Test-Path (Join-Path $root "sitemap.xml")) "sitemap.xml is missing"
Assert-Website (Test-Path (Join-Path $root "llms.txt")) "llms.txt is missing"
Assert-Website (Test-Path (Join-Path $root "llms-full.txt")) "llms-full.txt is missing"
Assert-Website (Test-Path (Join-Path $root "ai-context.json")) "AI context JSON is missing"
Assert-Website ($index -match 'rel="alternate" type="text/plain".+llms\.txt') "AI overview discovery link is missing"
Assert-Website ($index -match 'rel="alternate" type="application/json".+ai-context\.json') "structured AI context discovery link is missing"
Assert-Website ($robots -match 'llms\.txt' -and $robots -match 'ai-context\.json') "robots.txt does not advertise machine-readable context"
Assert-Website ($llms -match 'Citation guidance' -and $llmsFull -match 'Current limits') "AI context guardrails are incomplete"
Assert-Website ($aiContext -match '"citation_guidance"' -and $aiContext -match '"unproven_or_incomplete"') "structured AI context guardrails are incomplete"
Assert-Website ($sitemap -notmatch '/machine/|/components/|/team/|/evidence/|/downloads/|/resources/') "redirect helper URLs must not be listed in the sitemap"
Assert-Website ($sitemap -match 'https://influxorigin\.ro/technical\.html') "technical dossier is missing from sitemap"
Assert-Website ($sitemap -match 'https://influxorigin\.ro/sponsorship/' -and $sitemap -match 'https://influxorigin\.ro/contact/') "indexable sponsor/contact routes are missing from sitemap"
Assert-Website (Test-Path (Join-Path $root "assets\checksums.txt")) "artifact checksums are missing"
Assert-Website ("$index`n$technical`n$script" -notmatch '[\u00C2\u00E2]') "mojibake characters detected"

foreach ($route in @("machine", "components", "team", "evidence", "downloads", "resources")) {
  $routePath = Join-Path $root "$route\index.html"
  Assert-Website (Test-Path $routePath) "route alias is missing: $route"
  if (Test-Path $routePath) {
    $routeHtml = [IO.File]::ReadAllText($routePath)
    Assert-Website ($routeHtml -match 'noindex,follow') "redirect helper must be noindex: $route"
    Assert-Website ($routeHtml -notmatch 'artistul\.github\.io') "stale GitHub Pages canonical remains: $route"
  }
}

foreach ($route in @("sponsorship", "contact")) {
  $routePath = Join-Path $root "$route\index.html"
  Assert-Website (Test-Path $routePath) "indexable route is missing: $route"
  if (Test-Path $routePath) {
    $routeHtml = [IO.File]::ReadAllText($routePath)
    Assert-Website ($routeHtml -match 'index,follow' -and $routeHtml -match "https://influxorigin\.ro/$route/") "indexable route metadata is missing: $route"
    Assert-Website ($routeHtml -notmatch 'http-equiv="refresh"|location\.replace|artistul\.github\.io') "indexable route still behaves like a redirect helper: $route"
  }
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
foreach ($artifact in @("influx-operator-latest.apk", "influx-operator-auto-connect.apk", "influx-origin-technical-notebook.pdf", "influx-origin-logo.svg")) {
  $hash = (Get-FileHash (Join-Path $root "assets\$artifact") -Algorithm SHA256).Hash
  Assert-Website ($checksumText -match $hash) "checksum is stale or missing: $artifact"
}

if ($failures.Count) {
  Write-Host "`nWebsite checks failed ($($failures.Count)):" -ForegroundColor Red
  $failures | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }

  if ($AllowFailedTests) {
    Write-Warning "Static website checks failed, but the failed-test override is enabled. Continuing anyway."
    exit 0
  }

  Write-Host "`nPublishing remains blocked. Run publish-website.ps1 and explicitly confirm the override, or use -AllowFailedTests." -ForegroundColor Yellow
  exit 1
}

Write-Host "Website checks passed."
Write-Host ("Estimated initial referenced assets: {0:N2} MB" -f ($initialBytes / 1MB))
Write-Host ("Technical stylesheet: {0} lines" -f ((Get-Content (Join-Path $root "technical.css")).Count))
