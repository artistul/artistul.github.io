from __future__ import annotations

import json
import os
import copy
import shutil
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import numpy as np

from app.geometry.bodies import Body
from app.simulation.materials import get_material
from app.simulation.mesh_pipeline import MeshPipelineError, MeshPipelineResult, build_gmsh_mesh, write_mesh_diagnostics
from app.simulation.solver import SimulationConfig, SimulationResult, run_transient_simulation


class ElmerUnavailable(RuntimeError):
    """Raised when the Elmer/Gmsh toolchain is not available on this machine."""


class ElmerRuntimeError(RuntimeError):
    """Raised when Elmer files can be generated but the solve pipeline fails."""


@dataclass(frozen=True, slots=True)
class ElmerRuntime:
    elmer_grid: str
    elmer_solver: str
    home: str = ""


def find_elmer_runtime() -> ElmerRuntime | None:
    grid = shutil.which("ElmerGrid") or shutil.which("ElmerGrid.exe")
    solver = shutil.which("ElmerSolver") or shutil.which("ElmerSolver.exe")
    if solver:
        home = str(Path(solver).resolve().parent.parent)
        return ElmerRuntime(grid or "", solver, home)
    for candidate in _candidate_elmer_homes():
        candidate_grid = candidate / "bin" / "ElmerGrid.exe"
        candidate_solver = candidate / "bin" / "ElmerSolver.exe"
        if candidate_solver.exists():
            return ElmerRuntime(str(candidate_grid), str(candidate_solver), str(candidate))
    return None


def _candidate_elmer_homes() -> list[Path]:
    candidates: list[Path] = []
    if os.environ.get("INFLUX_ELMER_HOME"):
        candidates.append(Path(os.environ["INFLUX_ELMER_HOME"]))
    if os.environ.get("ELMER_HOME"):
        candidates.append(Path(os.environ["ELMER_HOME"]))
    local_appdata = os.environ.get("LOCALAPPDATA")
    if local_appdata:
        candidates.extend(Path(local_appdata).glob("InFlux/Elmer/ElmerFEM*"))
    candidates.extend(Path("C:/Program Files").glob("Elmer*"))
    return candidates


def elmer_available() -> bool:
    return find_elmer_runtime() is not None


def run_elmer_transient(bodies: list[Body], config: SimulationConfig, output_root: str | Path = "outputs/elmer_runs") -> SimulationResult:
    runtime = find_elmer_runtime()
    if runtime is None:
        raise ElmerUnavailable(
            "ElmerSolver was not found. Install Elmer FEM or add its bin folder to PATH to run accurate FEM."
        )

    workspace = Path(output_root) / datetime.now().strftime("elmer_run_%Y%m%d_%H%M%S")
    workspace.mkdir(parents=True, exist_ok=True)

    try:
        mesh = build_gmsh_mesh(bodies, config, workspace)
    except MeshPipelineError as exc:
        if "Gmsh Python module is not installed" in str(exc):
            raise ElmerUnavailable(str(exc)) from exc
        diagnostics_note = ""
        try:
            diagnostics_dir = workspace / "mesh_diagnostics"
            write_mesh_diagnostics(bodies, config, diagnostics_dir)
            diagnostics_note = f" Mesh diagnostics written to {diagnostics_dir}."
        except Exception as diag_exc:
            diagnostics_note = f" Mesh diagnostics could not be completed: {diag_exc}."
        if not config.allow_simplified_geometry_fallback:
            raise ElmerRuntimeError(
                "Exact CAD tetra meshing failed and simplified geometry fallback is disabled. "
                f"Enable 'Allow simplified bbox fallback' only for non-validation preview runs. Exact mesh error: {exc}."
                f"{diagnostics_note}"
            ) from exc
        exact_error = str(exc)
        simplified = []
        for body in bodies:
            clone = copy.copy(body)
            clone.source = "demo"
            clone.tessellation_status = f"simplified bounding-box FEM fallback; exact STEP mesh failed: {exact_error}"
            simplified.append(clone)
        try:
            mesh = build_gmsh_mesh(simplified, config, workspace)
            mesh.warnings.insert(0, f"Exact STEP volume mesh failed; Elmer FEM used positioned bounding-box simplification. Original error: {exact_error}")
            bodies = simplified
        except MeshPipelineError as fallback_exc:
            raise ElmerRuntimeError(f"Exact STEP mesh failed: {exact_error}; bounding-box fallback also failed: {fallback_exc}") from fallback_exc

    elmer_mesh_dir = _convert_mesh(runtime, mesh)
    return _run_cycle_series(runtime, workspace, elmer_mesh_dir.name, bodies, config, mesh)


