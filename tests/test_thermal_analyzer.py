from pathlib import Path
import subprocess
import sys

from app.geometry.step_importer import import_step, load_demo_geometry
from app.geometry.step_inspector import inspect_step
from app.optimization.sweep import SweepConfig, run_sweep
from app.reporting.exporter import create_session_dir, export_simulation, export_sweep
from app.simulation.backends import BackendMode, resolve_backend, run_simulation_backend
from app.simulation.mesh_pipeline import MeshPipelineError, build_gmsh_mesh, write_mesh_diagnostics
from app.simulation.profiles import PRESET_HYBRID_STEFAN_RO, enforce_worker_limits, get_resource_profile
from app.simulation.resources import SystemResources, ResourceLimits, evaluate_throttle, sample_gpu_telemetry
from app.simulation.solver import SimulationConfig, run_transient_simulation


def test_step_import_preserves_synthetic_bodies():
    bodies = import_step(Path("examples/synthetic_mold_assembly.step"))
    assert len(bodies) == 5
    assert {body.role for body in bodies} >= {"mold", "plastic", "water"}


def test_inspect_step_writes_diagnostics(tmp_path):
    inspection = inspect_step(Path("examples/synthetic_mold_assembly.step"), tmp_path)
    assert len(inspection.bodies) == 5
    assert (tmp_path / "step_tree.txt").exists()
    assert (tmp_path / "step_bodies.csv").exists()
    assert (tmp_path / "step_import_log.txt").exists()
    assert all(body.hierarchy_path for body in inspection.bodies)


def test_inspect_step_cli(tmp_path):
    result = subprocess.run(
        [sys.executable, "-m", "app.main", "--inspect-step", "examples/synthetic_mold_assembly.step"],
        cwd=Path.cwd(),
        text=True,
        capture_output=True,
        timeout=60,
    )
    assert result.returncode == 0
    assert "STEP inspection OK" in result.stdout
    assert Path("outputs/step_diagnostics/step_bodies.csv").exists()


def test_tessellation_fallback_for_demo_step():
    inspection = inspect_step(Path("examples/synthetic_mold_assembly.step"))
    assert any("placeholder" in body.tessellation_status for body in inspection.bodies)


def test_single_simulation_exports(tmp_path):
    bodies = load_demo_geometry()
    result = run_transient_simulation(bodies, SimulationConfig(timestep_s=1.0, cycle_time_s=10.0, cycles=2))
    assert result.summary["final_max_plastic_c"] < 220.0
    exports = export_simulation(tmp_path, bodies, result)
    assert exports["csv"].exists()
    assert exports["chart"].exists()
    assert exports["log"].exists()
    assert exports["html"].exists()


def test_parallel_sweep_respects_worker_limit(tmp_path):
    bodies = load_demo_geometry()
    rows = run_sweep(
        bodies,
        SimulationConfig(timestep_s=1.0, cycle_time_s=8.0, cycles=2),
        SweepConfig(water_temperatures_c=(20.0, 24.0), convection_w_m2k=(2000.0,), cycle_times_s=(8.0, 12.0), workers=2),
    )
    assert len(rows) == 4
    assert rows[0]["score"] <= rows[-1]["score"]
    assert export_sweep(tmp_path, rows).exists()


def test_hybrid_max_profile_values():
    resources = SystemResources(
        logical_threads=32,
        physical_cores=16,
        total_ram_gb=64.0,
        available_ram_gb=60.0,
        gpu_summary="AMD Radeon RX 9070 XT",
    )
    profile = get_resource_profile(PRESET_HYBRID_STEFAN_RO, resources)
    assert profile.cpu_workers in {24, 25, 26}
    assert profile.logical_threads_reserved == 4
    assert profile.cpu_affinity_workers == 28
    assert profile.ram_cap_gb == 56.0
    assert profile.aggressive_ram_cap_gb == 60.0
    assert profile.min_free_ram_gb == 8.0
    assert profile.emergency_free_ram_gb == 4.0
    assert profile.vram_cap_gb == 14.0
    assert profile.vram_reserved_gb == 2.0
    assert profile.backend_mode == BackendMode.HYBRID_MAX_STEFAN


