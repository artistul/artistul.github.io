from __future__ import annotations

import csv
import json
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from app.geometry.bodies import Body
from app.simulation.solver import SimulationConfig


class MeshPipelineError(RuntimeError):
    """Raised when the external meshing pipeline cannot produce a volume mesh."""


@dataclass(slots=True)
class BodyMeshDiagnostic:
    body_id: str
    name: str
    role: str
    hierarchy_path: str
    source_step: str
    exported_step: str
    bbox_mm: tuple[float, float, float, float, float, float]
    volume_mm3: float
    face_count: int
    surface_ok: bool = False
    volume_ok: bool = False
    node_count: int = 0
    element_count: int = 0
    duration_s: float = 0.0
    status: str = "not run"
    warnings: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, object]:
        return {
            "body_id": self.body_id,
            "name": self.name,
            "role": self.role,
            "hierarchy_path": self.hierarchy_path,
            "source_step": self.source_step,
            "exported_step": self.exported_step,
            "bbox_mm": self.bbox_mm,
            "volume_mm3": self.volume_mm3,
            "face_count": self.face_count,
            "surface_ok": self.surface_ok,
            "volume_ok": self.volume_ok,
            "node_count": self.node_count,
            "element_count": self.element_count,
            "duration_s": round(self.duration_s, 3),
            "status": self.status,
            "warnings": " | ".join(self.warnings),
        }


@dataclass(slots=True)
class MeshPipelineResult:
    workspace: Path
    gmsh_mesh_path: Path
    body_domain_ids: dict[str, int]
    body_domain_names: dict[int, str]
    cooling_boundary_ids: dict[str, int] = field(default_factory=dict)
    node_count: int = 0
    element_count: int = 0
    boundary_count: int = 0
    warnings: list[str] = field(default_factory=list)
    used_source_step: str = ""
    coordinate_scale_to_m: float = 0.001
    mesher_strategy: str = "GMSH_OCC_PER_BODY"
    diagnostics_dir: str = ""

    def summary(self) -> dict[str, int | float | str]:
        return {
            "mesh_path": str(self.gmsh_mesh_path),
            "node_count": self.node_count,
            "element_count": self.element_count,
            "boundary_count": self.boundary_count,
            "domain_count": len(self.body_domain_ids),
            "cooling_boundary_count": len(self.cooling_boundary_ids),
            "used_source_step": self.used_source_step or "generated from body bounding boxes",
            "coordinate_scale_to_m": self.coordinate_scale_to_m,
            "mesher_strategy": self.mesher_strategy,
            "diagnostics_dir": self.diagnostics_dir,
            "warnings": " | ".join(self.warnings),
        }


def write_mesh_diagnostics(
    bodies: list[Body],
    config: SimulationConfig,
    output_dir: str | Path = "outputs/mesh_diagnostics",
) -> list[BodyMeshDiagnostic]:
    """Probe exact per-body CAD meshability and write evidence files.

    This does not certify the model. It answers the narrower question the
    engineer needs before FEM: which positioned bodies can be tetra meshed by
    the current CAD-to-Gmsh path, and which exported bodies fail.
    """

    active = [body for body in bodies if body.role != "ignored"]
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    diagnostics: list[BodyMeshDiagnostic] = []
    warnings: list[str] = []
    source_step = _shared_existing_step(active)
    body_steps: list[tuple[Body, Path]] = []
    if source_step:
        body_steps = _export_positioned_body_steps(source_step, active, output / "positioned_body_steps", warnings)
    else:
        warnings.append("No shared real STEP source was available; exact per-body CAD diagnostics cannot run.")

    step_by_id = {body.id: step for body, step in body_steps}
    for body in active:
        diag = BodyMeshDiagnostic(
            body_id=body.id,
            name=body.name,
            role=body.role,
            hierarchy_path=body.hierarchy_path,
            source_step=body.source,
            exported_step=str(step_by_id.get(body.id, "")),
            bbox_mm=body.bbox_mm,
            volume_mm3=body.volume_mm3,
            face_count=body.face_count,
        )
        if body.id not in step_by_id:
            diag.status = "skipped: no positioned STEP export"
            diag.warnings.extend(warnings)
            diagnostics.append(diag)
            continue
        _diagnose_body_step(step_by_id[body.id], config, diag)
        diagnostics.append(diag)

    _write_mesh_diagnostics_files(output, diagnostics, warnings)
    return diagnostics


