# InFlux Origin MK1 Website

Static GitHub Pages showcase for the InFlux compact injection molding project.

This repository is website-only. The Windows mold analysis application lives in:

```text
C:\Users\Stefan\Documents\Influx-Mold-Analyzer
```

## Local Preview

Open `index.html` directly in a browser, or serve the folder with any static server.

Run the static website checks:

```powershell
.\scripts\check-website.ps1
```

Run responsive interaction and screenshot regression tests:

```powershell
npm install
npm run test:update
npm test
```

Responsive verification targets:

- `320x568`
- `390x844`
- `768x1024`
- `1440x900`

The interactive 3D assembly is intentionally loaded only after explicit user action.

## Included

- Product-style landing page
- Project media and downloadable assets
- Latest InFlux Operator APK as `assets/influx-operator-latest.apk`
- Static pages for contact, evidence, sponsorship, team, machine, components, and downloads
- No build step

## Publishing

Publish from the repository root:

```powershell
.\scripts\publish-website.ps1
```

Update the local website from GitHub:

```powershell
.\scripts\update-website-from-github.ps1
```

The publish/update scripts resolve the repository path from their own location, so the folder can be renamed without editing hardcoded paths.

Live site:

- https://influxorigin.ro
- https://artistul.github.io