def fallback_preview_result(bodies: list[Body], config: SimulationConfig, reason: str) -> SimulationResult:
    fallback_config = _replace_solver_mode(config, "FAST_PREVIEW")
    result = run_transient_simulation(bodies, fallback_config)
    result.summary["solver_mode"] = "FAST_PREVIEW_FALLBACK"
    result.summary["requested_solver_mode"] = "ELMER_THERMAL_FEM"
    result.summary["elmer_status"] = "unavailable"
    result.assumptions.insert(0, f"Elmer FEM accurate backend unavailable: {reason}")
    result.assumptions.insert(1, "Returned FAST_PREVIEW fallback result; do not treat these temperatures as FEM output.")
    return result


def _convert_mesh(runtime: ElmerRuntime, mesh: MeshPipelineResult) -> Path:
    out_dir = mesh.workspace / "elmer_mesh"
    _write_elmer_mesh_direct(mesh.gmsh_mesh_path, out_dir)
    (mesh.workspace / "elmergrid.log").write_text(
        "ElmerGrid conversion bypassed. InFlux wrote Elmer native mesh.* files directly from the Gmsh mesh.\n",
        encoding="utf-8",
    )
    return out_dir


def _write_elmer_mesh_direct(gmsh_mesh_path: Path, out_dir: Path) -> None:
    try:
        import meshio  # type: ignore[import-not-found]
    except Exception as exc:  # pragma: no cover - optional runtime
        raise ElmerUnavailable("meshio is not installed; direct Elmer mesh writing is unavailable.") from exc

    mesh = meshio.read(gmsh_mesh_path)
    out_dir.mkdir(parents=True, exist_ok=True)
    points = np.asarray(mesh.points, dtype=float)
    tetra_rows: list[tuple[int, list[int]]] = []
    triangle_rows: list[tuple[int, list[int]]] = []
    for block_index, block in enumerate(mesh.cells):
        physical = _cell_physical_tags(mesh, block_index, len(block.data))
        if block.type == "tetra":
            for nodes, tag in zip(block.data, physical, strict=False):
                tetra_rows.append((int(tag) if int(tag) > 0 else 1, [int(node) + 1 for node in nodes]))
        elif block.type == "triangle":
            for nodes, tag in zip(block.data, physical, strict=False):
                tag = int(tag)
                if tag > 0:
                    triangle_rows.append((tag, [int(node) + 1 for node in nodes]))

    if not tetra_rows:
        raise ElmerRuntimeError(f"No tetrahedral volume cells were found in {gmsh_mesh_path}.")

    with (out_dir / "mesh.nodes").open("w", encoding="utf-8") as handle:
        for index, point in enumerate(points, start=1):
            handle.write(f"{index} -1 {point[0]:.16g} {point[1]:.16g} {point[2]:.16g}\n")

    with (out_dir / "mesh.elements").open("w", encoding="utf-8") as handle:
        for index, (body_id, nodes) in enumerate(tetra_rows, start=1):
            handle.write(f"{index} {body_id} 504 {' '.join(str(node) for node in nodes)}\n")

    with (out_dir / "mesh.boundary").open("w", encoding="utf-8") as handle:
        for index, (boundary_id, nodes) in enumerate(triangle_rows, start=1):
            handle.write(f"{index} {boundary_id} 0 0 303 {' '.join(str(node) for node in nodes)}\n")

    type_counts = [(303, len(triangle_rows)), (504, len(tetra_rows))]
    with (out_dir / "mesh.header").open("w", encoding="utf-8") as handle:
        handle.write(f"{len(points)} {len(tetra_rows)} {len(triangle_rows)}\n")
        handle.write(f"{len(type_counts)}\n")
        for element_type, count in type_counts:
            handle.write(f"{element_type} {count}\n")