def test_worker_and_ram_limit_enforcement():
    resources = SystemResources(32, 16, 64.0, 60.0, "AMD Radeon RX 9070 XT")
    profile = get_resource_profile(PRESET_HYBRID_STEFAN_RO, resources)
    assert enforce_worker_limits(profile, 32, 56.0) == 28
    assert enforce_worker_limits(profile, 32, 6.0) == 24


def test_backend_selection_falls_back_without_gpu_solver():
    selection = resolve_backend(BackendMode.HYBRID_MAX_STEFAN, cpu_only=False, gpu_available=False)
    assert selection.effective == BackendMode.CPU_MAX
    assert "CPU fallback" in selection.message


def test_elmer_thermal_fem_config_can_be_created():
    config = SimulationConfig(
        solver_mode=BackendMode.ELMER_THERMAL_FEM.value,
        mesh_size_mm=5.0,
        max_mesh_elements=12345,
        plastic_mold_contact_conductance_w_m2k=2400.0,
        mold_mold_contact_conductance_w_m2k=6000.0,
        water_boundary_mode="convection",
        elmer_processes=2,
        solver_timeout_s=120,
        keep_solver_files=True,
        mesh_strategy="AUTO_EXACT_THEN_REPAIRED_SURFACE",
    )
    assert config.solver_mode == "ELMER_THERMAL_FEM"
    assert config.mesh_size_mm == 5.0
    assert config.max_mesh_elements == 12345
    assert config.elmer_processes == 2
    assert config.mesh_strategy == "AUTO_EXACT_THEN_REPAIRED_SURFACE"


def test_mesh_diagnostics_writes_files_for_demo_bodies(tmp_path):
    diagnostics = write_mesh_diagnostics(
        load_demo_geometry(),
        SimulationConfig(solver_mode=BackendMode.ELMER_THERMAL_FEM.value, mesh_size_mm=20.0),
        tmp_path,
    )
    assert diagnostics
    assert (tmp_path / "mesh_diagnostics.txt").exists()
    assert (tmp_path / "mesh_body_diagnostics.csv").exists()
    assert all("skipped" in diagnostic.status for diagnostic in diagnostics)


def test_elmer_backend_missing_runtime_falls_back_cleanly(monkeypatch):
    from app.simulation import elmer_backend

    monkeypatch.setattr(elmer_backend, "find_elmer_runtime", lambda: None)
    bodies = load_demo_geometry()
    config = SimulationConfig(solver_mode=BackendMode.ELMER_THERMAL_FEM.value, timestep_s=1.0, cycle_time_s=4.0, cycles=1)
    result, selection = run_simulation_backend(bodies, config, BackendMode.ELMER_THERMAL_FEM)
    assert selection.effective == BackendMode.FAST_PREVIEW
    assert result.summary["solver_mode"] == "FAST_PREVIEW_FALLBACK"
    assert "unavailable" in " ".join(result.assumptions).lower()


def test_demo_mesh_pipeline_either_meshes_or_reports_clear_error(tmp_path):
    config = SimulationConfig(solver_mode=BackendMode.ELMER_THERMAL_FEM.value, mesh_size_mm=20.0, max_mesh_elements=100000)
    try:
        mesh = build_gmsh_mesh(load_demo_geometry(), config, tmp_path)
    except MeshPipelineError as exc:
        assert "Gmsh" in str(exc) or "meshing failed" in str(exc) or "mesh" in str(exc).lower()
    else:
        assert mesh.gmsh_mesh_path.exists()
        assert mesh.element_count > 0
        assert mesh.body_domain_ids


def test_mesh_quality_summary_flags_valid_simple_tets(tmp_path):
    from app.simulation.mesh_pipeline import _mesh_readiness_status, _tet_quality_summary, MeshPipelineResult
    import numpy as np

    points = np.array([[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]])
    tetra = np.array([[0, 1, 2, 3]])
    quality = _tet_quality_summary(points, tetra)
    mesh = MeshPipelineResult(
        tmp_path,
        tmp_path / "mesh.msh",
        {"a": 1},
        {1: "mold:a"},
        mesher_strategy="GMSH_OCC_HEALED_PER_BODY",
        quality_summary=quality,
    )
    assert quality["status"] == "ok"
    assert _mesh_readiness_status(mesh).startswith("FEM_READY")