def _diagnose_body_step(step_path: Path, config: SimulationConfig, diag: BodyMeshDiagnostic) -> None:
    started = time.perf_counter()
    try:
        import gmsh  # type: ignore[import-not-found]
    except Exception as exc:  # pragma: no cover - depends on optional runtime
        diag.status = "failed: gmsh python module unavailable"
        diag.warnings.append(str(exc))
        diag.duration_s = time.perf_counter() - started
        return

    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.option.setNumber("Geometry.OCCFixDegenerated", 1)
        gmsh.option.setNumber("Geometry.OCCFixSmallEdges", 1)
        gmsh.option.setNumber("Geometry.OCCFixSmallFaces", 1)
        gmsh.option.setNumber("Mesh.MshFileVersion", 2.2)
        mesh_size = max(0.001, float(config.mesh_size_mm) * 0.001)
        gmsh.option.setNumber("Mesh.MeshSizeMax", mesh_size)
        gmsh.option.setNumber("Mesh.MeshSizeMin", max(mesh_size * 0.1, mesh_size * 0.25))
        gmsh.model.add(f"diagnostic_{_safe_filename(diag.name)}")
        gmsh.model.occ.importShapes(str(step_path))
        gmsh.model.occ.synchronize()
        volume_tags = [tag for dim, tag in gmsh.model.getEntities(3)]
        if not volume_tags:
            raise MeshPipelineError("Gmsh imported no solid volume from this body STEP.")
        _scale_volumes_to_meters(gmsh, volume_tags, 0.001)
        try:
            gmsh.model.mesh.generate(2)
            diag.surface_ok = True
        except Exception as exc:
            diag.warnings.append(f"surface mesh failed: {exc}")
            raise MeshPipelineError(f"surface mesh failed: {exc}") from exc
        _generate_3d_mesh_with_fallbacks(gmsh, diag.warnings)
        diag.node_count = len(gmsh.model.mesh.getNodes()[0])
        diag.element_count = _element_count(gmsh.model.mesh.getElements(3)[1])
        diag.volume_ok = diag.element_count > 0
        if diag.element_count > config.max_mesh_elements:
            diag.status = f"failed: {diag.element_count} elements above limit {config.max_mesh_elements}"
        elif diag.volume_ok:
            diag.status = "ok: exact per-body tetra mesh generated"
        else:
            diag.status = "failed: empty volume mesh"
    except Exception as exc:
        diag.status = f"failed: {exc}"
        if not diag.warnings or str(exc) not in diag.warnings[-1]:
            diag.warnings.append(str(exc))
    finally:
        diag.duration_s = time.perf_counter() - started
        gmsh.finalize()


def _write_mesh_diagnostics_files(output: Path, diagnostics: list[BodyMeshDiagnostic], warnings: list[str]) -> None:
    fieldnames = list(BodyMeshDiagnostic("", "", "", "", "", "", (0, 0, 0, 0, 0, 0), 0.0, 0).as_dict().keys())
    with (output / "mesh_body_diagnostics.csv").open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for diagnostic in diagnostics:
            writer.writerow(diagnostic.as_dict())
    (output / "mesh_body_diagnostics.json").write_text(
        json.dumps([diagnostic.as_dict() for diagnostic in diagnostics], indent=2),
        encoding="utf-8",
    )
    lines = [
        "InFlux exact CAD mesh diagnostics",
        f"bodies_checked: {len(diagnostics)}",
        f"bodies_exact_tetra_ok: {sum(1 for diagnostic in diagnostics if diagnostic.volume_ok)}",
        "",
    ]
    if warnings:
        lines.append("pipeline_warnings:")
        lines.extend(f"- {warning}" for warning in warnings)
        lines.append("")
    for diagnostic in diagnostics:
        lines.extend(
            [
                f"{diagnostic.body_id} | {diagnostic.name} | {diagnostic.role}",
                f"  status: {diagnostic.status}",
                f"  exported_step: {diagnostic.exported_step}",
                f"  surface_ok: {diagnostic.surface_ok}, volume_ok: {diagnostic.volume_ok}, elements: {diagnostic.element_count}",
                f"  warnings: {' | '.join(diagnostic.warnings) if diagnostic.warnings else 'none'}",
            ]
        )
    (output / "mesh_diagnostics.txt").write_text("\n".join(lines), encoding="utf-8")


