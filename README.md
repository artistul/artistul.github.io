# InFlux Origin MK1 Website

Static GitHub Pages showcase for the InFlux compact injection molding project.

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
- Compressed project media from `C:\Users\toneg\Desktop\InFlux\General Media`
- Latest InFlux Operator APK as `assets/influx-operator-latest.apk`
- No build step
