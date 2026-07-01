from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable

from app.geometry.bodies import Body
from app.simulation.solver import SimulationConfig


class MeshPipelineError(RuntimeError):
    """Raised when the external meshing pipeline cannot produce a volume mesh."""


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
            "warnings": " | ".join(self.warnings),
        }


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
    result = MeshPipelineResult(workspace=workspace, gmsh_mesh_path=mesh_path, body_domain_ids={}, body_domain_names={})

    gmsh.initialize()
    try:
        gmsh.option.setNumber("General.Terminal", 0)
        gmsh.option.setNumber("Geometry.OCCFixDegenerated", 1)
        gmsh.option.setNumber("Geometry.OCCFixSmallEdges", 1)
        gmsh.option.setNumber("Geometry.OCCFixSmallFaces", 1)
        gmsh.option.setNumber("Mesh.MshFileVersion", 2.2)
        gmsh.option.setNumber("Mesh.Algorithm3D", 10)
        gmsh.option.setNumber("Mesh.MeshSizeMax", max(0.1, float(config.mesh_size_mm)))
        gmsh.option.setNumber("Mesh.MeshSizeMin", max(0.05, float(config.mesh_size_mm) * 0.25))
        gmsh.model.add("influx_thermal_model")

        source_step = _shared_existing_step(active)
        if source_step:
            result.used_source_step = str(source_step)
            dimtags = gmsh.model.occ.importShapes(str(source_step))
            gmsh.model.occ.synchronize()
            volume_tags = [tag for dim, tag in dimtags if dim == 3] or [tag for dim, tag in gmsh.model.getEntities(3)]
            if not volume_tags:
                raise MeshPipelineError(f"Gmsh imported {source_step} but found no 3D volume entities.")
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
    for algorithm in (10, 1, 4):
        try:
            gmsh.option.setNumber("Mesh.Algorithm3D", algorithm)
            gmsh.model.mesh.clear()
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