def build_gmsh_mesh(bodies: list[Body], config: SimulationConfig, workspace: Path) -> MeshPipelineResult:
    """Create a Gmsh volume mesh for the active classified bodies.

    Real STEP files are imported through Gmsh OCC when all active bodies share a
    source STEP path. Demo/fallback bodies are meshed as positioned boxes so the
    rest of the Elmer pipeline can be exercised without external CAD.
    """

    active = [body for body in bodies if body.role != "ignored"]
    if not active:
        raise MeshPipelineError("No active mold/plastic/water bodies are available for meshing.")

    try:
        import gmsh  # type: ignore[import-not-found]
    except Exception as exc:  # pragma: no cover - depends on optional runtime
        raise MeshPipelineError("Gmsh Python module is not installed; accurate Elmer meshing is unavailable.") from exc

    workspace.mkdir(parents=True, exist_ok=True)
    mesh_path = workspace / "thermal_model.msh"
    strategy = (config.mesh_strategy or "GMSH_OCC_PER_BODY").upper()
    result = MeshPipelineResult(
        workspace=workspace,
        gmsh_mesh_path=mesh_path,
        body_domain_ids={},
        body_domain_names={},
        mesher_strategy=strategy,
    )

    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.option.setNumber("Geometry.OCCFixDegenerated", 1)
        gmsh.option.setNumber("Geometry.OCCFixSmallEdges", 1)
        gmsh.option.setNumber("Geometry.OCCFixSmallFaces", 1)
        gmsh.option.setNumber("Mesh.MshFileVersion", 2.2)
        gmsh.option.setNumber("Mesh.Algorithm3D", 10)
        mesh_size = max(0.001, float(config.mesh_size_mm) * result.coordinate_scale_to_m)
        gmsh.option.setNumber("Mesh.MeshSizeMax", mesh_size)
        gmsh.option.setNumber("Mesh.MeshSizeMin", max(mesh_size * 0.1, mesh_size * 0.25))
        gmsh.model.add("influx_thermal_model")

        source_step = None if strategy == "SIMPLIFIED_BBOX_PREVIEW" else _shared_existing_step(active)
        if source_step and strategy == "GMSH_OCC_WHOLE_STEP":
            result.used_source_step = str(source_step)
            dimtags = gmsh.model.occ.importShapes(str(source_step))
            gmsh.model.occ.synchronize()
            volume_tags = [tag for dim, tag in dimtags if dim == 3] or [tag for dim, tag in gmsh.model.getEntities(3)]
            if not volume_tags:
                raise MeshPipelineError(f"Gmsh imported {source_step} but found no 3D volume entities.")
            volume_tags = _fragment_volumes(gmsh, volume_tags, result.warnings)
            assignments = _assign_gmsh_volumes_to_bodies(gmsh, volume_tags, active, result.warnings)
            result.warnings.append("Whole-STEP Gmsh import was used; per-body instance exports were bypassed.")
        elif source_step:
            result.used_source_step = str(source_step)
            assignments = _import_positioned_body_steps(gmsh, active, source_step, workspace, result.warnings)
            volume_tags = [tag for tags in assignments.values() for tag in tags]
            if not volume_tags:
                raise MeshPipelineError(f"Gmsh imported {source_step} body exports but found no 3D volume entities.")
            volume_tags = _fragment_volumes(gmsh, volume_tags, result.warnings)
            assignments = _assign_gmsh_volumes_to_bodies(gmsh, volume_tags, active, result.warnings)
        else:
            volume_tags = []
            for body in active:
                x0, y0, z0, x1, y1, z1 = body.bbox_mm
                tag = gmsh.model.occ.addBox(x0, y0, z0, max(0.1, x1 - x0), max(0.1, y1 - y0), max(0.1, z1 - z0))
                volume_tags.append(tag)
            gmsh.model.occ.synchronize()
            volume_tags = _fragment_volumes(gmsh, volume_tags, result.warnings)
            assignments = _assign_gmsh_volumes_to_bodies(gmsh, volume_tags, active, result.warnings)
            if strategy == "SIMPLIFIED_BBOX_PREVIEW":
                result.warnings.append("SIMPLIFIED_BBOX_PREVIEW strategy was selected; generated box volumes from body bounding boxes.")
            else:
                result.warnings.append("No shared STEP source was available; generated box volumes from body bounding boxes.")

        _scale_volumes_to_meters(gmsh, [tag for tags in assignments.values() for tag in tags], result.coordinate_scale_to_m)
        _create_physical_domains(gmsh, active, assignments, result)
        _create_cooling_boundary_groups(gmsh, active, assignments, result)
        _generate_3d_mesh_with_fallbacks(gmsh, result.warnings)

        node_tags, _, _ = gmsh.model.mesh.getNodes()
        result.node_count = len(node_tags)
        result.element_count = _element_count(gmsh.model.mesh.getElements(3)[1])
        result.boundary_count = len(gmsh.model.getEntities(2))
        if result.node_count == 0 or result.element_count == 0:
            raise MeshPipelineError("Generated mesh is empty; Gmsh produced no usable volume nodes/elements.")
        if result.element_count > config.max_mesh_elements:
            raise MeshPipelineError(
                f"Generated mesh has {result.element_count} volume elements, above configured limit {config.max_mesh_elements}."
            )
        gmsh.write(str(mesh_path))
    except MeshPipelineError:
        raise
    except Exception as exc:  # pragma: no cover - depends on CAD/mesher details
        raise MeshPipelineError(f"Gmsh meshing failed: {exc}") from exc
    finally:
        gmsh.finalize()

    return result


