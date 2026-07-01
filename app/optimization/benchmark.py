from __future__ import annotations

import argparse
import csv
from pathlib import Path
from time import perf_counter

from app.geometry.step_importer import load_demo_geometry
from app.optimization.sweep import SweepConfig, run_sweep
from app.simulation.resources import detect_resources
from app.simulation.solver import SimulationConfig


def run_benchmark(output: Path, worker_counts: list[int] | None = None) -> list[dict[str, float]]:
    resources = detect_resources()
    counts = worker_counts or sorted({1, min(2, resources.logical_threads), min(4, resources.logical_threads), min(8, resources.logical_threads)})
    bodies = load_demo_geometry()
    base = SimulationConfig(timestep_s=0.05, cycle_time_s=60.0, cycles=20)
    rows: list[dict[str, float]] = []
    baseline = None
    for workers in counts:
        sweep = SweepConfig(
            water_temperatures_c=(18.0, 20.0, 22.0, 24.0, 26.0, 28.0),
            convection_w_m2k=(1500.0, 2500.0, 3500.0, 4500.0),
            cycle_times_s=(40.0, 50.0, 60.0, 70.0),
            workers=workers,
        )
        started = perf_counter()
        result = run_sweep(bodies, base, sweep)
        elapsed = perf_counter() - started
        if baseline is None:
            baseline = elapsed
        rows.append(
            {
                "workers": float(workers),
                "cases": float(len(result)),
                "elapsed_s": elapsed,
                "cases_per_minute": len(result) / elapsed * 60.0,
                "speedup_vs_1_worker": float(baseline / elapsed) if elapsed else 0.0,
            }
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return rows


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="outputs/benchmark_scaling.csv")
    parser.add_argument("--workers", default="", help="Comma-separated worker counts, e.g. 1,2,4,8")
    args = parser.parse_args()
    counts = [int(item) for item in args.workers.split(",") if item.strip()] or None
    rows = run_benchmark(Path(args.output), counts)
    for row in rows:
        print(row)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
