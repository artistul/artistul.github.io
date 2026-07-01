from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass
from itertools import product
from time import perf_counter
from typing import Callable

from app.geometry.bodies import Body
from app.simulation.solver import SimulationConfig, run_transient_simulation


@dataclass(frozen=True, slots=True)
class SweepConfig:
    water_temperatures_c: tuple[float, ...] = (18.0, 22.0, 26.0)
    convection_w_m2k: tuple[float, ...] = (1500.0, 3000.0, 6000.0)
    cycle_times_s: tuple[float, ...] = (20.0, 30.0, 40.0)
    workers: int = 1


def make_cases(base: SimulationConfig, sweep: SweepConfig) -> list[SimulationConfig]:
    return [
        SimulationConfig(
            timestep_s=base.timestep_s,
            cycle_time_s=cycle_time,
            cycles=base.cycles,
            water_temperature_c=water_temp,
            convection_w_m2k=convection,
            target_ejection_temperature_c=base.target_ejection_temperature_c,
            mold_contact_multiplier=base.mold_contact_multiplier,
        )
        for water_temp, convection, cycle_time in product(
            sweep.water_temperatures_c,
            sweep.convection_w_m2k,
            sweep.cycle_times_s,
        )
    ]


def run_case(payload: tuple[list[Body], SimulationConfig]) -> dict[str, float | str]:
    bodies, config = payload
    result = run_transient_simulation(bodies, config)
    ejection = result.summary["ejection_time_s"]
    ejection_score = float(ejection) if isinstance(ejection, float) else config.cycle_time_s * config.cycles * 10.0
    score = ejection_score + max(0.0, float(result.summary["peak_mold_c"]) - 60.0) * 0.5
    return {
        "water_temperature_c": config.water_temperature_c,
        "convection_w_m2k": config.convection_w_m2k,
        "cycle_time_s": config.cycle_time_s,
        "final_max_plastic_c": float(result.summary["final_max_plastic_c"]),
        "final_avg_mold_c": float(result.summary["final_avg_mold_c"]),
        "peak_mold_c": float(result.summary["peak_mold_c"]),
        "ejection_time_s": ejection if isinstance(ejection, float) else -1.0,
        "score": float(score),
    }


def run_sweep(
    bodies: list[Body],
    base: SimulationConfig,
    sweep: SweepConfig,
    progress: Callable[[int, int, dict[str, float | str]], None] | None = None,
) -> list[dict[str, float | str]]:
    cases = make_cases(base, sweep)
    workers = max(1, min(int(sweep.workers), len(cases)))
    started = perf_counter()
    rows: list[dict[str, float | str]] = []
    if workers == 1:
        for done, config in enumerate(cases, start=1):
            row = run_case((bodies, config))
            row["elapsed_s"] = perf_counter() - started
            rows.append(row)
            if progress:
                progress(done, len(cases), row)
        return rows

    with ProcessPoolExecutor(max_workers=workers) as executor:
        futures = [executor.submit(run_case, (bodies, config)) for config in cases]
        for done, future in enumerate(as_completed(futures), start=1):
            row = future.result()
            row["elapsed_s"] = perf_counter() - started
            rows.append(row)
            if progress:
                progress(done, len(cases), row)
    rows.sort(key=lambda item: float(item["score"]))
    return rows
