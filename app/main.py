from __future__ import annotations

import argparse
import multiprocessing as mp
from pathlib import Path

from app.geometry.step_importer import import_step, load_demo_geometry
from app.optimization.benchmark import run_benchmark
from app.optimization.sweep import SweepConfig, run_sweep
from app.reporting.exporter import create_session_dir, export_simulation, export_sweep
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


def main() -> int:
    mp.freeze_support()
    parser = argparse.ArgumentParser(description="InFlux Thermal Mold Analyzer")
    parser.add_argument("--headless-smoke", action="store_true", help="Run offline smoke test without opening the GUI.")
    parser.add_argument("--benchmark", action="store_true", help="Run worker scaling benchmark.")
    parser.add_argument("--benchmark-output", default="outputs/benchmark_scaling.csv")
    parser.add_argument("--import-step", default="", help="Import a STEP file and print detected bodies.")
    args = parser.parse_args()

    if args.import_step:
        for body in import_step(Path(args.import_step)):
            print(body.as_dict())
        return 0
    if args.headless_smoke:
        return run_headless_smoke()
    if args.benchmark:
        run_benchmark(Path(args.benchmark_output))
        return 0

    from app.gui.main_window import launch

    return launch()


if __name__ == "__main__":
    raise SystemExit(main())