def _shared_existing_step(bodies: Iterable[Body]) -> Path | None:
    sources = {body.source for body in bodies if body.source and body.source != "demo"}
    if len(sources) != 1:
        return None
    path = Path(next(iter(sources)))
    if path.exists() and path.suffix.lower() in {".step", ".stp"}:
        return path
    return None


def _import_positioned_body_steps(gmsh, bodies: list[Body], source_step: Path, workspace: Path, warnings: list[str]) -> dict[str, list[int]]:
    body_steps = _export_positioned_body_steps(source_step, bodies, workspace / "positioned_body_steps", warnings)
    assignments: dict[str, list[int]] = {body.id: [] for body in bodies}
    if not body_steps:
        warnings.append("Positioned per-body STEP export failed; falling back to whole STEP import.")
        dimtags = gmsh.model.occ.importShapes(str(source_step))
        gmsh.model.occ.synchronize()
        volume_tags = [tag for dim, tag in dimtags if dim == 3] or [tag for dim, tag in gmsh.model.getEntities(3)]
        return _assign_gmsh_volumes_to_bodies(gmsh, volume_tags, bodies, warnings)
    for body, step_path in body_steps:
        before = {tag for dim, tag in gmsh.model.getEntities(3)}
        gmsh.model.occ.importShapes(str(step_path))
        gmsh.model.occ.synchronize()
        after = {tag for dim, tag in gmsh.model.getEntities(3)}
        new_tags = sorted(after - before)
        if not new_tags:
            warnings.append(f"Gmsh imported positioned body STEP for {body.name} but found no new volume.")
        assignments[body.id].extend(new_tags)
    return assignments


