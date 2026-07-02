from __future__ import annotations

import csv
import json
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from app.geometry.bodies import Body
from app.simulation.backends import BackendMode
from app.simulation.mesh_pipeline import MeshPipelineResult, build_gmsh_mesh
from app.simulation.solver import SimulationConfig


@dataclass(slots=True)
class MeshValidationRow:
    mesh_size_mm: float
    readiness_status: str
    node_count: int
    element_count: int
    boundary_count: int
    domain_count: int
    cooling_boundary_count: int
    occupied_cells: int
    max_geometry_deviation_mm: float
    zero_volume_tets: int
    near_zero_volume_tets: int
    edge_ratio_gt_100: int
    max_edge_ratio: float
    interface_count: int
    body_volumes_m3_json: str
    interface_areas_m2_json: str
    workspace: str

    def as_dict(self) -> dict[str, float | int | str]:
        return {
            "mesh_size_mm": self.mesh_size_mm,
            "readiness_status": self.readiness_status,
            "node_count": self.node_count,
            "element_count": self.element_count,
            "boundary_count": self.boundary_count,
            "domain_count": self.domain_count,
            "cooling_boundary_count": self.cooling_boundary_count,
            "occupied_cells": self.occupied_cells,
            "max_geometry_deviation_mm": self.max_geometry_deviation_mm,
            "zero_volume_tets": self.zero_volume_tets,
            "near_zero_volume_tets": self.near_zero_volume_tets,
            "edge_ratio_gt_100": self.edge_ratio_gt_100,
            "max_edge_ratio": self.max_edge_ratio,
            "interface_count": self.interface_count,
            "body_volumes_m3_json": self.body_volumes_m3_json,
            "interface_areas_m2_json": self.interface_areas_m2_json,
            "workspace": self.workspace,
        }


def run_mesh_validation_study(
    bodies: list[Body],
    mesh_sizes_mm: list[float],
    output_dir: str | Path = "outputs/mesh_validation",
    max_mesh_elements: int = 750_000,
) -> dict[str, object]:
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    rows: list[MeshValidationRow] = []
    results: list[MeshPipelineResult] = []

    for mesh_size in sorted(mesh_sizes_mm, reverse=True):
        workspace = output / f"conforming_grid_{_safe_float(mesh_size)}mm"
        manifest = workspace / "mesh_readiness.json"
        if manifest.exists() and (workspace / "thermal_model.msh").exists():
            rows.append(_row_from_manifest(float(mesh_size), manifest, workspace))
            continue
        config = SimulationConfig(
            solver_mode=BackendMode.ELMER_THERMAL_FEM.value,
            mesh_size_mm=float(mesh_size),
            max_mesh_elements=max_mesh_elements,
            mesh_strategy="CONTROLLED_APPROX_CONFORMING_GRID",
        )
        result = build_gmsh_mesh(bodies, config, workspace)
        results.append(result)
        rows.append(_row_from_result(float(mesh_size), result, workspace))

    decision = _validation_decision(rows, results)
    _write_validation_outputs(output, rows, decision)
    return {"rows": [row.as_dict() for row in rows], "decision": decision, "output_dir": str(output)}


def _row_from_result(mesh_size: float, result: MeshPipelineResult, workspace: Path) -> MeshValidationRow:
    quality = result.quality_summary
    body_volumes = _body_volumes_from_result(result, mesh_size)
    interface_areas = _interface_areas_from_result(result)
    return MeshValidationRow(
        mesh_size_mm=mesh_size,
        readiness_status=result.readiness_status,
        node_count=result.node_count,
        element_count=result.element_count,
        boundary_count=result.boundary_count,
        domain_count=len(result.body_domain_ids),
        cooling_boundary_count=len(result.cooling_boundary_ids),
        occupied_cells=int(quality.get("occupied_cells", 0)),
        max_geometry_deviation_mm=float(quality.get("max_geometry_deviation_mm", 0.0)),
        zero_volume_tets=int(quality.get("zero_volume_tets", 0)),
        near_zero_volume_tets=int(quality.get("near_zero_volume_tets", 0)),
        edge_ratio_gt_100=int(quality.get("edge_ratio_gt_100", 0)),
        max_edge_ratio=float(quality.get("max_edge_ratio", 0.0)),
        interface_count=len(result.interface_summary),
        body_volumes_m3_json=json.dumps(body_volumes, sort_keys=True),
        interface_areas_m2_json=json.dumps(interface_areas, sort_keys=True),
        workspace=str(workspace),
    )


