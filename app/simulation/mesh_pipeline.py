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
    variant: str
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
            "variant": self.variant,
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
    mesher_strategy: str = "AUTO_EXACT_THEN_REPAIRED_SURFACE"
    diagnostics_dir: str = ""
    quality_summary: dict[str, float | int | str] = field(default_factory=dict)
    interface_summary: list[dict[str, float | int | str]] = field(default_factory=list)
    readiness_status: str = "UNASSESSED"

    def summary(self) -> dict[str, int | float | str]:
        interface_text = " | ".join(
            f"{item.get('body_a')}->{item.get('body_b')} {item.get('relationship')} close={item.get('close_triangle_count_a', 0)}"
            for item in self.interface_summary
        )
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
            "readiness_status": self.readiness_status,
            "quality_summary": " | ".join(f"{key}={value}" for key, value in self.quality_summary.items()),
            "interface_summary": interface_text,
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
    strategy = (config.mesh_strategy or "AUTO_EXACT_THEN_REPAIRED_SURFACE").upper()
    source_step = _shared_existing_step(active)
    raw_steps: list[tuple[Body, Path]] = []
    healed_steps: list[tuple[Body, Path]] = []
    if source_step:
        raw_steps = _export_positioned_body_steps(source_step, active, output / "positioned_body_steps_raw", warnings)
        if strategy != "GMSH_OCC_PER_BODY":
            healed_steps = _export_positioned_body_steps(
                source_step,
                active,
                output / "positioned_body_steps_healed",
                warnings,
                heal_shapes=True,
            )
    else:
        warnings.append("No shared real STEP source was available; exact per-body CAD diagnostics cannot run.")

    raw_by_id = {body.id: step for body, step in raw_steps}
    healed_by_id = {body.id: step for body, step in healed_steps}
    for body in active:
        raw_diag = BodyMeshDiagnostic(
            body_id=body.id,
            name=body.name,
            role=body.role,
            variant="raw",
            hierarchy_path=body.hierarchy_path,
            source_step=body.source,
            exported_step=str(raw_by_id.get(body.id, "")),
            bbox_mm=body.bbox_mm,
            volume_mm3=body.volume_mm3,
            face_count=body.face_count,
        )
        if body.id not in raw_by_id:
            raw_diag.status = "skipped: no positioned STEP export"
            raw_diag.warnings.extend(warnings)
            diagnostics.append(raw_diag)
            continue
        _diagnose_body_step(raw_by_id[body.id], config, raw_diag)
        diagnostics.append(raw_diag)
        if raw_diag.volume_ok or body.id not in healed_by_id:
            continue
        healed_diag = BodyMeshDiagnostic(
            body_id=body.id,
            name=body.name,
            role=body.role,
            variant="healed",
            hierarchy_path=body.hierarchy_path,
            source_step=body.source,
            exported_step=str(healed_by_id[body.id]),
            bbox_mm=body.bbox_mm,
            volume_mm3=body.volume_mm3,
            face_count=body.face_count,
        )
        _diagnose_body_step(healed_by_id[body.id], config, healed_diag)
        diagnostics.append(healed_diag)

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
    fieldnames = list(BodyMeshDiagnostic("", "", "", "", "", "", "", (0, 0, 0, 0, 0, 0), 0.0, 0).as_dict().keys())
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
        f"body_variants_exact_tetra_ok: {sum(1 for diagnostic in diagnostics if diagnostic.volume_ok)}",
        "",
    ]
    if warnings:
        lines.append("pipeline_warnings:")
        lines.extend(f"- {warning}" for warning in warnings)
        lines.append("")
    for diagnostic in diagnostics:
        lines.extend(
            [
                f"{diagnostic.body_id} | {diagnostic.name} | {diagnostic.role} | {diagnostic.variant}",
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
    strategy = (config.mesh_strategy or "AUTO_EXACT_THEN_REPAIRED_SURFACE").upper()
    if strategy == "SURFACE_REPAIR_TETGEN_PER_BODY":
        return _build_surface_repair_tetgen_mesh(active, config, workspace, "SURFACE_REPAIR_TETGEN_PER_BODY")
    if strategy == "CONTROLLED_APPROX_CONFORMING_GRID":
        return _build_controlled_approx_conforming_grid_mesh(active, config, workspace)
    exact_strategy = "GMSH_OCC_HEALED_PER_BODY" if strategy == "AUTO_EXACT_THEN_REPAIRED_SURFACE" else strategy
    result = MeshPipelineResult(
        workspace=workspace,
        gmsh_mesh_path=mesh_path,
        body_domain_ids={},
        body_domain_names={},
        mesher_strategy=exact_strategy,
    )

    gmsh_finalized = False
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

        source_step = None if exact_strategy == "SIMPLIFIED_BBOX_PREVIEW" else _shared_existing_step(active)
        if source_step and exact_strategy == "GMSH_OCC_WHOLE_STEP":
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
            assignments = _import_positioned_body_steps(
                gmsh,
                active,
                source_step,
                workspace,
                result.warnings,
                heal_shapes=exact_strategy != "GMSH_OCC_PER_BODY",
            )
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
            if exact_strategy == "SIMPLIFIED_BBOX_PREVIEW":
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
    except MeshPipelineError as exc:
        if strategy == "AUTO_EXACT_THEN_REPAIRED_SURFACE":
            gmsh.finalize()
            gmsh_finalized = True
            fallback = _build_surface_repair_tetgen_mesh(active, config, workspace, "AUTO_EXACT_THEN_REPAIRED_SURFACE")
            fallback.warnings.insert(0, f"Exact Gmsh CAD volume meshing failed; used repaired per-body surface tetra fallback. Exact error: {exc}")
            return fallback
        raise
    except Exception as exc:  # pragma: no cover - depends on CAD/mesher details
        raise MeshPipelineError(f"Gmsh meshing failed: {exc}") from exc
    finally:
        if not gmsh_finalized:
            try:
                gmsh.finalize()
            except Exception:
                pass

    return result


def _shared_existing_step(bodies: Iterable[Body]) -> Path | None:
    sources = {body.source for body in bodies if body.source and body.source != "demo"}
    if len(sources) != 1:
        return None
    path = Path(next(iter(sources)))
    if path.exists() and path.suffix.lower() in {".step", ".stp"}:
        return path
    return None


def _build_surface_repair_tetgen_mesh(
    bodies: list[Body],
    config: SimulationConfig,
    workspace: Path,
    strategy: str,
) -> MeshPipelineResult:
    try:
        import meshio  # type: ignore[import-not-found]
        import numpy as np
        import tetgen  # type: ignore[import-not-found]
        from pymeshfix import MeshFix  # type: ignore[import-not-found]
    except Exception as exc:  # pragma: no cover - optional runtime
        raise MeshPipelineError(f"Surface-repair TetGen fallback dependencies are unavailable: {exc}") from exc

    source_step = _shared_existing_step(bodies)
    if not source_step:
        raise MeshPipelineError("Surface-repair TetGen fallback requires a shared real STEP source.")

    workspace.mkdir(parents=True, exist_ok=True)
    warnings: list[str] = [
        "Using repaired per-body surface tetra fallback. This creates nonconformal per-body tetra meshes from real surface triangles.",
        "Use this to unblock Elmer FEM setup; contact/interface coupling still needs validation before engineering sign-off.",
    ]
    body_steps = _export_positioned_body_steps(source_step, bodies, workspace / "surface_repair_body_steps", warnings)
    if len(body_steps) != len(bodies):
        raise MeshPipelineError(f"Surface-repair fallback exported {len(body_steps)} body STEP files for {len(bodies)} bodies.")

    all_points: list[object] = []
    all_tets: list[object] = []
    all_tris: list[object] = []
    tet_tags: list[object] = []
    tri_tags: list[object] = []
    body_surfaces: list[dict[str, object]] = []
    point_offset = 0
    total_tets = 0
    mesh_path = workspace / "thermal_model.msh"
    result = MeshPipelineResult(
        workspace=workspace,
        gmsh_mesh_path=mesh_path,
        body_domain_ids={},
        body_domain_names={},
        mesher_strategy=strategy,
    )

    for body_index, (body, step_path) in enumerate(body_steps, start=1):
        surface_points, surface_faces = _gmsh_surface_mesh_from_step(step_path, config.mesh_size_mm)
        if len(surface_points) == 0 or len(surface_faces) == 0:
            raise MeshPipelineError(f"Surface-repair fallback produced no surface mesh for {body.name}.")
        fixer = MeshFix(surface_points, surface_faces)
        boundary_count_before = fixer.n_boundaries
        fixer.repair(joincomp=True, remove_smallest_components=False)
        fixed_points = np.asarray(fixer.points, dtype=float)
        fixed_faces = np.asarray(fixer.faces, dtype=np.int64)
        if len(fixed_points) == 0 or len(fixed_faces) == 0:
            raise MeshPipelineError(f"MeshFix produced an empty repaired surface for {body.name}.")

        tet = tetgen.TetGen(fixed_points, fixed_faces)
        try:
            nodes, elements, _, _ = tet.tetrahedralize(
                quality=True,
                minratio=1.2,
                mindihedral=1.0,
                steinerleft=300000,
                quiet=True,
            )
        except Exception as exc:
            raise MeshPipelineError(f"TetGen failed on repaired surface for {body.name}: {exc}") from exc

        nodes = np.asarray(nodes, dtype=float) * result.coordinate_scale_to_m
        elements = np.asarray(elements, dtype=np.int64)
        if len(nodes) == 0 or len(elements) == 0:
            raise MeshPipelineError(f"TetGen produced no tetrahedra for {body.name}.")
        all_points.append(nodes)
        all_tets.append(elements + point_offset)
        tet_tags.append(np.full(len(elements), body_index, dtype=np.int32))
        result.body_domain_ids[body.id] = body_index
        result.body_domain_names[body_index] = f"{body.role}:{body.name}"
        total_tets += len(elements)

        boundary_faces = np.asarray(getattr(tet, "trifaces", fixed_faces), dtype=np.int64)
        if body.role == "water" and len(boundary_faces):
            boundary_id = 1000 + len(result.cooling_boundary_ids) + 1
            all_tris.append(boundary_faces + point_offset)
            tri_tags.append(np.full(len(boundary_faces), boundary_id, dtype=np.int32))
            result.cooling_boundary_ids[body.id] = boundary_id

        warnings.append(
            f"{body.name}: repaired surface {len(surface_faces)} -> {len(fixed_faces)} triangles, "
            f"boundaries {boundary_count_before}->{fixer.n_boundaries}, tetrahedra {len(elements)}."
        )
        body_surfaces.append(
            {
                "id": body.id,
                "name": body.name,
                "role": body.role,
                "points_mm": fixed_points,
                "faces": fixed_faces,
            }
        )
        point_offset += len(nodes)

    if total_tets > config.max_mesh_elements:
        raise MeshPipelineError(
            f"Surface-repair TetGen mesh has {total_tets} volume elements, above configured limit {config.max_mesh_elements}."
        )

    points = np.vstack(all_points)
    tetra = np.vstack(all_tets)
    triangle = np.vstack(all_tris) if all_tris else np.empty((0, 3), dtype=np.int64)
    tetra_tags = np.concatenate(tet_tags)
    triangle_tags = np.concatenate(tri_tags) if tri_tags else np.empty((0,), dtype=np.int32)
    cells = [("tetra", tetra)]
    cell_data_physical = [tetra_tags]
    cell_data_geometrical = [tetra_tags]
    if len(triangle):
        cells.append(("triangle", triangle))
        cell_data_physical.append(triangle_tags)
        cell_data_geometrical.append(triangle_tags)
    mesh = meshio.Mesh(
        points,
        cells,
        cell_data={"gmsh:physical": cell_data_physical, "gmsh:geometrical": cell_data_geometrical},
    )
    meshio.write(mesh_path, mesh, file_format="gmsh22", binary=False)

    result.node_count = len(points)
    result.element_count = int(total_tets)
    result.boundary_count = int(len(triangle))
    result.used_source_step = str(source_step)
    result.quality_summary = _tet_quality_summary(points, tetra)
    result.interface_summary = _surface_interface_summary(body_surfaces, config.mesh_size_mm)
    result.readiness_status = _mesh_readiness_status(result)
    _write_mesh_readiness_manifest(workspace, result)
    result.warnings.extend(warnings)
    return result


def _build_controlled_approx_conforming_grid_mesh(
    bodies: list[Body],
    config: SimulationConfig,
    workspace: Path,
) -> MeshPipelineResult:
    try:
        import meshio  # type: ignore[import-not-found]
        import numpy as np
    except Exception as exc:  # pragma: no cover - optional runtime
        raise MeshPipelineError(f"Controlled conforming grid dependencies are unavailable: {exc}") from exc

    source_step = _shared_existing_step(bodies)
    if not source_step:
        raise MeshPipelineError("Controlled conforming grid mesh requires a shared real STEP source.")

    workspace.mkdir(parents=True, exist_ok=True)
    warnings: list[str] = [
        "Using controlled approximation conforming grid mesh. Material interfaces share grid nodes.",
        "Geometry is approximated by grid cells; use mesh convergence before validation-grade engineering decisions.",
    ]
    body_steps = _export_positioned_body_steps(source_step, bodies, workspace / "conforming_grid_body_steps", warnings)
    if len(body_steps) != len(bodies):
        raise MeshPipelineError(f"Conforming grid exported {len(body_steps)} body STEP files for {len(bodies)} bodies.")

    cell_size_mm = max(0.25, float(config.mesh_size_mm))
    labels, origin_mm, surface_records = _classify_conforming_grid_cells(body_steps, cell_size_mm, warnings)
    if not np.any(labels):
        raise MeshPipelineError("Controlled conforming grid classifier produced no occupied cells.")

    points_mm, tetra, tetra_tags, triangles, triangle_tags, cooling_ids = _tetrahedralize_labeled_grid(labels, origin_mm, cell_size_mm, bodies)
    if len(tetra) == 0:
        raise MeshPipelineError("Controlled conforming grid produced no tetrahedra.")
    if len(tetra) > config.max_mesh_elements:
        raise MeshPipelineError(f"Controlled conforming grid has {len(tetra)} tetrahedra, above limit {config.max_mesh_elements}.")

    mesh_path = workspace / "thermal_model.msh"
    cells = [("tetra", tetra)]
    cell_data_physical = [tetra_tags]
    cell_data_geometrical = [tetra_tags]
    if len(triangles):
        cells.append(("triangle", triangles))
        cell_data_physical.append(triangle_tags)
        cell_data_geometrical.append(triangle_tags)
    points_m = points_mm * 0.001
    meshio.write(
        mesh_path,
        meshio.Mesh(points_m, cells, cell_data={"gmsh:physical": cell_data_physical, "gmsh:geometrical": cell_data_geometrical}),
        file_format="gmsh22",
        binary=False,
    )

    result = MeshPipelineResult(
        workspace=workspace,
        gmsh_mesh_path=mesh_path,
        body_domain_ids={body.id: index for index, body in enumerate(bodies, start=1)},
        body_domain_names={index: f"{body.role}:{body.name}" for index, body in enumerate(bodies, start=1)},
        cooling_boundary_ids=cooling_ids,
        node_count=int(len(points_m)),
        element_count=int(len(tetra)),
        boundary_count=int(len(triangles)),
        used_source_step=str(source_step),
        mesher_strategy="CONTROLLED_APPROX_CONFORMING_GRID",
    )
    result.quality_summary = _tet_quality_summary(points_m, tetra)
    result.interface_summary = _grid_interface_summary(labels, bodies, cell_size_mm)
    result.quality_summary["cell_size_mm"] = float(cell_size_mm)
    result.quality_summary["occupied_cells"] = int(np.sum(labels > 0))
    result.quality_summary["grid_dimensions"] = "x".join(str(value) for value in labels.shape)
    result.quality_summary["max_geometry_deviation_mm"] = float(cell_size_mm * (3.0 ** 0.5) * 0.5)
    result.warnings.extend(warnings)
    result.warnings.extend(surface_records)
    result.readiness_status = _mesh_readiness_status(result)
    _write_mesh_readiness_manifest(workspace, result)
    return result


def _classify_conforming_grid_cells(body_steps: list[tuple[Body, Path]], cell_size_mm: float, warnings: list[str]):
    import numpy as np
    import pyvista as pv  # type: ignore[import-not-found]

    bodies = [body for body, _ in body_steps]
    pad = cell_size_mm
    x0 = min(body.bbox_mm[0] for body in bodies) - pad
    y0 = min(body.bbox_mm[1] for body in bodies) - pad
    z0 = min(body.bbox_mm[2] for body in bodies) - pad
    x1 = max(body.bbox_mm[3] for body in bodies) + pad
    y1 = max(body.bbox_mm[4] for body in bodies) + pad
    z1 = max(body.bbox_mm[5] for body in bodies) + pad
    nx = int(np.ceil((x1 - x0) / cell_size_mm))
    ny = int(np.ceil((y1 - y0) / cell_size_mm))
    nz = int(np.ceil((z1 - z0) / cell_size_mm))
    centers = _grid_cell_centers((x0, y0, z0), (nx, ny, nz), cell_size_mm)
    offsets = np.asarray(
        [
            (0.0, 0.0, 0.0),
            (-0.35, -0.35, -0.35),
            (0.35, -0.35, -0.35),
            (-0.35, 0.35, -0.35),
            (0.35, 0.35, -0.35),
            (-0.35, -0.35, 0.35),
            (0.35, -0.35, 0.35),
            (-0.35, 0.35, 0.35),
            (0.35, 0.35, 0.35),
        ],
        dtype=float,
    ) * cell_size_mm
    labels = np.zeros(len(centers), dtype=np.int16)
    scores = np.zeros(len(centers), dtype=np.int16)
    priorities = np.zeros(len(centers), dtype=np.int16)
    priority = {"plastic": 3, "water": 2, "mold": 1}
    records: list[str] = []

    for body_index, (body, step_path) in enumerate(body_steps, start=1):
        surface_points, surface_faces = _gmsh_surface_mesh_from_step(step_path, cell_size_mm)
        repaired_points, repaired_faces, before_boundaries, after_boundaries = _repair_surface(surface_points, surface_faces)
        poly_faces = np.hstack([np.full((len(repaired_faces), 1), 3), repaired_faces]).astype(np.int64).ravel()
        poly = pv.PolyData(repaired_points, poly_faces)
        votes = np.zeros(len(centers), dtype=np.int16)
        for offset in offsets:
            cloud = pv.PolyData(centers + offset)
            if hasattr(cloud, "select_interior_points"):
                enclosed = cloud.select_interior_points(poly, check_surface=False)
                selected = enclosed.point_data["selected_points"]
            else:  # pragma: no cover - compatibility for older PyVista
                enclosed = cloud.select_enclosed_points(poly, tolerance=1e-6, check_surface=False)
                selected = enclosed.point_data["SelectedPoints"]
            votes += selected.astype(np.int16)
        body_priority = priority.get(body.role, 0)
        mask = (votes > scores) | ((votes == scores) & (votes > 0) & (body_priority > priorities))
        labels[mask] = body_index
        scores[mask] = votes[mask]
        priorities[mask] = body_priority
        records.append(
            f"{body.name}: grid classifier votes on {int(np.sum(votes > 0))} cells; "
            f"surface triangles {len(surface_faces)}->{len(repaired_faces)}, boundaries {before_boundaries}->{after_boundaries}."
        )

    labels_3d = labels.reshape((nx, ny, nz))
    for body_index, body in enumerate(bodies, start=1):
        count = int(np.sum(labels_3d == body_index))
        records.append(f"{body.name}: conforming grid occupied cells={count}.")
        if count == 0:
            raise MeshPipelineError(f"Controlled conforming grid missed body {body.name}; reduce mesh size.")
    warnings.append(f"Controlled conforming grid dimensions: {nx} x {ny} x {nz} cells at {cell_size_mm:.3g} mm.")
    return labels_3d, (x0, y0, z0), records


def _grid_cell_centers(origin: tuple[float, float, float], dims: tuple[int, int, int], cell_size_mm: float):
    import numpy as np

    x0, y0, z0 = origin
    nx, ny, nz = dims
    xs = x0 + (np.arange(nx) + 0.5) * cell_size_mm
    ys = y0 + (np.arange(ny) + 0.5) * cell_size_mm
    zs = z0 + (np.arange(nz) + 0.5) * cell_size_mm
    x, y, z = np.meshgrid(xs, ys, zs, indexing="ij")
    return np.c_[x.ravel(), y.ravel(), z.ravel()]


def _repair_surface(surface_points, surface_faces):
    import numpy as np
    from pymeshfix import MeshFix  # type: ignore[import-not-found]

    fixer = MeshFix(surface_points, surface_faces)
    before = fixer.n_boundaries
    fixer.repair(joincomp=True, remove_smallest_components=False)
    return np.asarray(fixer.points, dtype=float), np.asarray(fixer.faces, dtype=np.int64), int(before), int(fixer.n_boundaries)


def _tetrahedralize_labeled_grid(labels, origin_mm: tuple[float, float, float], cell_size_mm: float, bodies: list[Body]):
    import numpy as np

    nx, ny, nz = labels.shape
    node_index: dict[tuple[int, int, int], int] = {}
    points: list[tuple[float, float, float]] = []
    tetra: list[tuple[int, int, int, int]] = []
    tetra_tags: list[int] = []
    triangles: list[tuple[int, int, int]] = []
    triangle_tags: list[int] = []
    cooling_ids: dict[str, int] = {}
    water_indices = {index for index, body in enumerate(bodies, start=1) if body.role == "water"}

    def node(i: int, j: int, k: int) -> int:
        key = (i, j, k)
        if key not in node_index:
            node_index[key] = len(points)
            points.append((origin_mm[0] + i * cell_size_mm, origin_mm[1] + j * cell_size_mm, origin_mm[2] + k * cell_size_mm))
        return node_index[key]

    cube_tets = ((0, 1, 3, 7), (0, 3, 2, 7), (0, 2, 6, 7), (0, 6, 4, 7), (0, 4, 5, 7), (0, 5, 1, 7))
    for i in range(nx):
        for j in range(ny):
            for k in range(nz):
                tag = int(labels[i, j, k])
                if tag <= 0:
                    continue
                n = [
                    node(i, j, k),
                    node(i + 1, j, k),
                    node(i, j + 1, k),
                    node(i + 1, j + 1, k),
                    node(i, j, k + 1),
                    node(i + 1, j, k + 1),
                    node(i, j + 1, k + 1),
                    node(i + 1, j + 1, k + 1),
                ]
                for tet in cube_tets:
                    tetra.append((n[tet[0]], n[tet[1]], n[tet[2]], n[tet[3]]))
                    tetra_tags.append(tag)
                if tag in water_indices:
                    _append_grid_water_boundaries(labels, i, j, k, tag, n, bodies, cooling_ids, triangles, triangle_tags)

    return (
        np.asarray(points, dtype=float),
        np.asarray(tetra, dtype=np.int64),
        np.asarray(tetra_tags, dtype=np.int32),
        np.asarray(triangles, dtype=np.int64),
        np.asarray(triangle_tags, dtype=np.int32),
        cooling_ids,
    )


def _append_grid_water_boundaries(labels, i, j, k, water_tag, cube_nodes, bodies, cooling_ids, triangles, triangle_tags) -> None:
    face_defs = [
        ((-1, 0, 0), (0, 2, 6, 4)),
        ((1, 0, 0), (1, 5, 7, 3)),
        ((0, -1, 0), (0, 4, 5, 1)),
        ((0, 1, 0), (2, 3, 7, 6)),
        ((0, 0, -1), (0, 1, 3, 2)),
        ((0, 0, 1), (4, 6, 7, 5)),
    ]
    nx, ny, nz = labels.shape
    body = bodies[water_tag - 1]
    boundary_id = cooling_ids.setdefault(body.id, 1000 + len(cooling_ids) + 1)
    for (di, dj, dk), corners in face_defs:
        ni, nj, nk = i + di, j + dj, k + dk
        neighbor = 0 if ni < 0 or nj < 0 or nk < 0 or ni >= nx or nj >= ny or nk >= nz else int(labels[ni, nj, nk])
        if neighbor > 0 and bodies[neighbor - 1].role == "mold":
            a, b, c, d = [cube_nodes[index] for index in corners]
            triangles.append((a, b, c))
            triangles.append((a, c, d))
            triangle_tags.extend([boundary_id, boundary_id])


def _grid_interface_summary(labels, bodies: list[Body], cell_size_mm: float) -> list[dict[str, float | int | str]]:
    import numpy as np

    summaries: dict[tuple[int, int], int] = {}
    for axis in range(3):
        left = np.take(labels, range(labels.shape[axis] - 1), axis=axis)
        right = np.take(labels, range(1, labels.shape[axis]), axis=axis)
        mask = (left > 0) & (right > 0) & (left != right)
        for a, b in zip(left[mask].ravel(), right[mask].ravel()):
            key = tuple(sorted((int(a), int(b))))
            summaries[key] = summaries.get(key, 0) + 1
    output: list[dict[str, float | int | str]] = []
    for (a, b), face_count in sorted(summaries.items()):
        body_a = bodies[a - 1]
        body_b = bodies[b - 1]
        roles = {body_a.role, body_b.role}
        relationship = "plastic_mold_contact" if roles == {"plastic", "mold"} else "mold_water_cooling" if roles == {"mold", "water"} else "mold_mold_contact" if roles == {"mold"} else "other_contact"
        output.append(
            {
                "body_a": body_a.name,
                "role_a": body_a.role,
                "body_b": body_b.name,
                "role_b": body_b.role,
                "relationship": relationship,
                "shared_grid_face_count": int(face_count),
                "approx_interface_area_m2": float(face_count * (cell_size_mm * 1e-3) ** 2),
            }
        )
    return output


def _gmsh_surface_mesh_from_step(step_path: Path, mesh_size_mm: float):
    import gmsh  # type: ignore[import-not-found]
    import numpy as np

    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.option.setNumber("Mesh.MshFileVersion", 2.2)
        size = max(0.001, float(mesh_size_mm))
        gmsh.option.setNumber("Mesh.MeshSizeMax", size)
        gmsh.option.setNumber("Mesh.MeshSizeMin", max(size * 0.1, size * 0.25))
        gmsh.model.add(f"surface_repair_{_safe_filename(step_path.stem)}")
        gmsh.model.occ.importShapes(str(step_path))
        gmsh.model.occ.synchronize()
        gmsh.model.mesh.generate(2)
        node_tags, coords, _ = gmsh.model.mesh.getNodes()
        points = np.asarray(coords, dtype=float).reshape((-1, 3))
        tag_to_index = {int(tag): index for index, tag in enumerate(node_tags)}
        faces: list[list[int]] = []
        element_types, _, element_node_tags = gmsh.model.mesh.getElements(2)
        for element_type, nodes in zip(element_types, element_node_tags):
            if element_type != 2:
                continue
            triangles = np.asarray(nodes, dtype=np.int64).reshape((-1, 3))
            for triangle in triangles:
                face = [tag_to_index[int(node)] for node in triangle]
                if len(set(face)) == 3:
                    faces.append(face)
        return points, np.asarray(faces, dtype=np.int64)
    finally:
        gmsh.finalize()


def _tet_quality_summary(points, tetra) -> dict[str, float | int | str]:
    import numpy as np

    if len(points) == 0 or len(tetra) == 0:
        return {"status": "empty", "tet_count": 0}
    p = np.asarray(points, dtype=float)
    t = np.asarray(tetra, dtype=np.int64)
    a = p[t[:, 0]]
    b = p[t[:, 1]]
    c = p[t[:, 2]]
    d = p[t[:, 3]]
    volumes = np.abs(np.einsum("ij,ij->i", np.cross(b - a, c - a), d - a)) / 6.0
    edges = np.stack(
        [
            np.linalg.norm(a - b, axis=1),
            np.linalg.norm(a - c, axis=1),
            np.linalg.norm(a - d, axis=1),
            np.linalg.norm(b - c, axis=1),
            np.linalg.norm(b - d, axis=1),
            np.linalg.norm(c - d, axis=1),
        ],
        axis=1,
    )
    min_edge = np.maximum(np.min(edges, axis=1), 1e-18)
    max_edge = np.max(edges, axis=1)
    edge_ratio = max_edge / min_edge
    near_zero_floor = max(float(np.max(volumes)) * 1e-14, 1e-30)
    zero_volume = int(np.sum(volumes <= 1e-30))
    near_zero = int(np.sum((volumes > 1e-30) & (volumes <= near_zero_floor)))
    bad_ratio = int(np.sum(edge_ratio > 100.0))
    status = "ok"
    if zero_volume:
        status = "invalid_zero_volume"
    elif bad_ratio or near_zero:
        status = "warning_sliver_elements"
    return {
        "status": status,
        "tet_count": int(len(t)),
        "near_zero_volume_floor_m3": float(near_zero_floor),
        "min_volume_m3": float(np.min(volumes)),
        "mean_volume_m3": float(np.mean(volumes)),
        "max_edge_ratio": float(np.max(edge_ratio)),
        "mean_edge_ratio": float(np.mean(edge_ratio)),
        "zero_volume_tets": zero_volume,
        "near_zero_volume_tets": near_zero,
        "edge_ratio_gt_100": bad_ratio,
    }


def _surface_interface_summary(body_surfaces: list[dict[str, object]], mesh_size_mm: float) -> list[dict[str, float | int | str]]:
    import numpy as np
    from scipy.spatial import cKDTree  # type: ignore[import-not-found]

    threshold_mm = max(0.25, float(mesh_size_mm) * 0.05)
    summaries: list[dict[str, float | int | str]] = []
    for i, a in enumerate(body_surfaces):
        points_a = np.asarray(a["points_mm"], dtype=float)
        faces_a = np.asarray(a["faces"], dtype=np.int64)
        if len(points_a) == 0 or len(faces_a) == 0:
            continue
        centroids_a = points_a[faces_a].mean(axis=1)
        for b in body_surfaces[i + 1:]:
            role_pair = {str(a["role"]), str(b["role"])}
            if role_pair not in [{"plastic", "mold"}, {"mold", "water"}, {"mold"}]:
                continue
            points_b = np.asarray(b["points_mm"], dtype=float)
            if len(points_b) == 0:
                continue
            distances, _ = cKDTree(points_b).query(centroids_a, workers=-1)
            close = distances <= threshold_mm
            close_count = int(np.sum(close))
            if close_count == 0:
                continue
            relationship = "plastic_mold_contact" if role_pair == {"plastic", "mold"} else "mold_water_cooling" if role_pair == {"mold", "water"} else "mold_mold_contact"
            summaries.append(
                {
                    "body_a": str(a["name"]),
                    "role_a": str(a["role"]),
                    "body_b": str(b["name"]),
                    "role_b": str(b["role"]),
                    "relationship": relationship,
                    "threshold_mm": float(threshold_mm),
                    "close_triangle_count_a": close_count,
                    "surface_triangle_count_a": int(len(faces_a)),
                    "coverage_fraction_a": float(close_count / max(1, len(faces_a))),
                    "min_distance_mm": float(np.min(distances)),
                    "mean_close_distance_mm": float(np.mean(distances[close])),
                    "max_close_distance_mm": float(np.max(distances[close])),
                }
            )
    return summaries


def _mesh_readiness_status(result: MeshPipelineResult) -> str:
    quality_status = str(result.quality_summary.get("status", "unknown"))
    if quality_status.startswith("invalid"):
        return "NOT_FEM_READY_INVALID_TET_QUALITY"
    if result.mesher_strategy == "CONTROLLED_APPROX_CONFORMING_GRID":
        if not result.interface_summary:
            return "FEM_MESHED_NEEDS_INTERFACE_CONTACT_EVIDENCE"
        return "FEM_READY_CONFORMING_APPROX_REQUIRES_DEVIATION_AND_CONVERGENCE_VALIDATION"
    if "SURFACE" in result.mesher_strategy:
        if not result.interface_summary:
            return "FEM_MESHED_NEEDS_INTERFACE_CONTACT_EVIDENCE"
        return "FEM_READY_NONCONFORMAL_REQUIRES_CONTACT_COUPLING_VALIDATION"
    return "FEM_READY_EXACT_MESH_REQUIRES_CONVERGENCE_VALIDATION"


def _write_mesh_readiness_manifest(workspace: Path, result: MeshPipelineResult) -> None:
    manifest = {
        "readiness_status": result.readiness_status,
        "mesher_strategy": result.mesher_strategy,
        "mesh_path": str(result.gmsh_mesh_path),
        "node_count": result.node_count,
        "element_count": result.element_count,
        "boundary_count": result.boundary_count,
        "body_domain_ids": result.body_domain_ids,
        "cooling_boundary_ids": result.cooling_boundary_ids,
        "quality_summary": result.quality_summary,
        "interface_summary": result.interface_summary,
        "warnings": result.warnings,
    }
    (workspace / "mesh_readiness.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")


def _import_positioned_body_steps(
    gmsh,
    bodies: list[Body],
    source_step: Path,
    workspace: Path,
    warnings: list[str],
    heal_shapes: bool = False,
) -> dict[str, list[int]]:
    directory = workspace / ("positioned_body_steps_healed" if heal_shapes else "positioned_body_steps")
    body_steps = _export_positioned_body_steps(source_step, bodies, directory, warnings, heal_shapes=heal_shapes)
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


def _export_positioned_body_steps(
    source_step: Path,
    bodies: list[Body],
    output_dir: Path,
    warnings: list[str],
    heal_shapes: bool = False,
) -> list[tuple[Body, Path]]:
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
        shape_to_write = _heal_ocp_shape(solid, body.name, warnings) if heal_shapes else solid
        suffix = "_healed" if heal_shapes else ""
        path = output_dir / f"body_{index:03d}_{_safe_filename(body.name)}{suffix}.step"
        writer = STEPControl_Writer()
        writer.Transfer(shape_to_write, STEPControl_AsIs)
        if writer.Write(str(path)) != IFSelect_RetDone:
            warnings.append(f"OCP failed to write positioned STEP body for {body.name}.")
            continue
        exports.append((body, path))
    mode = "healed " if heal_shapes else ""
    warnings.append(f"Exported {len(exports)} {mode}positioned per-body STEP file(s) for Gmsh FEM meshing.")
    return exports


def _heal_ocp_shape(shape, name: str, warnings: list[str]):
    try:
        from OCP.BRepCheck import BRepCheck_Analyzer
        from OCP.ShapeFix import ShapeFix_Shape
        from OCP.ShapeUpgrade import ShapeUpgrade_UnifySameDomain
    except Exception as exc:
        warnings.append(f"OCP healing unavailable for {name}: {exc}")
        return shape

    try:
        before_valid = bool(BRepCheck_Analyzer(shape).IsValid())
    except Exception:
        before_valid = False
    try:
        fixer = ShapeFix_Shape(shape)
        fixer.Perform()
        fixed = fixer.Shape()
        unify = ShapeUpgrade_UnifySameDomain(fixed, True, True, True)
        unify.SetSafeInputMode(True)
        unify.Build()
        healed = unify.Shape()
        try:
            after_valid = bool(BRepCheck_Analyzer(healed).IsValid())
        except Exception:
            after_valid = False
        warnings.append(f"OCP healing for {name}: valid_before={before_valid}, valid_after={after_valid}.")
        return healed
    except Exception as exc:
        warnings.append(f"OCP healing failed for {name}; using raw positioned solid. {exc}")
        return shape


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
