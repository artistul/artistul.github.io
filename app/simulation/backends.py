from __future__ import annotations

from dataclasses import dataclass
from enum import Enum

from app.geometry.bodies import Body
from app.simulation.solver import SimulationConfig, SimulationResult, run_transient_simulation


class BackendMode(str, Enum):
    FAST_PREVIEW = "FAST_PREVIEW"
    ELMER_THERMAL_FEM = "ELMER_THERMAL_FEM"
    CPU_SAFE = "CPU_SAFE"
    CPU_MAX = "CPU_MAX"
    HYBRID_MAX_STEFAN = "HYBRID_MAX_STEFAN"
    GPU_PLACEHOLDER = "GPU_PLACEHOLDER"
    GPU_OPENCL = "GPU_OPENCL"
    GPU_HIP = "GPU_HIP"


@dataclass(frozen=True, slots=True)
class BackendSelection:
    requested: BackendMode
    effective: BackendMode
    message: str
    gpu_enabled: bool = False


def resolve_backend(requested: str | BackendMode, cpu_only: bool = False, gpu_available: bool = False) -> BackendSelection:
    mode = requested if isinstance(requested, BackendMode) else BackendMode(str(requested))
    if mode == BackendMode.FAST_PREVIEW:
        return BackendSelection(mode, mode, "Fast preview lumped solver selected.", False)
    if mode == BackendMode.ELMER_THERMAL_FEM:
        return BackendSelection(mode, mode, "Elmer FEM accurate backend selected.", False)
    if cpu_only:
        return BackendSelection(mode, BackendMode.CPU_SAFE, "CPU-only override enabled; using CPU solver.", False)
    if mode in {BackendMode.CPU_SAFE, BackendMode.CPU_MAX}:
        return BackendSelection(mode, mode, "CPU solver selected.", False)
    if mode in {BackendMode.HYBRID_MAX_STEFAN, BackendMode.GPU_PLACEHOLDER, BackendMode.GPU_OPENCL, BackendMode.GPU_HIP}:
        if not gpu_available:
            return BackendSelection(
                mode,
                BackendMode.CPU_MAX if mode == BackendMode.HYBRID_MAX_STEFAN else BackendMode.CPU_SAFE,
                "GPU solver not implemented yet; using CPU fallback. No GPU utilization is claimed.",
                False,
            )
    return BackendSelection(mode, mode, "Backend selected.", gpu_available)


def run_simulation_backend(
    bodies: list[Body],
    config: SimulationConfig,
    requested: str | BackendMode,
    cpu_only: bool = False,
    gpu_available: bool = False,
) -> tuple[SimulationResult, BackendSelection]:
    selection = resolve_backend(requested, cpu_only=cpu_only, gpu_available=gpu_available)
    if selection.requested == BackendMode.ELMER_THERMAL_FEM and not cpu_only:
        from app.simulation.elmer_backend import ElmerUnavailable, run_elmer_transient, fallback_preview_result

        try:
            result = run_elmer_transient(bodies, config)
        except ElmerUnavailable as exc:
            result = fallback_preview_result(bodies, config, str(exc))
            selection = BackendSelection(
                BackendMode.ELMER_THERMAL_FEM,
                BackendMode.FAST_PREVIEW,
                f"Elmer FEM unavailable; using FAST_PREVIEW fallback. {exc}",
                False,
            )
    else:
        result = run_transient_simulation(bodies, config)
    if selection.message not in result.assumptions:
        result.assumptions.append(selection.message)
    return result, selection