def _row_from_manifest(mesh_size: float, manifest_path: Path, workspace: Path) -> MeshValidationRow:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    quality = manifest.get("quality_summary", {})
    return MeshValidationRow(
        mesh_size_mm=mesh_size,
        readiness_status=str(manifest.get("readiness_status", "UNASSESSED")),
        node_count=int(manifest.get("node_count", 0)),
        element_count=int(manifest.get("element_count", 0)),
        boundary_count=int(manifest.get("boundary_count", 0)),
        domain_count=len(manifest.get("body_domain_ids", {})),
        cooling_boundary_count=len(manifest.get("cooling_boundary_ids", {})),
        occupied_cells=int(quality.get("occupied_cells", 0)),
        max_geometry_deviation_mm=float(quality.get("max_geometry_deviation_mm", 0.0)),
        zero_volume_tets=int(quality.get("zero_volume_tets", 0)),
        near_zero_volume_tets=int(quality.get("near_zero_volume_tets", 0)),
        edge_ratio_gt_100=int(quality.get("edge_ratio_gt_100", 0)),
        max_edge_ratio=float(quality.get("max_edge_ratio", 0.0)),
        interface_count=len(manifest.get("interface_summary", [])),
        body_volumes_m3_json=json.dumps(manifest.get("body_volumes_m3", {}), sort_keys=True),
        interface_areas_m2_json=json.dumps(_interface_areas_from_manifest(manifest), sort_keys=True),
        workspace=str(workspace),
    )


def _validation_decision(rows: list[MeshValidationRow], results: list[MeshPipelineResult]) -> dict[str, object]:
    required_domains = 5
    required_cooling = 2
    failures: list[str] = []
    for row in rows:
        if row.domain_count < required_domains:
            failures.append(f"{row.mesh_size_mm:g} mm mesh has only {row.domain_count}/{required_domains} domains.")
        if row.cooling_boundary_count < required_cooling:
            failures.append(f"{row.mesh_size_mm:g} mm mesh has only {row.cooling_boundary_count}/{required_cooling} cooling boundary groups.")
        if row.zero_volume_tets:
            failures.append(f"{row.mesh_size_mm:g} mm mesh has {row.zero_volume_tets} zero-volume tetrahedra.")
        if not row.readiness_status.startswith("FEM_READY_CONFORMING_APPROX"):
            failures.append(f"{row.mesh_size_mm:g} mm mesh readiness is {row.readiness_status}.")

    trends = _convergence_trends(rows)
    if len(rows) < 2:
        failures.append("At least two mesh sizes are required for a convergence trend.")
    if trends.get("max_body_volume_change_pct") is None:
        failures.append("Could not compute body-volume convergence trend.")
    if trends.get("max_interface_area_change_pct") is None:
        failures.append("Could not compute interface-area convergence trend.")

    status = "VALIDATION_GRADE_MESH_READY_PENDING_SOLVER_PHYSICS_VALIDATION"
    if failures:
        status = "NOT_VALIDATION_GRADE_MESH_STUDY_FAILED"
    else:
        finest_deviation = min(row.max_geometry_deviation_mm for row in rows)
        if finest_deviation > 1.0:
            status = "FEM_READY_CONFORMING_APPROX_REQUIRES_FINER_DEVIATION_STUDY"
        elif float(trends.get("max_body_volume_change_pct") or 0.0) > 8.0:
            status = "FEM_READY_CONFORMING_APPROX_REQUIRES_VOLUME_CONVERGENCE"
        elif float(trends.get("max_interface_area_change_pct") or 0.0) > 15.0:
            status = "FEM_READY_CONFORMING_APPROX_REQUIRES_INTERFACE_CONVERGENCE"

    return {
        "status": status,
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "failures": failures,
        "trends": trends,
        "mesh_count": len(rows),
        "finest_mesh_size_mm": min((row.mesh_size_mm for row in rows), default=0.0),
    }