def _cell_physical_tags(mesh, block_index: int, length: int) -> np.ndarray:
    values_by_block = mesh.cell_data.get("gmsh:physical")
    if not values_by_block or block_index >= len(values_by_block):
        return np.zeros(length, dtype=int)
    return np.asarray(values_by_block[block_index], dtype=int)


def _run_cycle_series(
    runtime: ElmerRuntime,
    workspace: Path,
    mesh_dir_name: str,
    bodies: list[Body],
    config: SimulationConfig,
    mesh: MeshPipelineResult,
) -> SimulationResult:
    active = [body for body in bodies if body.role != "ignored" and body.id in mesh.body_domain_ids]
    if not any(body.role == "plastic" for body in active):
        raise ElmerRuntimeError("Elmer FEM requires at least one body classified as injected plastic.")
    if not any(body.role == "mold" for body in active):
        raise ElmerRuntimeError("Elmer FEM requires at least one body classified as mold.")

    dt = max(0.001, float(config.timestep_s))
    steps_per_cycle = max(1, int(round(config.cycle_time_s / dt)))
    cycles = max(1, int(config.cycles))
    histories = {
        body.id: [float(config.water_temperature_c if body.role == "water" else body.initial_temperature_c)]
        for body in active
    }
    times = [0.0]
    initial_plastic = {body.id: float(body.initial_temperature_c) for body in active if body.role == "plastic"}
    cycle_initials = {body.id: values[0] for body, values in zip(active, histories.values(), strict=False)}
    sifs: list[str] = []
    logs: list[str] = []

    for cycle in range(1, cycles + 1):
        output_name = f"temperature_cycle_{cycle:03d}"
        sif_path = _write_sif(
            workspace,
            mesh_dir_name,
            active,
            config,
            mesh,
            steps_per_cycle,
            output_name,
            cycle_initials,
        )
        log_path = workspace / f"elmer_solver_cycle_{cycle:03d}.log"
        _run_solver(runtime, sif_path, workspace, log_path, config.solver_timeout_s, config.elmer_processes)
        sifs.append(str(sif_path))
        logs.append(str(log_path))
        cycle_samples = _read_temperature_series(workspace, output_name, active, mesh.coordinate_scale_to_m)
        if not cycle_samples:
            raise ElmerRuntimeError(f"Elmer completed but no VTU temperature output was found for {output_name}.")
        for sample_index, sample in enumerate(cycle_samples, start=1):
            absolute_time = (cycle - 1) * config.cycle_time_s + min(sample_index, steps_per_cycle) * dt
            times.append(float(absolute_time))
            for body in active:
                histories[body.id].append(float(sample.get(body.id, histories[body.id][-1])))
        final_sample = cycle_samples[-1]
        cycle_initials = {}
        for body in active:
            if body.role == "plastic":
                cycle_initials[body.id] = initial_plastic[body.id]
            elif body.role == "water":
                cycle_initials[body.id] = float(config.water_temperature_c)
            else:
                cycle_initials[body.id] = float(final_sample.get(body.id, histories[body.id][-1]))

    return _result_from_histories(active, config, mesh, workspace, histories, times, sifs, logs)


