# Website Audit Baseline

Recorded on 2026-06-13 against a local static HTTP server.

## Before P0/P1

- Home observed 13 images, 2 scripts, and 1 stylesheet.
- Approximate initially referenced assets: 4.11 MB.
- `model-viewer.min.js` loaded globally: 0.99 MB.
- Interactive GLB referenced from a hidden panel: 12.05 MB.
- Hidden panels contained eagerly loaded images.
- `technical.css`: 1,690 lines.
- Confirmed defects: clipped 320 px hero headline, hidden dossier anchors, missing focus-visible states, and incomplete tab keyboard semantics.

## After P0/P1

- Home observes 4 images, 1 script, and 1 stylesheet.
- Estimated initial referenced assets: 0.16 MB before HTTP compression.
- Eleven hidden-panel images remain unhydrated until their panel opens.
- The viewer runtime and GLB remain unloaded until the visitor selects the explicit 3D load action.
- The interactive GLB was optimized and validated from 12.05 MB to 0.31 MB.
- `technical.css`: 279 lines.
- Verified viewports: 320x568, 390x844, and 1440x900.
- Verified interactions: tab arrow keys, mobile menu Escape/focus restoration, conditional 3D loading, download metadata, active dossier contents, and fixed-header anchor offset.

## After P2

- Added optimized team portraits for Stefan and David; Fabian uses an explicit initials placeholder because no suitable portrait was available.
- Evidence 3 now uses a purpose-built landscape image while preserving the existing evidence copy.
- Added canonical URLs, Open Graph/Twitter metadata, Product and TechnicalArticle structured data, `robots.txt`, and `sitemap.xml`.
- Added clean route aliases for machine, components, team, evidence, downloads, and resources.
- Published SHA-256 checksums for the APK, technical notebook PDF, and logo.
- Added responsive visual regression coverage at 320, 390, 768, and 1440 px, plus interaction coverage for conditional 3D loading and the mobile dossier contents control.
- Estimated initial referenced assets: 0.17 MB before HTTP compression.
- `technical.css`: 295 lines.

## After P3

- Rebuilt Machine Versions and Other Projects around the supplied editorial-stage references.
- Removed Rapid Mold Program, leaving the three active connected projects.
- Built and rendered the current Android Operator app into three optimized showcase screens: Dashboard, Run, and Movement.
- Reused the landscape motherboard asset on both Proof and Other Projects.
- Updated Evidence 3 control-ownership copy.
- Replaced the static prototype-limit list with four accessible animated progress rails and a liquid-edge treatment.
- Added direct desktop visual regression coverage and mobile overflow coverage for the redesigned stages.

## Repeatable Check

Run:

```powershell
.\scripts\check-website.ps1
```

The script validates local references, loading architecture, ARIA relationships, keyboard support markers, responsive breakpoint coverage, evidence/specification content, metadata, clean routes, checksums, encoding, and asset budgets.

Run browser regression tests:

```powershell
npm install
npx playwright install chromium
npm test
```