def test_conforming_grid_tetrahedralizer_preserves_domains_and_cooling_faces():
    from app.geometry.bodies import Body
    from app.simulation.mesh_pipeline import _grid_interface_summary, _tetrahedralize_labeled_grid
    import numpy as np

    bodies = [
        Body("mold", "mold", role="mold"),
        Body("water", "water", role="water"),
    ]
    labels = np.asarray([[[1], [2]]], dtype=np.int16)
    points, tetra, tags, triangles, triangle_tags, cooling = _tetrahedralize_labeled_grid(labels, (0.0, 0.0, 0.0), 1.0, bodies)
    interfaces = _grid_interface_summary(labels, bodies, 1.0)
    assert len(points) > 0
    assert len(tetra) == 12
    assert set(tags.tolist()) == {1, 2}
    assert len(triangles) == 2
    assert set(triangle_tags.tolist()) == {1001}
    assert cooling == {"water": 1001}
    assert interfaces[0]["relationship"] == "mold_water_cooling"


def test_mesh_validation_decision_requires_fine_deviation():
    from app.simulation.mesh_validation import MeshValidationRow, _validation_decision

    rows = [
        MeshValidationRow(3.0, "FEM_READY_CONFORMING_APPROX_REQUIRES_DEVIATION_AND_CONVERGENCE_VALIDATION", 1, 10, 2, 5, 2, 10, 2.6, 0, 0, 0, 1.8, 5, "a"),
        MeshValidationRow(2.0, "FEM_READY_CONFORMING_APPROX_REQUIRES_DEVIATION_AND_CONVERGENCE_VALIDATION", 2, 20, 4, 5, 2, 20, 1.73, 0, 0, 0, 1.8, 5, "b"),
    ]
    decision = _validation_decision(rows, [])
    assert decision["status"] == "FEM_READY_CONFORMING_APPROX_REQUIRES_FINER_DEVIATION_STUDY"


def test_throttle_limits():
    limits = ResourceLimits(56.0, 60.0, 8.0, 4.0, 14.0, "outputs")
    assert evaluate_throttle(limits, free_ram_gb=7.5, app_ram_gb=2.0)[0] == "THROTTLE"
    assert evaluate_throttle(limits, free_ram_gb=3.9, app_ram_gb=2.0)[0] == "EMERGENCY_PAUSE"
    assert evaluate_throttle(limits, free_ram_gb=16.0, app_ram_gb=60.0)[0] == "EMERGENCY_PAUSE"


def test_gpu_telemetry_is_honest_placeholder_when_usage_unavailable():
    telemetry = sample_gpu_telemetry()
    if not telemetry.telemetry_available:
        assert telemetry.vram_used_gb is None
        assert "not available" in telemetry.message


def test_gpu_telemetry_monitor_is_console_safe():
    telemetry = sample_gpu_telemetry()
    assert telemetry.telemetry_available is False
    assert telemetry.vram_total_gb is None
    assert telemetry.vram_used_gb is None
    assert "console-safe" in telemetry.message


def test_real_cad_import_path_handled_gracefully_if_present():
    path = Path(r"C:\Users\Stefan\Desktop\design matrita watercooled -sim.step")
    if not path.exists():
        return
    bodies = import_step(path)
    assert len(bodies) >= 1
    assert all(body.name for body in bodies)


def test_real_cad_recursive_traversal_and_tessellation_if_present():
    path = Path(r"C:\Users\Stefan\Desktop\design matrita watercooled -sim.step")
    if not path.exists():
        return
    inspection = inspect_step(path)
    tree = "\n".join(inspection.tree_lines)
    assert "Mold:1" in tree
    assert len(inspection.bodies) == 5
    assert any(body.mesh_vertices and body.mesh_triangles for body in inspection.bodies)
    assert {body.role for body in inspection.bodies} >= {"mold", "plastic", "water"}
    secondary = next(body for body in inspection.bodies if body.name.startswith("Secondary half"))
    assert secondary.bbox_mm[1] > 120.0
    assert secondary.bbox_mm[2] > 20.0
