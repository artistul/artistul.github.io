from __future__ import annotations

import argparse
import multiprocessing as mp
from pathlib import Path

from app.geometry.step_importer import import_step, load_demo_geometry
from app.geometry.step_inspector import inspect_step
from app.optimization.benchmark import run_benchmark
from app.optimization.sweep import SweepConfig, run_sweep
from app.reporting.exporter import create_session_dir, export_simulation, export_sweep
from app.simulation.backends import BackendMode, run_simulation_backend
from app.simulation.mesh_pipeline import write_mesh_diagnostics
from app.simulation.solver import SimulationConfig, run_transient_simulation


def run_headless_smoke() -> int:
    bodies = load_demo_geometry()
    session = create_session_dir()
    result = run_transient_simulation(bodies, SimulationConfig(timestep_s=1.0, cycle_time_s=8.0, cycles=2))
    exports = export_simulation(session, bodies, result)
    rows = run_sweep(
        bodies,
        SimulationConfig(timestep_s=1.0, cycle_time_s=8.0, cycles=2),
        SweepConfig(water_temperatures_c=(20.0, 24.0), convection_w_m2k=(1500.0, 3000.0), cycle_times_s=(8.0,), workers=2),
    )
    sweep_csv = export_sweep(session, rows)
    print(f"Smoke OK: {len(bodies)} bodies, exports={exports}, sweep={sweep_csv}")
    return 0


def run_elmer_smoke() -> int:
    bodies = load_demo_geometry()
    config = SimulationConfig(
        solver_mode=BackendMode.ELMER_THERMAL_FEM.value,
        timestep_s=1.0,
        cycle_time_s=1.0,
        cycles=1,
        mesh_size_mm=35.0,
        max_mesh_elements=50_000,
        solver_timeout_s=120,
        keep_solver_files=True,
    )
    result, selection = run_simulation_backend(bodies, config, BackendMode.ELMER_THERMAL_FEM)
    print(f"Elmer smoke OK: requested={selection.requested.value}, effective={selection.effective.value}")
    print(f"Summary: {result.summary}")
    print(f"Mesh: {result.mesh_summary}")
    print(f"Workspace: {result.solver_files.get('workspace', '')}")
    return 0 if selection.effective == BackendMode.ELMER_THERMAL_FEM else 2


def main() -> int:
    mp.freeze_support()
    parser = argparse.ArgumentParser(description="InFlux Thermal Mold Analyzer")
    parser.add_argument("--headless-smoke", action="store_true", help="Run offline smoke test without opening the GUI.")
    parser.add_argument("--elmer-smoke", action="store_true", help="Run a tiny Elmer FEM smoke test without opening the GUI.")
    parser.add_argument("--benchmark", action="store_true", help="Run worker scaling benchmark.")
    parser.add_argument("--benchmark-output", default="outputs/benchmark_hybrid_max.csv")
    parser.add_argument("--import-step", default="", help="Import a STEP file and print detected bodies.")
    parser.add_argument("--inspect-step", default="", help="Inspect a STEP file and save diagnostics under outputs/step_diagnostics.")
    parser.add_argument("--mesh-diagnostics", default="", help="Probe exact per-body STEP meshing and save diagnostics under outputs/mesh_diagnostics.")
    parser.add_argument("--mesh-size-mm", type=float, default=8.0, help="Mesh size used by --mesh-diagnostics.")
    args = parser.parse_args()

    if args.import_step:
        for body in import_step(Path(args.import_step)):
            print(body.as_dict())
        return 0
    if args.inspect_step:
        inspection = inspect_step(Path(args.inspect_step))
        print(f"STEP inspection OK: {len(inspection.bodies)} bodies, kernel={inspection.used_kernel}")
        for warning in inspection.warnings:
            print(f"WARNING: {warning}")
        print("Diagnostics: outputs/step_diagnostics/step_tree.txt, step_bodies.csv, step_import_log.txt")
        return 0
    if args.mesh_diagnostics:
        bodies = import_step(Path(args.mesh_diagnostics))
        config = SimulationConfig(
            solver_mode=BackendMode.ELMER_THERMAL_FEM.value,
            mesh_size_mm=args.mesh_size_mm,
            max_mesh_elements=500_000,
            mesh_strategy="GMSH_OCC_HEALED_PER_BODY",
        )
        diagnostics = write_mesh_diagnostics(bodies, config)
        ok = sum(1 for diagnostic in diagnostics if diagnostic.volume_ok)
        print(f"Mesh diagnostics complete: {ok}/{len(diagnostics)} body variants exact-tetra meshed.")
        print("Diagnostics: outputs/mesh_diagnostics/mesh_diagnostics.txt, mesh_body_diagnostics.csv")
        for diagnostic in diagnostics:
            print(f"{diagnostic.body_id}: {diagnostic.name} [{diagnostic.variant}] -> {diagnostic.status}")
        return 0
    if args.headless_smoke:
        return run_headless_smoke()
    if args.elmer_smoke:
        return run_elmer_smoke()
    if args.benchmark:
        run_benchmark(Path(args.benchmark_output))
        return 0

    from app.gui.main_window import launch

    return launch()


if __name__ == "__main__":
    raise SystemExit(main())