def _export_positioned_body_steps(source_step: Path, bodies: list[Body], output_dir: Path, warnings: list[str]) -> list[tuple[Body, Path]]:
    try:
        from OCP.IFSelect import IFSelect_RetDone
        from OCP.STEPCAFControl import STEPCAFControl_Reader
        from OCP.STEPControl import STEPControl_AsIs, STEPControl_Writer
        from OCP.TCollection import TCollection_ExtendedString
        from OCP.TDF import TDF_Label, TDF_LabelSequence
        from OCP.TDocStd import TDocStd_Document
        from OCP.TopAbs import TopAbs_SOLID
        from OCP.TopExp import TopExp_Explorer
        from OCP.XCAFApp import XCAFApp_Application
        from OCP.XCAFDoc import XCAFDoc_DocumentTool
    except Exception as exc:
        warnings.append(f"OCP positioned body export unavailable: {exc}")
        return []

    app = XCAFApp_Application.GetApplication_s()
    doc = TDocStd_Document(TCollection_ExtendedString("influx-positioned-export"))
    app.NewDocument(TCollection_ExtendedString("MDTV-XCAF"), doc)
    reader = STEPCAFControl_Reader()
    reader.SetNameMode(True)
    status = reader.ReadFile(str(source_step))
    if status != IFSelect_RetDone or not reader.Transfer(doc):
        warnings.append(f"OCP could not re-read STEP for positioned body export: status {status}")
        return []

    shape_tool = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())
    free = TDF_LabelSequence()
    shape_tool.GetFreeShapes(free)
    solids: list[object] = []

    def target_label(label):
        if shape_tool.IsReference_s(label):
            referred = TDF_Label()
            if shape_tool.GetReferredShape_s(label, referred):
                return referred
        return label

    def collect(label) -> None:
        target = target_label(label)
        components = TDF_LabelSequence()
        has_components = shape_tool.GetComponents_s(target, components, False)
        if has_components and components.Length():
            for index in range(1, components.Length() + 1):
                collect(components.Value(index))
            return
        shape = shape_tool.GetShape_s(label)
        if shape.IsNull():
            shape = shape_tool.GetShape_s(target)
        explorer = TopExp_Explorer(shape, TopAbs_SOLID)
        while explorer.More():
            solids.append(explorer.Current())
            explorer.Next()

    for index in range(1, free.Length() + 1):
        collect(free.Value(index))

    if len(solids) < len(bodies):
        warnings.append(f"OCP positioned body export found only {len(solids)} solids for {len(bodies)} classified bodies.")
    output_dir.mkdir(parents=True, exist_ok=True)
    exports: list[tuple[Body, Path]] = []
    remaining = list(solids)
    for index, body in enumerate(bodies, start=1):
        if not remaining:
            break
        solid = min(remaining, key=lambda candidate: _bbox_score(body.bbox_mm, _ocp_bounding_box(candidate)))
        remaining.remove(solid)
        path = output_dir / f"body_{index:03d}_{_safe_filename(body.name)}.step"
        writer = STEPControl_Writer()
        writer.Transfer(solid, STEPControl_AsIs)
        if writer.Write(str(path)) != IFSelect_RetDone:
            warnings.append(f"OCP failed to write positioned STEP body for {body.name}.")
            continue
        exports.append((body, path))
    warnings.append(f"Exported {len(exports)} positioned per-body STEP file(s) for Gmsh FEM meshing.")
    return exports


def _ocp_bounding_box(shape) -> tuple[float, float, float, float, float, float]:
    from OCP.Bnd import Bnd_Box
    from OCP.BRepBndLib import BRepBndLib

    box = Bnd_Box()
    BRepBndLib.Add_s(shape, box)
    x0, y0, z0, x1, y1, z1 = box.Get()
    return (float(x0), float(y0), float(z0), float(x1), float(y1), float(z1))


def _safe_filename(text: str) -> str:
    safe = "".join(ch if ch.isalnum() or ch in "._-" else "_" for ch in text)
    return safe[:48] or "body"


def _fragment_volumes(gmsh, volume_tags: list[int], warnings: list[str]) -> list[int]:
    if len(volume_tags) < 2:
        return volume_tags
    try:
        gmsh.model.occ.removeAllDuplicates()
        gmsh.model.occ.synchronize()
        volume_tags = [tag for dim, tag in gmsh.model.getEntities(3)]
        gmsh.model.occ.fragment([(3, tag) for tag in volume_tags], [])
        gmsh.model.occ.removeAllDuplicates()
        gmsh.model.occ.synchronize()
        fragmented = [tag for dim, tag in gmsh.model.getEntities(3)]
        if len(fragmented) != len(volume_tags):
            warnings.append(f"Gmsh boolean fragmentation changed volume count from {len(volume_tags)} to {len(fragmented)}.")
        return fragmented
    except Exception as exc:
        warnings.append(f"Gmsh boolean fragmentation failed; attempting original volumes. {exc}")
        gmsh.model.occ.synchronize()
        return volume_tags


def _assign_gmsh_volumes_to_bodies(gmsh, volume_tags: list[int], bodies: list[Body], warnings: list[str]) -> dict[str, list[int]]:
    assignments: dict[str, list[int]] = {body.id: [] for body in bodies}
    for tag in volume_tags:
        bbox = gmsh.model.getBoundingBox(3, tag)
        best_body = min(bodies, key=lambda body: _bbox_score(body.bbox_mm, bbox))
        assignments[best_body.id].append(tag)
    for body in bodies:
        if not assignments[body.id]:
            warnings.append(f"No Gmsh volume could be matched to body {body.name}.")
    return assignments