def _write_sif(
    workspace: Path,
    mesh_dir_name: str,
    active: list[Body],
    config: SimulationConfig,
    mesh: MeshPipelineResult,
    total_steps: int,
    output_name: str,
    initial_temperatures: dict[str, float],
) -> Path:
    materials = "\n\n".join(_material_block(index, body) for index, body in enumerate(active, start=1))
    initial_conditions = "\n\n".join(
        _initial_condition_block(index, body, config, initial_temperatures) for index, body in enumerate(active, start=1)
    )
    body_blocks = "\n\n".join(_body_block(index, body, config, mesh) for index, body in enumerate(active, start=1))
    boundary_conditions = "\n\n".join(_cooling_boundary_block(index, boundary_id, config) for index, boundary_id in enumerate(mesh.cooling_boundary_ids.values(), start=1))

    sif = f"""Header
  CHECK KEYWORDS Warn
  Mesh DB "." "{mesh_dir_name}"
End

Simulation
  Max Output Level = 5
  Coordinate System = Cartesian
  Coordinate Mapping(3) = 1 2 3
  Simulation Type = Transient
  Steady State Max Iterations = 1
  Timestepping Method = BDF
  BDF Order = 1
  Timestep Intervals = {total_steps}
  Timestep Sizes = {float(config.timestep_s):.9g}
  Output Intervals = 1
End

Equation 1
  Name = "Transient heat equation"
  Active Solvers(2) = 1 2
End

Solver 1
  Equation = "Heat Equation"
  Procedure = "HeatSolve" "HeatSolver"
  Variable = "Temperature"
  Variable DOFs = 1
  Linear System Solver = Iterative
  Linear System Iterative Method = BiCGStab
  Linear System Max Iterations = 500
  Linear System Convergence Tolerance = 1.0e-8
  Linear System Preconditioning = ILU0
  Steady State Convergence Tolerance = 1.0e-6
End

Solver 2
  Exec Solver = After Timestep
  Equation = "Result Output"
  Procedure = "ResultOutputSolve" "ResultOutputSolver"
  Output File Name = "{output_name}"
  Vtu Format = Logical True
  Binary Output = Logical False
End

{body_blocks}

{materials}

{initial_conditions}

{boundary_conditions}
"""
    sif_path = workspace / f"{output_name}.sif"
    sif_path.write_text(sif, encoding="utf-8")
    (workspace / "mesh_manifest.json").write_text(
        json.dumps(
            {
                "mesh": mesh.summary(),
                "body_domain_ids": mesh.body_domain_ids,
                "body_domain_names": mesh.body_domain_names,
                "warnings": mesh.warnings,
                "physics_notes": [
                    "Elmer solves transient heat conduction on the generated volume mesh.",
                    "Water-channel flow is not CFD; cooling surfaces use fixed temperature or convection boundary settings.",
                    "Repeated cycles use body-average thermal restart: plastic is reheated, mold carries previous FEM body averages.",
                ],
            },
            indent=2,
        ),
        encoding="utf-8",
    )
    return sif_path


def _body_block(index: int, body: Body, config: SimulationConfig, mesh: MeshPipelineResult) -> str:
    target = mesh.body_domain_ids[body.id]
    return f"""Body {index}
  Name = "{body.name}"
  Target Bodies(1) = {target}
  Equation = 1
  Material = {index}
  Initial Condition = {index}
End"""


def _material_block(index: int, body: Body) -> str:
    material = get_material(body.material)
    conductivity = material.conductivity_w_mk
    density = material.density_kg_m3
    heat_capacity = material.specific_heat_j_kgk
    if body.role == "water":
        density *= 100.0
        heat_capacity *= 100.0
    return f"""Material {index}
  Name = "{material.name}"
  Density = {density:.9g}
  Heat Conductivity = {conductivity:.9g}
  Heat Capacity = {heat_capacity:.9g}
End"""


def _initial_condition_block(index: int, body: Body, config: SimulationConfig, initial_temperatures: dict[str, float]) -> str:
    temperature = initial_temperatures.get(body.id, config.water_temperature_c if body.role == "water" else body.initial_temperature_c)
    return f"""Initial Condition {index}
  Name = "Initial {body.name}"
  Temperature = {temperature:.9g}
End"""


def _cooling_boundary_block(index: int, boundary_id: int, config: SimulationConfig) -> str:
    if config.water_boundary_mode == "fixed_temperature":
        condition = f"  Temperature = {float(config.water_temperature_c):.9g}"
    else:
        condition = (
            f"  Heat Transfer Coefficient = {float(config.convection_w_m2k):.9g}\n"
            f"  External Temperature = {float(config.water_temperature_c):.9g}"
        )
    return f"""Boundary Condition {index}
  Name = "Cooling boundary {boundary_id}"
  Target Boundaries(1) = {boundary_id}
{condition}
End"""


