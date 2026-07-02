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

- Import STEP files through an OCP geometry pipeline when available, recursively traversing assemblies, compounds, nested labels, components, and solids.
- Preserve separate simulation bodies from real STEP solids and collect hierarchy path, volume, bounding box, face count, and tessellation status.
- Save STEP diagnostics under `outputs\step_diagnostics\`.
- Load a built-in synthetic clamped mold demo when a real CAD import is not ready.
- Classify bodies as mold, injected plastic, water/cooling channel, or ignored.
- Run a first-version transient thermal model over repeated injection cycles.
- Select an `Elmer FEM Accurate` backend path that prepares an external Gmsh/Elmer transient thermal workflow when the Elmer runtime is installed.
- Treat water bodies as fixed-temperature cooling regions with convection into mold bodies.
- Run parameter sweeps in parallel on CPU workers.
- Monitor CPU, app CPU, RAM, disk, active jobs, completed jobs, simulations/minute, and throttling state.
- Export CSV, chart PNG, log JSON, screenshots, and an HTML report.
- Build a PyInstaller executable and Inno Setup installer with desktop and Start Menu shortcuts.

Still simplified:

- The solver is a lumped transient heat-transfer prototype, not FEM and not CFD.
- The new Elmer FEM path is an early external-solver integration. It can create Gmsh/Elmer run artifacts when the external runtime is present, but falls back loudly to `FAST_PREVIEW` if Elmer is not installed.
- STEP visualization uses true per-body mesh tessellation through OCP when supported. If tessellation fails, the viewer keeps a labeled bounding-box fallback instead of crashing.
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

Inspect a STEP file without opening the GUI:

```powershell
python -m app.main --inspect-step "C:\Users\Stefan\Desktop\design matrita watercooled -sim.step"
```

Diagnostics are written to:

- `outputs\step_diagnostics\step_tree.txt`
- `outputs\step_diagnostics\step_bodies.csv`
- `outputs\step_diagnostics\step_import_log.txt`

The current real CAD test file `C:\Users\Stefan\Desktop\design matrita watercooled -sim.step` is detected as 5 separate solids through OCP/XCAF:

- `Main half:1`
- `Secondary half:1`
- `Injected part:1`
- `Main half water:1`
- `Secondary half water:1`

If a future STEP file only detects 1-2 bodies when more domains are expected, re-export the CAD so mold halves, water volumes, and injected plastic are separate bodies/components with preserved names.

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

The current solver is a first-version lumped transient heat-transfer model for useful engineering iteration, not full CFD. Water bodies are modeled as fixed-temperature cooling regions with convection into mold bodies. STEP import uses OCP when available and falls back to the ASCII STEP body/product index when the CAD kernel cannot read the file.

### Accurate Elmer FEM backend

The GUI includes `Fast Preview` and `Elmer FEM Accurate` solver choices.

`Fast Preview` is the existing lumped thermal network and remains the default usable solver.

`Elmer FEM Accurate` is the new external FEM path:

- Uses Gmsh to create a volume mesh from the positioned classified bodies.
- Writes Elmer native `mesh.*` files directly from the Gmsh mesh. This avoids an observed ElmerGrid crash on some generated multi-body meshes.
- Writes a transient Elmer heat-transfer `.sif` case.
- Runs `ElmerSolver` as a hidden background process when Elmer is installed and available on `PATH`.
- Also auto-detects Stefan's local Elmer runtime under `%LOCALAPPDATA%\InFlux\Elmer\`.
- Reads Elmer VTU point temperatures back into InFlux and reports body-average temperature histories.
- Records mesh diagnostics, generated solver files, and assumptions in the exported report.
- Does not perform CFD and does not claim GPU acceleration.

Exact STEP tetrahedral meshing is required for validation-grade results. If exact STEP meshing fails, the app now stops by default and reports the meshing error. A separate `Allow simplified bbox fallback` checkbox can be enabled for non-validation preview runs; those results are labeled `NOT_VALIDATION_GRADE_SIMPLIFIED_GEOMETRY`. If `ElmerSolver` is not found, the app returns a clearly labeled `FAST_PREVIEW_FALLBACK` result instead of pretending FEM temperatures were produced.

The FEM panel now exposes a mesher strategy selector:

- `AUTO_EXACT_THEN_REPAIRED_SURFACE`: default cascade; tries exact healed Gmsh CAD meshing first, then falls back to repaired per-body surface tetra meshing when exact CAD volume meshing fails.
- `GMSH_OCC_HEALED_PER_BODY`: default exact-CAD path; runs OCP ShapeFix and same-domain unification before exporting positioned bodies to Gmsh.
- `GMSH_OCC_PER_BODY`: raw exact-CAD path; exports positioned solids per body without healing.
- `GMSH_OCC_WHOLE_STEP`: alternate exact-CAD path; asks Gmsh to import the full STEP assembly directly.
- `CONTROLLED_APPROX_CONFORMING_GRID`: conforming approximation path; classifies repaired CAD surfaces onto a shared grid, generates shared-node tetrahedra across material interfaces, and reports cell size plus maximum geometry deviation.
- `SURFACE_REPAIR_TETGEN_PER_BODY`: surface-repair fallback; triangulates each positioned body surface, repairs holes/self-intersections, tetrahedralizes each body independently, and writes body physical IDs for Elmer.
- `SIMPLIFIED_BBOX_PREVIEW`: non-validation preview only; meshes bounding boxes instead of the true CAD.

To diagnose exact CAD meshability without running Elmer:

```powershell
python -m app.main --mesh-diagnostics "C:\Users\Stefan\Desktop\design matrita watercooled -sim.step" --mesh-size-mm 8
```

This writes `outputs\mesh_diagnostics\mesh_diagnostics.txt`, `mesh_body_diagnostics.csv`, `mesh_body_diagnostics.json`, and raw/healed per-body positioned STEP exports. Diagnostics try the raw export first and then the healed export when needed. A body that still fails here is not ready for validation-grade FEM until the CAD-to-mesh issue is resolved or a stronger mesher path is added.

For Stefan's current real CAD model, exact Gmsh CAD volume meshing still fails on the mold halves and injected plastic, but the repaired-surface TetGen fallback produces nonzero tetrahedral domains for all five bodies and exports to Elmer native `mesh.*` files. This is FEM setup-ready but not yet validation-grade for thermal contact because the fallback meshes bodies independently with nonconformal interfaces.

Each FEM mesh workspace now writes `mesh_readiness.json` with the mesh strategy, node/element counts, body IDs, cooling IDs, tetra quality metrics, interface proximity evidence, and a readiness label. For the current repaired-surface fallback, the expected readiness label is `FEM_READY_NONCONFORMAL_REQUIRES_CONTACT_COUPLING_VALIDATION`.

The controlled conforming grid strategy has been verified on Stefan's current 5-body CAD at 2 mm cells: it produced 48,669 nodes, 252,168 tetrahedra, all 5 body domains, cooling interface triangles, zero zero-volume tetrahedra, and `FEM_READY_CONFORMING_APPROX_REQUIRES_DEVIATION_AND_CONVERGENCE_VALIDATION`. Its reported geometric deviation bound at 2 mm cells is about 1.73 mm, so it is a serious FEM setup path but still requires mesh-size convergence before validation-grade conclusions.

Mesh convergence/deviation study:

```powershell
python -m app.main --mesh-validation-study "C:\Users\Stefan\Desktop\design matrita watercooled -sim.step" --mesh-study-sizes 3,2 --mesh-study-output outputs\mesh_validation_real_cad
```

This writes `mesh_validation_study.csv`, `mesh_validation_study.json`, and `mesh_validation_report.html`. The current 3 mm / 2 mm real-CAD study finishes successfully but reports `FEM_READY_CONFORMING_APPROX_REQUIRES_FINER_DEVIATION_STUDY`, not validation-grade completion.

The finer real-CAD study at 1.0 mm / 0.75 mm reports `VALIDATION_GRADE_MESH_READY_PENDING_SOLVER_PHYSICS_VALIDATION`. The 0.75 mm mesh has 805,491 nodes, 4,552,074 tetrahedra, 137,198 interface/cooling triangles, all 5 body domains, 2 cooling groups, zero zero-volume tetrahedra, and a 0.65 mm maximum grid-deviation bound. The 1.0 mm to 0.75 mm convergence deltas are 4.88% max body-volume change and 10.67% max interface-area change.

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
