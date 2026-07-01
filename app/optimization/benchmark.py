from __future__ import annotations

import argparse
import csv
from pathlib import Path
from time import perf_counter
from datetime import datetime

from app.geometry.step_importer import load_demo_geometry
from app.optimization.sweep import SweepConfig, run_sweep
from app.simulation.profiles import PRESET_HYBRID_STEFAN_RO, get_resource_profile
from app.simulation.resources import detect_resources, sample_resource_snapshot, ResourceLimits
from app.simulation.solver import SimulationConfig


def run_benchmark(output: Path, worker_counts: list[int] | None = None) -> list[dict[str, float | str]]:
    resources = detect_resources()
    profile = get_resource_profile(PRESET_HYBRID_STEFAN_RO, resources)
    default_counts = [1, 4, 8, 16, 24, 26, 28]
    counts = worker_counts or [count for count in default_counts if count <= max(1, profile.cpu_affinity_workers)]
    counts = sorted(set(max(1, min(count, profile.cpu_affinity_workers)) for count in counts))
    bodies = load_demo_geometry()
    base = SimulationConfig(timestep_s=0.08, cycle_time_s=45.0, cycles=12)
    rows: list[dict[str, float | str]] = []
    baseline = None
    machine_info = (
        f"{resources.physical_cores} physical cores / {resources.logical_threads} logical threads, "
        f"{resources.total_ram_gb:.1f} GB RAM, GPU: {resources.gpu_summary}"
    )
    for workers in counts:
        sweep = SweepConfig(
            water_temperatures_c=(18.0, 22.0, 26.0, 30.0),
            convection_w_m2k=(1500.0, 3000.0, 6000.0),
            cycle_times_s=(30.0, 45.0, 60.0),
            workers=workers,
        )
        before = sample_resource_snapshot(_limits_from_profile(profile), workers_active=workers)
        started = perf_counter()
        result = run_sweep(bodies, base, sweep)
        elapsed = perf_counter() - started
        after = sample_resource_snapshot(_limits_from_profile(profile), workers_active=0)
        if baseline is None:
            baseline = elapsed
        rows.append(
            {
                "timestamp": datetime.now().isoformat(timespec="seconds"),
                "selected_profile": profile.name,
                "machine_info": machine_info,
                "workers": workers,
                "cases": len(result),
                "elapsed_s": elapsed,
                "cases_per_minute": len(result) / elapsed * 60.0,
                "speedup_vs_1_worker": float(baseline / elapsed) if elapsed else 0.0,
                "ram_free_before_gb": before.ram_free_gb,
                "ram_free_after_gb": after.ram_free_gb,
                "app_ram_after_gb": after.app_ram_gb,
                "ram_cap_gb": profile.ram_cap_gb,
                "min_free_ram_gb": profile.min_free_ram_gb,
            }
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    with output.open("w", newline="", encoding="utf-8-sig") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return rows


def _limits_from_profile(profile) -> ResourceLimits:
    return ResourceLimits(
        ram_cap_gb=profile.ram_cap_gb,
        aggressive_ram_cap_gb=profile.aggressive_ram_cap_gb,
        min_free_ram_gb=profile.min_free_ram_gb,
        emergency_free_ram_gb=profile.emergency_free_ram_gb,
        vram_cap_gb=profile.vram_cap_gb,
        cache_output_path=profile.cache_output_path,
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="outputs/benchmark_hybrid_max.csv")
    parser.add_argument("--workers", default="", help="Comma-separated worker counts, e.g. 1,2,4,8")
    args = parser.parse_args()
    counts = [int(item) for item in args.workers.split(",") if item.strip()] or None
    rows = run_benchmark(Path(args.output), counts)
    for row in rows:
        print(row)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
