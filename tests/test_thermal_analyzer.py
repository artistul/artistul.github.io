from pathlib import Path
import subprocess
import sys

import app.simulation.resources as resources_module
from app.geometry.step_importer import import_step, load_demo_geometry
from app.geometry.step_inspector import inspect_step
from app.optimization.sweep import SweepConfig, run_sweep
from app.reporting.exporter import create_session_dir, export_simulation, export_sweep
from app.simulation.backends import BackendMode, resolve_backend
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


def test_gpu_detection_is_cached_for_gui_monitor(monkeypatch):
    calls = []

    def fake_powershell(command: str, timeout: float = 3.0) -> str:
        calls.append(command)
        if "AdapterRAM" in command:
            return str(16 * 1024**3)
        return "AMD Radeon RX 9070 XT\n"

    resources_module._detect_gpu_summary.cache_clear()
    resources_module._detect_adapter_ram_gb.cache_clear()
    monkeypatch.setattr(resources_module, "_run_hidden_powershell", fake_powershell)

    limits = ResourceLimits(56.0, 60.0, 8.0, 4.0, 14.0, "outputs")
    resources_module.sample_resource_snapshot(limits)
    resources_module.sample_resource_snapshot(limits)
    resources_module.sample_resource_snapshot(limits)

    assert len(calls) == 2


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
