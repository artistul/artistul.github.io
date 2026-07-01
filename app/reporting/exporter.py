from __future__ import annotations

import csv
import html
import json
from datetime import datetime
from pathlib import Path
from typing import Iterable

import matplotlib

matplotlib.use("Agg")
from matplotlib import pyplot as plt

from app.geometry.bodies import Body
from app.simulation.solver import SimulationResult


def create_session_dir(base: str | Path = "outputs") -> Path:
    path = Path(base) / datetime.now().strftime("thermal_run_%Y%m%d_%H%M%S")
    path.mkdir(parents=True, exist_ok=True)
    return path


def export_simulation(session_dir: Path, bodies: list[Body], result: SimulationResult) -> dict[str, Path]:
    session_dir.mkdir(parents=True, exist_ok=True)
    csv_path = session_dir / "single_simulation_temperatures.csv"
    chart_path = session_dir / "single_simulation_chart.png"
    log_path = session_dir / "simulation_log.txt"
    html_path = session_dir / "simulation_report.html"

    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        fieldnames = ["time_s", *result.body_temperatures_c.keys()]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for idx, time_s in enumerate(result.times_s):
            row = {"time_s": time_s}
            for body_id, temps in result.body_temperatures_c.items():
                row[body_id] = temps[idx]
            writer.writerow(row)

    _plot_temperature_history(chart_path, result)
    log_text = {
        "summary": result.summary,
        "mesh_summary": result.mesh_summary,
        "solver_files": result.solver_files,
        "assumptions": result.assumptions,
        "bodies": [body.as_dict() for body in bodies],
    }
    log_path.write_text(json.dumps(log_text, indent=2), encoding="utf-8")
    html_path.write_text(_html_report(bodies, result, chart_path.name), encoding="utf-8")
    return {"csv": csv_path, "chart": chart_path, "log": log_path, "html": html_path}


def export_sweep(session_dir: Path, rows: Iterable[dict[str, float | str]]) -> Path:
    path = session_dir / "optimization_sweep_results.csv"
    rows = list(rows)
    if not rows:
        path.write_text("", encoding="utf-8")
        return path
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    return path


def _plot_temperature_history(path: Path, result: SimulationResult) -> None:
    fig, ax = plt.subplots(figsize=(8, 4.5), dpi=130)
    for body_id, temps in result.body_temperatures_c.items():
        role = result.body_roles.get(body_id, "?")
        ax.plot(result.times_s, temps, label=f"{body_id} ({role})", linewidth=1.8)
    ax.set_xlabel("Time (s)")
    ax.set_ylabel("Temperature (deg C)")
    ax.grid(True, alpha=0.3)
    ax.legend(fontsize=7)
    fig.tight_layout()
    fig.savefig(path)
    plt.close(fig)


def _html_report(bodies: list[Body], result: SimulationResult, chart_name: str) -> str:
    body_rows = "\n".join(
        f"<tr><td>{html.escape(body.name)}</td><td>{body.role}</td><td>{html.escape(body.material)}</td>"
        f"<td>{body.initial_temperature_c:.1f}</td></tr>"
        for body in bodies
    )
    summary_rows = "\n".join(
        f"<tr><td>{html.escape(str(key))}</td><td>{html.escape(str(value))}</td></tr>"
        for key, value in result.summary.items()
    )
    assumptions = "\n".join(f"<li>{html.escape(item)}</li>" for item in result.assumptions)
    mesh_rows = "\n".join(
        f"<tr><td>{html.escape(str(key))}</td><td>{html.escape(str(value))}</td></tr>"
        for key, value in result.mesh_summary.items()
    )
    file_rows = "\n".join(
        f"<tr><td>{html.escape(str(key))}</td><td>{html.escape(str(value))}</td></tr>"
        for key, value in result.solver_files.items()
    )
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>InFlux Thermal Mold Analyzer Report</title>
  <style>
    body {{ font-family: Segoe UI, Arial, sans-serif; margin: 32px; color: #1f2937; }}
    h1, h2 {{ color: #111827; }}
    table {{ border-collapse: collapse; width: 100%; margin: 12px 0 24px; }}
    th, td {{ border: 1px solid #d1d5db; padding: 8px; text-align: left; }}
    th {{ background: #f3f4f6; }}
    img {{ max-width: 960px; width: 100%; border: 1px solid #d1d5db; }}
  </style>
</head>
<body>
  <h1>InFlux Thermal Mold Analyzer Report</h1>
  <h2>Summary</h2>
  <table><tbody>{summary_rows}</tbody></table>
  <h2>Temperature History</h2>
  <img src="{html.escape(chart_name)}" alt="Temperature chart">
  <h2>Mesh / Solver Diagnostics</h2>
  <table><tbody>{mesh_rows or '<tr><td colspan="2">No mesh diagnostics for this solver mode.</td></tr>'}</tbody></table>
  <h2>Solver Files</h2>
  <table><tbody>{file_rows or '<tr><td colspan="2">No external solver files for this run.</td></tr>'}</tbody></table>
  <h2>Bodies</h2>
  <table><thead><tr><th>Body</th><th>Role</th><th>Material</th><th>Initial deg C</th></tr></thead><tbody>{body_rows}</tbody></table>
  <h2>Model Assumptions</h2>
  <ul>{assumptions}</ul>
</body>
</html>"""
