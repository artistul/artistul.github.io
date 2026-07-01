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

This repository also contains a Windows 11 offline engineering prototype for thermal mold analysis of injection mold cooling layouts.

Current capabilities:

- Import STEP files while preserving separate named bodies when the STEP export contains body/product names.
- Load a built-in synthetic clamped mold demo when a real CAD import is not ready.
- Classify bodies as mold, injected plastic, water/cooling channel, or ignored.
- Run a first-version transient thermal model over repeated injection cycles.
- Treat water bodies as fixed-temperature cooling regions with convection into mold bodies.
- Run parameter sweeps in parallel on CPU workers.
- Monitor CPU, app CPU, RAM, disk, active jobs, completed jobs, simulations/minute, and throttling state.
- Export CSV, chart PNG, log JSON, screenshots, and an HTML report.
- Build a PyInstaller executable and Inno Setup installer with desktop and Start Menu shortcuts.

Still simplified:

- The solver is a lumped transient heat-transfer prototype, not FEM and not CFD.
- STEP visualization currently uses placeholder bounding boxes based on detected bodies. True CAD tessellation should be added as an optional importer path using OCP/CadQuery/FreeCAD without breaking the current fallback.
- GPU compute is not implemented yet. GPU/HYBRID backend choices are exposed in the UI, but they clearly fall back to CPU and make no fake GPU utilization claims.
- AMD VRAM usage telemetry is currently a clean placeholder when reliable offline telemetry is unavailable.

Run from source:

```powershell
python -m pip install -r requirements.txt
python -m app.main
```

Headless smoke test:

```powershell
.\scripts\run_thermal_smoke_tests.ps1
```

Hybrid MAX benchmark:

```powershell
.\scripts\run_thermal_benchmark.ps1
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

### Hybrid MAX - Ștefan Workstation

The `Hybrid MAX - Ștefan Workstation` preset targets:

- Windows 11
- AMD Ryzen 9 9950X, 16 physical cores / 32 logical threads
- 64 GB system RAM
- AMD Radeon RX 9070 XT, 16 GB VRAM
- Samsung 9100 Pro preferred for cache/temp/output, with the project `outputs\` folder as the default path

Default reserves:

- 2 physical cores / 4 logical threads for Windows, browser, Codex, drivers, and GUI responsiveness
- 8 GB system RAM free reserve
- emergency minimum of 4 GB free RAM; the app must not intentionally go below this
- 2 GB VRAM reserved for display/browser/desktop responsiveness

App limits in this preset:

- CPU budget capped at 14 physical cores / 28 logical threads
- recommended heavy CPU worker count: 24-26 workers
- RAM cap: 56 GB
- aggressive RAM cap: 60 GB
- VRAM cap: 14 GB
- backend: `HYBRID_MAX_STEFAN`, currently CPU fallback until a real GPU backend exists

Safe override guidance:

- Use `Background` while doing CAD/browser work.
- Use `Normal` for ordinary checks.
- Use `Heavy` for longer CPU sweeps when you still need the desktop responsive.
- Use `Hybrid MAX - Ștefan Workstation` for serious sweeps on Stefan's workstation.
- Use `Custom` only when you know why you are changing workers, RAM cap, minimum free RAM, VRAM cap, priority, affinity, or backend.
- Keep worker priority at `normal` or `below_normal` unless you explicitly accept the risk of desktop sluggishness.
- If free RAM drops below 8 GB, scheduling throttles. If free RAM drops below 4 GB, scheduling pauses.
