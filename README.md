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

## InFlux Thermal Mold Analyzer

This repository also contains a Windows 11 offline engineering prototype for thermal mold analysis.

Development launch:

```powershell
python -m pip install -r requirements.txt
python -m app.main
```

Smoke tests:

```powershell
.\scripts\run_thermal_smoke_tests.ps1
```

Build the executable:

```powershell
.\packaging\build_exe.ps1 -Clean
```

Build the Windows installer with desktop and Start Menu shortcuts:

```powershell
.\packaging\build_installer.ps1
```

The current solver is a first-version lumped transient heat-transfer model for useful engineering iteration, not full CFD. Water bodies are modeled as fixed-temperature cooling regions with convection into mold bodies. STEP import preserves separate named STEP bodies through the ASCII STEP body/product index; if a CAD export lacks named solids, use `examples\synthetic_mold_assembly.step` or the built-in demo mode while a stronger CAD-kernel importer is added.

Generated reports, CSVs, charts, logs, screenshots, and scaling benchmarks are written under `outputs\`.