def _run_solver(runtime: ElmerRuntime, sif_path: Path, workspace: Path, log_path: Path, timeout_s: int, processes: int) -> None:
    if processes > 1:
        command = [runtime.elmer_solver, sif_path.name]
    else:
        command = [runtime.elmer_solver, sif_path.name]
    completed = _run_command(command, workspace, timeout_s=max(1, timeout_s))
    log_path.write_text(completed.stdout + "\n" + completed.stderr, encoding="utf-8")
    if completed.returncode != 0:
        raise ElmerRuntimeError(f"ElmerSolver failed with exit code {completed.returncode}. See {log_path}.")


def _run_command(command: list[str], cwd: Path, timeout_s: int) -> subprocess.CompletedProcess[str]:
    startupinfo = None
    creationflags = 0
    if sys.platform.startswith("win"):
        startupinfo = subprocess.STARTUPINFO()
        startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0)
    env = os.environ.copy()
    runtime_home = Path(command[0]).resolve().parent.parent
    if runtime_home.exists():
        env["ELMER_HOME"] = str(runtime_home)
        env["ELMER_LIB"] = str(runtime_home / "share" / "elmersolver" / "lib")
        env["PATH"] = f"{runtime_home / 'bin'};{runtime_home / 'lib'};{env.get('PATH', '')}"
    return subprocess.run(
        command,
        cwd=cwd,
        text=True,
        capture_output=True,
        timeout=timeout_s,
        startupinfo=startupinfo,
        creationflags=creationflags,
        env=env,
        shell=False,
    )


def _read_temperature_series(workspace: Path, output_name: str, bodies: list[Body], coordinate_scale: float) -> list[dict[str, float]]:
    try:
        import meshio  # type: ignore[import-not-found]
    except Exception as exc:  # pragma: no cover - optional runtime
        raise ElmerUnavailable("meshio is not installed; Elmer VTU result parsing is unavailable.") from exc

    files = sorted(workspace.rglob(f"{output_name}*.vtu"))
    samples: list[dict[str, float]] = []
    for path in files:
        mesh = meshio.read(path)
        temperature = _temperature_array(mesh)
        if temperature is None:
            continue
        points = np.asarray(mesh.points, dtype=float)
        sample: dict[str, float] = {}
        for body in bodies:
            mask = _points_inside_body(points, body, coordinate_scale)
            if np.any(mask):
                sample[body.id] = float(np.mean(temperature[mask]))
            else:
                sample[body.id] = float(_nearest_body_temperature(points, temperature, body, coordinate_scale))
        samples.append(sample)
    return samples


def _temperature_array(mesh) -> np.ndarray | None:
    for key, values in mesh.point_data.items():
        if "temp" in key.lower():
            array = np.asarray(values, dtype=float)
            if array.ndim > 1:
                array = array[:, 0]
            return array
    return None


def _points_inside_body(points: np.ndarray, body: Body, coordinate_scale: float) -> np.ndarray:
    x0, y0, z0, x1, y1, z1 = [value * coordinate_scale for value in body.bbox_mm]
    tol = max(1e-6, max(x1 - x0, y1 - y0, z1 - z0) * 0.03)
    return (
        (points[:, 0] >= x0 - tol)
        & (points[:, 0] <= x1 + tol)
        & (points[:, 1] >= y0 - tol)
        & (points[:, 1] <= y1 + tol)
        & (points[:, 2] >= z0 - tol)
        & (points[:, 2] <= z1 + tol)
    )


def _nearest_body_temperature(points: np.ndarray, temperature: np.ndarray, body: Body, coordinate_scale: float) -> float:
    center = np.asarray(body.center_mm, dtype=float) * coordinate_scale
    distances = np.linalg.norm(points - center, axis=1)
    return float(temperature[int(np.argmin(distances))])


