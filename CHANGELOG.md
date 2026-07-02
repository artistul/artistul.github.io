# Changelog

## 0.1.0 - 2026-07-01

- Added the first runnable InFlux Thermal Mold Analyzer desktop prototype.
- Added STEP named-body import with fallback/demo geometry.
- Added body classification, simplified transient thermal solver, repeated cycles, water cooling regions, parallel sweeps, report exports, tests, PyInstaller packaging, and Inno Setup installer scripts.
- Added benchmark output showing multi-worker CPU scaling on the demo workload.

## 0.2.0 - 2026-07-01

- Added `Hybrid MAX - Ștefan Workstation` resource profile with 28-thread CPU cap, 24-26 recommended workers, 56 GB default RAM cap, 60 GB aggressive cap, 8 GB RAM reserve, 4 GB emergency minimum, and 14 GB VRAM cap.
- Added selectable resource presets: Background, Normal, Heavy, Hybrid MAX - Ștefan Workstation, and Custom.
- Added backend modes: `CPU_SAFE`, `CPU_MAX`, `HYBRID_MAX_STEFAN`, `GPU_PLACEHOLDER`, future `GPU_OPENCL`, and future `GPU_HIP`.
- Added honest GPU/HYBRID CPU fallback messaging and placeholder AMD VRAM telemetry reporting.
- Added runtime resource snapshots, visible throttling state/reason, pause/resume/cancel controls, and gradual sweep scheduling.
- Added Hybrid MAX benchmark output at `outputs/benchmark_hybrid_max.csv`.
- Added tests for resource profiles, worker/RAM limits, backend fallback, throttling, and real CAD import handling.

## 0.3.0 - 2026-07-01

- Added `--inspect-step` CLI diagnostics for real STEP files.
- Added recursive OCP/XCAF assembly traversal with hierarchy paths, body metadata, volume, bounding box, face count, and tessellation status.
- Added per-body OCP tessellation for the 3D viewer with bounding-box fallback when tessellation fails.
- Added GUI body metadata columns and import warning display.
- Tested `C:\Users\Stefan\Desktop\design matrita watercooled -sim.step`; it is detected as 5 separate solids: main mold half, secondary mold half, injected part, and two water bodies.

## 0.3.1 - 2026-07-01

- Fixed resource monitor GPU detection so the GUI does not spawn visible PowerShell/CMD windows during live refresh.
- Disabled subprocess-based GPU/VRAM probing in the live GUI monitor while keeping GPU usage honestly reported as unavailable.
- Reduced the 3D viewer preview triangle budget for tessellated CAD bodies to improve responsiveness on real STEP imports.
- Cached 3D viewer preview meshes and reused the Matplotlib axes between redraws to speed up classification and temperature display updates.
- Removed the CadQuery runtime dependency from the STEP inspection path to avoid packaged-app CasADi DLL loading failures.

## 0.3.2 - 2026-07-01

- Fixed STEP assembly placement by reading tessellation and bounding boxes from positioned XCAF component instances before falling back to target part definitions.
- Added a regression check for the real CAD file to catch secondary mold half placement regressions.
- Rebuilt and reinstalled the packaged app so the desktop shortcut uses the corrected STEP importer.

## 0.4.0 - 2026-07-01

- Added the first Elmer FEM accurate-backend integration path with new `FAST_PREVIEW` and `ELMER_THERMAL_FEM` solver modes.
- Added a Gmsh mesh pipeline that can mesh classified STEP bodies when possible and demo bodies as positioned boxes.
- Added Elmer workspace generation, ElmerGrid conversion, transient heat-transfer `.sif` writing, hidden ElmerSolver execution, and solver artifact reporting.
- Added GUI controls for solver mode, mesh size, mesh limit, contact conductance values, water boundary mode, Elmer process count, timeout, and solver-file retention.
- Added honest fallback behavior when Elmer/Gmsh are unavailable; fallback results are labeled as `FAST_PREVIEW_FALLBACK`, not FEM output.

## 0.4.1 - 2026-07-01

- Completed the Elmer FEM path so it runs ElmerSolver, reads VTU point temperatures through meshio, and returns Elmer-derived body temperature histories.
- Installed and auto-detects Stefan's local Elmer no-GUI Windows runtime under `%LOCALAPPDATA%\InFlux\Elmer\`.
- Replaced ElmerGrid conversion with direct Elmer native `mesh.*` writing to avoid ElmerGrid crashes on generated Gmsh meshes.
- Added repeated-cycle support for Elmer using body-average thermal restart: plastic reheats while mold carries prior FEM body averages.
- Added exact STEP mesh failure handling for the real CAD file; when Gmsh rejects duplicate/overlapping facets, Elmer runs a clearly labeled positioned bounding-box FEM fallback.

## 0.4.2 - 2026-07-02

- Added positioned per-body STEP export before Gmsh meshing so exact FEM preparation uses the same placed OCP solids as the viewer/import pipeline.
- Changed simplified bounding-box FEM fallback from automatic to explicit opt-in through `Allow simplified bbox fallback`.
- Added Elmer result validation status labels so reports distinguish exact-geometry FEM from non-validation simplified-geometry preview runs.

## 0.4.3 - 2026-07-02

- Added `--mesh-diagnostics` to probe exact per-body CAD meshability before running Elmer.
- Added mesh diagnostic exports under `outputs/mesh_diagnostics/`, including per-body positioned STEP exports, CSV, JSON, and a human-readable summary.
- Added selectable mesher strategies: `GMSH_OCC_PER_BODY`, `GMSH_OCC_WHOLE_STEP`, and `SIMPLIFIED_BBOX_PREVIEW`.
- Updated failed Elmer exact-mesh runs to write mesh diagnostics when possible, so CAD/mesher failures are actionable.
