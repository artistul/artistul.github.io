from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from app.geometry.bodies import Body
from app.simulation.materials import get_material


@dataclass(frozen=True, slots=True)
class SimulationConfig:
    solver_mode: str = "FAST_PREVIEW"
    timestep_s: float = 0.5
    cycle_time_s: float = 30.0
    cycles: int = 3
    water_temperature_c: float = 22.0
    convection_w_m2k: float = 3000.0
    target_ejection_temperature_c: float = 75.0
    mold_contact_multiplier: float = 1.0
    mesh_size_mm: float = 4.0
    max_mesh_elements: int = 200_000
    plastic_mold_contact_conductance_w_m2k: float = 1800.0
    mold_mold_contact_conductance_w_m2k: float = 5000.0
    water_boundary_mode: str = "convection"
    elmer_processes: int = 1
    solver_timeout_s: int = 900
    keep_solver_files: bool = False


@dataclass(slots=True)
class SimulationResult:
    config: SimulationConfig
    times_s: list[float]
    body_temperatures_c: dict[str, list[float]]
    body_roles: dict[str, str]
    summary: dict[str, float | str]
    assumptions: list[str]
    mesh_summary: dict[str, float | int | str] = field(default_factory=dict)
    solver_files: dict[str, str] = field(default_factory=dict)


def run_transient_simulation(bodies: list[Body], config: SimulationConfig) -> SimulationResult:
    active = [body for body in bodies if body.role != "ignored"]
    if not active:
        raise ValueError("No active bodies are classified for simulation.")
    if not any(body.role == "plastic" for body in active):
        raise ValueError("At least one body must be classified as injected plastic.")
    if not any(body.role == "mold" for body in active):
        raise ValueError("At least one body must be classified as mold.")

    dt = max(0.02, float(config.timestep_s))
    steps_per_cycle = max(1, int(round(config.cycle_time_s / dt)))
    total_steps = steps_per_cycle * max(1, int(config.cycles))
    body_ids = [body.id for body in active]
    temperatures = np.array([body.initial_temperature_c for body in active], dtype=np.float64)
    initial_plastic = {idx: temperatures[idx] for idx, body in enumerate(active) if body.role == "plastic"}
    capacities = np.array([_thermal_capacity_j_k(body) for body in active], dtype=np.float64)
    water_indices = [idx for idx, body in enumerate(active) if body.role == "water"]

    history = {body.id: [float(temperatures[idx])] for idx, body in enumerate(active)}
    times = [0.0]
    conductance = _build_conductance_matrix(active, config)

    ejection_time = float("nan")
    for step in range(1, total_steps + 1):
        in_cycle_step = (step - 1) % steps_per_cycle
        if in_cycle_step == 0 and step > 1:
            for idx, temp in initial_plastic.items():
                temperatures[idx] = temp

        delta_q = np.zeros_like(temperatures)
        for i in range(len(active)):
            if active[i].role == "water":
                continue
            for j in range(len(active)):
                if i == j or conductance[i, j] == 0:
                    continue
                neighbor_temp = config.water_temperature_c if active[j].role == "water" else temperatures[j]
                delta_q[i] += conductance[i, j] * (neighbor_temp - temperatures[i])

        temperatures += (delta_q / capacities) * dt
        for idx in water_indices:
            temperatures[idx] = config.water_temperature_c

        current_time = step * dt
        times.append(float(current_time))
        for idx, body_id in enumerate(body_ids):
            history[body_id].append(float(temperatures[idx]))

        plastic_temps = [temperatures[idx] for idx, body in enumerate(active) if body.role == "plastic"]
        if np.isfinite(ejection_time) is False and max(plastic_temps) <= config.target_ejection_temperature_c:
            ejection_time = current_time

    final_plastic = [
        history[body.id][-1] for body in active if body.role == "plastic"
    ]
    final_mold = [
        history[body.id][-1] for body in active if body.role == "mold"
    ]
    peak_mold = max(
        max(history[body.id]) for body in active if body.role == "mold"
    )
    summary: dict[str, float | str] = {
        "solver_mode": config.solver_mode,
        "final_max_plastic_c": float(max(final_plastic)),
        "final_avg_mold_c": float(np.mean(final_mold)),
        "peak_mold_c": float(peak_mold),
        "ejection_time_s": float(ejection_time) if np.isfinite(ejection_time) else "not reached",
        "steps": float(total_steps),
        "dt_s": float(dt),
    }
    return SimulationResult(
        config=config,
        times_s=times,
        body_temperatures_c=history,
        body_roles={body.id: body.role for body in active},
        summary=summary,
        assumptions=[
            "FAST_PREVIEW lumped transient model, not FEM and not CFD.",
            "Water bodies are fixed-temperature cooling regions with convection to mold bodies.",
            "Plastic is reheated at the start of each cycle; mold temperature carries between cycles.",
            "STEP bodies are imported through the available geometry pipeline; tessellation falls back to bounding boxes when needed.",
        ],
    )


def _thermal_capacity_j_k(body: Body) -> float:
    material = get_material(body.material)
    volume_m3 = max(body.volume_mm3, 1.0) * 1e-9
    return max(1.0, material.density_kg_m3 * volume_m3 * material.specific_heat_j_kgk)


def _build_conductance_matrix(bodies: list[Body], config: SimulationConfig) -> np.ndarray:
    count = len(bodies)
    matrix = np.zeros((count, count), dtype=np.float64)
    for i, a in enumerate(bodies):
        for j, b in enumerate(bodies):
            if i == j:
                continue
            if a.role == "ignored" or b.role == "ignored":
                continue
            distance_mm = _center_distance_mm(a, b)
            area_m2 = _interaction_area_m2(a, b)
            if a.role == "water" or b.role == "water":
                if "mold" in {a.role, b.role}:
                    matrix[i, j] = config.convection_w_m2k * area_m2
            elif {a.role, b.role} == {"plastic", "mold"}:
                matrix[i, j] = 1800.0 * area_m2 * config.mold_contact_multiplier / max(1.0, distance_mm / 12.0)
            elif a.role == "mold" and b.role == "mold":
                matrix[i, j] = 900.0 * area_m2 / max(1.0, distance_mm / 20.0)
    return matrix


def _center_distance_mm(a: Body, b: Body) -> float:
    ax, ay, az = a.center_mm
    bx, by, bz = b.center_mm
    return float(np.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2))


def _interaction_area_m2(a: Body, b: Body) -> float:
    ax, ay, az = a.size_mm
    bx, by, bz = b.size_mm
    area_a = sorted([ax * ay, ax * az, ay * az])[1]
    area_b = sorted([bx * by, bx * bz, by * bz])[1]
    return max(1e-6, min(area_a, area_b) * 1e-6)
