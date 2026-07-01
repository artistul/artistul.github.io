from __future__ import annotations

from concurrent.futures import ProcessPoolExecutor, as_completed
from dataclasses import dataclass
from itertools import product
from time import sleep
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
            solver_mode=base.solver_mode,
            timestep_s=base.timestep_s,
            cycle_time_s=cycle_time,
            cycles=base.cycles,
            water_temperature_c=water_temp,
            convection_w_m2k=convection,
            target_ejection_temperature_c=base.target_ejection_temperature_c,
            mold_contact_multiplier=base.mold_contact_multiplier,
            mesh_size_mm=base.mesh_size_mm,
            max_mesh_elements=base.max_mesh_elements,
            plastic_mold_contact_conductance_w_m2k=base.plastic_mold_contact_conductance_w_m2k,
            mold_mold_contact_conductance_w_m2k=base.mold_mold_contact_conductance_w_m2k,
            water_boundary_mode=base.water_boundary_mode,
            elmer_processes=base.elmer_processes,
            solver_timeout_s=base.solver_timeout_s,
            keep_solver_files=base.keep_solver_files,
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
    should_pause: Callable[[], tuple[bool, str]] | None = None,
    should_cancel: Callable[[], bool] | None = None,
    throttle_update: Callable[[str], None] | None = None,
) -> list[dict[str, float | str]]:
    cases = make_cases(base, sweep)
    workers = max(1, min(int(sweep.workers), len(cases)))
    started = perf_counter()
    rows: list[dict[str, float | str]] = []
    if workers == 1:
        for done, config in enumerate(cases, start=1):
            if should_cancel and should_cancel():
                break
            _wait_if_paused(should_pause, should_cancel, throttle_update)
            row = run_case((bodies, config))
            row["elapsed_s"] = perf_counter() - started
            rows.append(row)
            if progress:
                progress(done, len(cases), row)
        return rows

    with ProcessPoolExecutor(max_workers=workers) as executor:
        pending = []
        case_iter = iter(cases)
        submitted = 0
        done = 0

        while True:
            if should_cancel and should_cancel():
                for future in pending:
                    future.cancel()
                break

            while len(pending) < workers and submitted < len(cases):
                paused, reason = should_pause() if should_pause else (False, "")
                if paused:
                    if throttle_update:
                        throttle_update(reason)
                    break
                config = next(case_iter)
                pending.append(executor.submit(run_case, (bodies, config)))
                submitted += 1

            if not pending:
                if submitted >= len(cases):
                    break
                _wait_if_paused(should_pause, should_cancel, throttle_update)
                continue

            completed_now = [future for future in pending if future.done()]
            if not completed_now:
                sleep(0.05)
                continue

            for future in completed_now:
                pending.remove(future)
                row = future.result()
                row["elapsed_s"] = perf_counter() - started
                rows.append(row)
                done += 1
                if progress:
                    progress(done, len(cases), row)
    rows.sort(key=lambda item: float(item["score"]))
    return rows


def _wait_if_paused(
    should_pause: Callable[[], tuple[bool, str]] | None,
    should_cancel: Callable[[], bool] | None,
    throttle_update: Callable[[str], None] | None,
) -> None:
    while should_pause:
        paused, reason = should_pause()
        if not paused:
            return
        if throttle_update:
            throttle_update(reason)
        if should_cancel and should_cancel():
            return
        sleep(0.2)
