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
- Added per-body CadQuery tessellation for the 3D viewer with bounding-box fallback when tessellation fails.
- Added GUI body metadata columns and import warning display.
- Tested `C:\Users\Stefan\Desktop\design matrita watercooled -sim.step`; it is detected as 5 separate solids: main mold half, secondary mold half, injected part, and two water bodies.

## 0.3.1 - 2026-07-01

- Fixed resource monitor GPU detection so the GUI does not spawn visible PowerShell/CMD windows every refresh.
- Cached static GPU adapter detection during a session while keeping VRAM usage telemetry honestly reported as unavailable when no robust AMD telemetry path exists.