def _convergence_trends(rows: list[MeshValidationRow]) -> dict[str, float | None]:
    ordered = sorted(rows, key=lambda row: row.mesh_size_mm, reverse=True)
    if len(ordered) < 2:
        return {
            "max_body_volume_change_pct": None,
            "max_interface_area_change_pct": None,
            "element_count_ratio": None,
        }
    coarse = ordered[-2]
    fine = ordered[-1]
    body_change = _max_mapping_change_pct(coarse.body_volumes_m3_json, fine.body_volumes_m3_json)
    interface_change = _max_mapping_change_pct(coarse.interface_areas_m2_json, fine.interface_areas_m2_json)
    element_ratio = float(fine.element_count / max(1, coarse.element_count))
    return {
        "max_body_volume_change_pct": body_change,
        "max_interface_area_change_pct": interface_change,
        "element_count_ratio": element_ratio,
    }


def _body_volumes_from_result(result: MeshPipelineResult, mesh_size_mm: float) -> dict[str, float]:
    occupied = int(result.quality_summary.get("occupied_cells", 0))
    if not result.body_domain_names or occupied <= 0:
        return {}
    # The conforming grid stores only total occupied cells in the summary. Per-body
    # volumes are reconstructed from interface-ready mesh manifests when present.
    manifest_path = result.workspace / "mesh_readiness.json"
    if manifest_path.exists():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        volumes = manifest.get("body_volumes_m3")
        if isinstance(volumes, dict):
            return {str(key): float(value) for key, value in volumes.items()}
    return {}


def _interface_areas_from_result(result: MeshPipelineResult) -> dict[str, float]:
    values: dict[str, float] = {}
    for item in result.interface_summary:
        key = f"{item.get('body_a')}::{item.get('body_b')}::{item.get('relationship')}"
        values[key] = float(item.get("approx_interface_area_m2", 0.0))
    return values


def _interface_areas_from_manifest(manifest: dict[str, object]) -> dict[str, float]:
    values: dict[str, float] = {}
    for item in manifest.get("interface_summary", []):
        if not isinstance(item, dict):
            continue
        key = f"{item.get('body_a')}::{item.get('body_b')}::{item.get('relationship')}"
        values[key] = float(item.get("approx_interface_area_m2", 0.0))
    return values


def _max_mapping_change_pct(old_json: str, new_json: str) -> float | None:
    old = json.loads(old_json or "{}")
    new = json.loads(new_json or "{}")
    keys = set(old) & set(new)
    if not keys:
        return None
    changes = []
    for key in keys:
        old_value = float(old[key])
        new_value = float(new[key])
        if old_value == 0.0:
            continue
        changes.append(abs((new_value - old_value) / old_value * 100.0))
    return max(changes) if changes else None


def _write_validation_outputs(output: Path, rows: list[MeshValidationRow], decision: dict[str, object]) -> None:
    csv_path = output / "mesh_validation_study.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=list(MeshValidationRow(0, "", 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, "", "", "").as_dict().keys()))
        writer.writeheader()
        for row in rows:
            writer.writerow(row.as_dict())
    (output / "mesh_validation_study.json").write_text(
        json.dumps({"decision": decision, "rows": [row.as_dict() for row in rows]}, indent=2),
        encoding="utf-8",
    )
    rows_html = "\n".join(
        "<tr>"
        + "".join(f"<td>{value}</td>" for value in row.as_dict().values())
        + "</tr>"
        for row in rows
    )
    failure_html = "<br>".join(str(item) for item in decision.get("failures", [])) or "None"
    html = f"""<!doctype html>
<html><head><meta charset="utf-8"><title>InFlux Mesh Validation Study</title>
<style>body{{font-family:Segoe UI,Arial,sans-serif;margin:24px}}td,th{{border:1px solid #ccc;padding:4px 8px}}table{{border-collapse:collapse}}</style>
</head><body>
<h1>InFlux Mesh Validation Study</h1>
<p>Status: <strong>{decision.get("status")}</strong></p>
<p>Failures: {failure_html}</p>
<pre>{json.dumps(decision.get("trends", {}), indent=2)}</pre>
<table><thead><tr>{''.join(f'<th>{key}</th>' for key in MeshValidationRow(0, '', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, '', '', '').as_dict().keys())}</tr></thead>
<tbody>{rows_html}</tbody></table>
</body></html>"""
    (output / "mesh_validation_report.html").write_text(html, encoding="utf-8")


def _safe_float(value: float) -> str:
    return f"{value:g}".replace(".", "p")
