from pathlib import Path

from app.geometry.step_importer import import_step, load_demo_geometry
from app.optimization.sweep import SweepConfig, run_sweep
from app.reporting.exporter import create_session_dir, export_simulation, export_sweep
from app.simulation.resources import recommended_workers
from app.simulation.solver import SimulationConfig, run_transient_simulation


def test_step_import_preserves_synthetic_bodies():
    bodies = import_step(Path("examples/synthetic_mold_assembly.step"))
    assert len(bodies) == 5
    assert {body.role for body in bodies} >= {"mold", "plastic", "water"}


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


def test_max_mode_uses_more_workers_than_background():
    assert recommended_workers("max", aggressive_max=True) >= recommended_workers("background")