def _result_from_histories(
    active: list[Body],
    config: SimulationConfig,
    mesh: MeshPipelineResult,
    workspace: Path,
    histories: dict[str, list[float]],
    times: list[float],
    sifs: list[str],
    logs: list[str],
) -> SimulationResult:
    plastic_ids = [body.id for body in active if body.role == "plastic"]
    mold_ids = [body.id for body in active if body.role == "mold"]
    final_plastic = [histories[body_id][-1] for body_id in plastic_ids]
    final_mold = [histories[body_id][-1] for body_id in mold_ids]
    ejection_time: float | str = "not reached"
    for index, time_s in enumerate(times):
        if max(histories[body_id][index] for body_id in plastic_ids) <= config.target_ejection_temperature_c:
            ejection_time = float(time_s)
            break
    summary: dict[str, float | str] = {
        "solver_mode": "ELMER_THERMAL_FEM",
        "numeric_result_source": "ELMER_VTU_POINT_TEMPERATURES",
        "elmer_status": "completed",
        "validation_status": _validation_status(mesh),
        "final_max_plastic_c": float(max(final_plastic)),
        "final_avg_mold_c": float(np.mean(final_mold)) if final_mold else float("nan"),
        "peak_mold_c": float(max(max(histories[body_id]) for body_id in mold_ids)) if mold_ids else float("nan"),
        "ejection_time_s": ejection_time,
        "steps": float(max(0, len(times) - 1)),
        "dt_s": float(config.timestep_s),
    }
    return SimulationResult(
        config=config,
        times_s=times,
        body_temperatures_c=histories,
        body_roles={body.id: body.role for body in active},
        summary=summary,
        mesh_summary=mesh.summary(),
        solver_files={
            "workspace": str(workspace),
            "gmsh_mesh": str(mesh.gmsh_mesh_path),
            "sif_files": json.dumps(sifs),
            "elmer_logs": json.dumps(logs),
            "mesh_manifest": str(workspace / "mesh_manifest.json"),
        },
        assumptions=[
            "Elmer FEM transient heat-transfer backend produced the displayed temperature histories from VTU point temperatures.",
            "No CFD is performed; water bodies define cooling boundaries with fixed temperature or convection.",
            "Repeated cycles use body-average thermal restart rather than full-field Elmer restart files.",
            "Plastic/mold and mold/mold contact conductance settings are recorded; conformal mesh conduction is used for shared interfaces in this version.",
            f"Validation status: {_validation_status(mesh)}",
        ],
    )


def _validation_status(mesh: MeshPipelineResult) -> str:
    warnings = " ".join(mesh.warnings).lower()
    if "bounding-box simplification" in warnings or "generated box volumes" in warnings:
        return "NOT_VALIDATION_GRADE_SIMPLIFIED_GEOMETRY"
    return "EXACT_GEOMETRY_MESHED_REQUIRES_CONVERGENCE_VALIDATION"


def _replace_solver_mode(config: SimulationConfig, solver_mode: str) -> SimulationConfig:
    return SimulationConfig(
        solver_mode=solver_mode,
        timestep_s=config.timestep_s,
        cycle_time_s=config.cycle_time_s,
        cycles=config.cycles,
        water_temperature_c=config.water_temperature_c,
        convection_w_m2k=config.convection_w_m2k,
        target_ejection_temperature_c=config.target_ejection_temperature_c,
        mold_contact_multiplier=config.mold_contact_multiplier,
        mesh_size_mm=config.mesh_size_mm,
        max_mesh_elements=config.max_mesh_elements,
        plastic_mold_contact_conductance_w_m2k=config.plastic_mold_contact_conductance_w_m2k,
        mold_mold_contact_conductance_w_m2k=config.mold_mold_contact_conductance_w_m2k,
        water_boundary_mode=config.water_boundary_mode,
        elmer_processes=config.elmer_processes,
        solver_timeout_s=config.solver_timeout_s,
        keep_solver_files=config.keep_solver_files,
        allow_simplified_geometry_fallback=config.allow_simplified_geometry_fallback,
        mesh_strategy=config.mesh_strategy,
    )