def _bbox_score(a: tuple[float, float, float, float, float, float], b: tuple[float, float, float, float, float, float]) -> float:
    ac = ((a[0] + a[3]) * 0.5, (a[1] + a[4]) * 0.5, (a[2] + a[5]) * 0.5)
    bc = ((b[0] + b[3]) * 0.5, (b[1] + b[4]) * 0.5, (b[2] + b[5]) * 0.5)
    size_delta = sum(abs((a[idx + 3] - a[idx]) - (b[idx + 3] - b[idx])) for idx in range(3))
    center_delta = sum((ac[idx] - bc[idx]) ** 2 for idx in range(3)) ** 0.5
    return center_delta + size_delta * 0.1


def _create_physical_domains(gmsh, bodies: list[Body], assignments: dict[str, list[int]], result: MeshPipelineResult) -> None:
    for index, body in enumerate(bodies, start=1):
        tags = assignments.get(body.id, [])
        if not tags:
            continue
        result.body_domain_ids[body.id] = index
        result.body_domain_names[index] = f"{body.role}:{body.name}"
        gmsh.model.addPhysicalGroup(3, tags, index)
        gmsh.model.setPhysicalName(3, index, _safe_physical_name(body))


def _scale_volumes_to_meters(gmsh, volume_tags: list[int], scale: float) -> None:
    if not volume_tags:
        return
    gmsh.model.occ.dilate([(3, tag) for tag in volume_tags], 0.0, 0.0, 0.0, scale, scale, scale)
    gmsh.model.occ.synchronize()


def _generate_3d_mesh_with_fallbacks(gmsh, warnings: list[str]) -> None:
    errors: list[str] = []
    for algorithm in (1, 4, 10):
        try:
            gmsh.option.setNumber("Mesh.Algorithm3D", algorithm)
            gmsh.model.mesh.generate(3)
            node_tags, _, _ = gmsh.model.mesh.getNodes()
            element_count = _element_count(gmsh.model.mesh.getElements(3)[1])
            if len(node_tags) == 0 or element_count == 0:
                raise MeshPipelineError("Gmsh reported success but produced an empty mesh.")
            if errors:
                warnings.append(f"Gmsh 3D meshing succeeded with fallback algorithm {algorithm}; previous errors: {' | '.join(errors)}")
            return
        except Exception as exc:
            errors.append(f"algorithm {algorithm}: {exc}")
            try:
                gmsh.model.mesh.clear()
            except Exception:
                pass
    raise MeshPipelineError("Gmsh meshing failed with all 3D algorithms. " + " | ".join(errors))


def _create_cooling_boundary_groups(gmsh, bodies: list[Body], assignments: dict[str, list[int]], result: MeshPipelineResult) -> None:
    water_bodies = [body for body in bodies if body.role == "water" and body.id in assignments]
    if not water_bodies:
        result.warnings.append("No water/cooling bodies were available for cooling boundary creation.")
        return
    for offset, body in enumerate(water_bodies, start=1):
        water_tags = assignments[body.id]
        surfaces = sorted(
            {
                tag
                for water_tag in water_tags
                for dim, tag in gmsh.model.getBoundary([(3, water_tag)], oriented=False, recursive=False)
                if dim == 2
            }
        )
        if not surfaces:
            result.warnings.append(f"No boundary surfaces found for water body {body.name}.")
            continue
        boundary_id = 1000 + offset
        gmsh.model.addPhysicalGroup(2, surfaces, boundary_id)
        gmsh.model.setPhysicalName(2, boundary_id, _safe_boundary_name(body))
        result.cooling_boundary_ids[body.id] = boundary_id


def _safe_physical_name(body: Body) -> str:
    text = f"{body.role}_{body.id}_{body.name}".replace(" ", "_").replace(":", "_")
    return "".join(ch for ch in text if ch.isalnum() or ch in "_.-")[:64]


def _safe_boundary_name(body: Body) -> str:
    text = f"cooling_boundary_{body.id}_{body.name}".replace(" ", "_").replace(":", "_")
    return "".join(ch for ch in text if ch.isalnum() or ch in "_.-")[:64]


def _element_count(element_tags_by_type) -> int:
    return sum(len(tags) for tags in element_tags_by_type)
