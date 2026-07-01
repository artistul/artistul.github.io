from __future__ import annotations

import csv
from dataclasses import dataclass, field
from pathlib import Path

from app.geometry.bodies import Body, default_role_for_name


@dataclass(slots=True)
class StepInspection:
    path: Path
    bodies: list[Body]
    tree_lines: list[str]
    warnings: list[str] = field(default_factory=list)
    log_lines: list[str] = field(default_factory=list)
    used_kernel: str = "none"


def inspect_step(path: str | Path, output_dir: str | Path = "outputs/step_diagnostics") -> StepInspection:
    step_path = Path(path)
    if not step_path.exists():
        raise FileNotFoundError(f"STEP file not found: {step_path}")

    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    try:
        inspection = _inspect_with_ocp(step_path)
    except Exception as exc:
        inspection = _inspect_with_text_fallback(step_path, str(exc))

    _add_domain_warning(inspection)
    _write_diagnostics(inspection, output)
    return inspection


def _inspect_with_ocp(path: Path) -> StepInspection:
    import cadquery as cq
    from OCP.IFSelect import IFSelect_RetDone
    from OCP.STEPCAFControl import STEPCAFControl_Reader
    from OCP.TCollection import TCollection_ExtendedString
    from OCP.TDataStd import TDataStd_Name
    from OCP.TDF import TDF_Label, TDF_LabelSequence
    from OCP.TDocStd import TDocStd_Document
    from OCP.TopAbs import TopAbs_SOLID
    from OCP.TopExp import TopExp_Explorer
    from OCP.XCAFApp import XCAFApp_Application
    from OCP.Quantity import Quantity_Color
    from OCP.XCAFDoc import XCAFDoc_ColorType, XCAFDoc_DocumentTool

    app = XCAFApp_Application.GetApplication_s()
    doc = TDocStd_Document(TCollection_ExtendedString("influx-step"))
    app.NewDocument(TCollection_ExtendedString("MDTV-XCAF"), doc)
    reader = STEPCAFControl_Reader()
    reader.SetColorMode(True)
    reader.SetNameMode(True)
    reader.SetLayerMode(True)
    status = reader.ReadFile(str(path))
    if status != IFSelect_RetDone:
        raise RuntimeError(f"OCP STEP reader failed with status {status}")
    if not reader.Transfer(doc):
        raise RuntimeError("OCP STEP transfer failed.")

    shape_tool = XCAFDoc_DocumentTool.ShapeTool_s(doc.Main())
    color_tool = XCAFDoc_DocumentTool.ColorTool_s(doc.Main())
    tree_lines: list[str] = [f"STEP: {path}"]
    log_lines: list[str] = ["OCP/XCAF STEP reader active.", f"Read status: {status}"]
    bodies: list[Body] = []
    free = TDF_LabelSequence()
    shape_tool.GetFreeShapes(free)
    log_lines.append(f"Free root shapes: {free.Length()}")

    def label_name(label) -> str:
        attr = TDataStd_Name()
        if label.FindAttribute(TDataStd_Name.GetID_s(), attr):
            value = attr.Get().ToExtString()
            if value:
                return str(value)
        return f"label-{label.Tag()}"

    def target_label(label):
        if shape_tool.IsReference_s(label):
            referred = TDF_Label()
            if shape_tool.GetReferredShape_s(label, referred):
                return referred
        return label

    def label_color(label, target) -> str:
        for candidate in (label, target):
            for color_type in (XCAFDoc_ColorType.XCAFDoc_ColorSurf, XCAFDoc_ColorType.XCAFDoc_ColorGen):
                color = Quantity_Color()
                try:
                    if color_tool.GetColor(candidate, color_type, color):
                        return f"rgb({color.Red():.3f},{color.Green():.3f},{color.Blue():.3f})"
                except Exception:
                    continue
        return ""

    def solid_shapes(shape) -> list[object]:
        explorer = TopExp_Explorer(shape, TopAbs_SOLID)
        solids = []
        while explorer.More():
            solids.append(explorer.Current())
            explorer.Next()
        return solids

    def visit(label, depth: int, hierarchy: list[str]) -> None:
        name = label_name(label)
        target = target_label(label)
        target_name = label_name(target)
        path_parts = [*hierarchy, name]
        shape = shape_tool.GetShape_s(target)
        indent = "  " * depth
        solids = [] if shape.IsNull() else solid_shapes(shape)
        tree_lines.append(
            f"{indent}- {name} | target={target_name} | assembly={shape_tool.IsAssembly_s(target)} "
            f"| component={shape_tool.IsComponent_s(label)} | solids={len(solids)}"
        )

        components = TDF_LabelSequence()
        has_components = shape_tool.GetComponents_s(target, components, False)
        if has_components and components.Length():
            for index in range(1, components.Length() + 1):
                visit(components.Value(index), depth + 1, path_parts)
            return

        for solid_index, solid in enumerate(solids, start=1):
            body_name = name if len(solids) == 1 else f"{name} solid {solid_index}"
            body = _body_from_cq_shape(
                cq.Shape.cast(solid),
                path,
                len(bodies) + 1,
                body_name,
                "/" + "/".join(path_parts),
                "OCP XCAF + CadQuery tessellation",
                label_color(label, target),
            )
            bodies.append(body)

    for index in range(1, free.Length() + 1):
        visit(free.Value(index), 0, [])

    return StepInspection(path=path, bodies=bodies, tree_lines=tree_lines, log_lines=log_lines, used_kernel="OCP/CadQuery")


def _body_from_cq_shape(shape, source: Path, index: int, name: str, hierarchy_path: str, importer: str, color: str = "") -> Body:
    bbox = shape.BoundingBox()
    bbox_tuple = (bbox.xmin, bbox.ymin, bbox.zmin, bbox.xmax, bbox.ymax, bbox.zmax)
    volume = float(shape.Volume())
    face_count = len(shape.Faces())
    mesh_vertices: list[tuple[float, float, float]] = []
    mesh_triangles: list[tuple[int, int, int]] = []
    tessellation_status = "placeholder bbox fallback"
    try:
        vertices, triangles = shape.tessellate(0.75)
        mesh_vertices = [(float(vertex.x), float(vertex.y), float(vertex.z)) for vertex in vertices]
        mesh_triangles = [(int(a), int(b), int(c)) for a, b, c in triangles]
        tessellation_status = f"tessellated {len(mesh_vertices)} vertices / {len(mesh_triangles)} triangles"
    except Exception as exc:
        tessellation_status = f"tessellation failed; using bbox fallback: {exc}"

    role = _classify_from_metadata(name, volume, bbox_tuple)
    return Body(
        id=f"step-{index:03d}",
        name=name,
        role=role,
        material=_default_material(role),
        initial_temperature_c={"mold": 35.0, "plastic": 220.0, "water": 22.0, "ignored": 25.0}[role],
        bbox_mm=bbox_tuple,
        volume_mm3=volume,
        source=str(source),
        hierarchy_path=hierarchy_path,
        face_count=face_count,
        color=color,
        tessellation_status=tessellation_status,
        mesh_vertices=mesh_vertices,
        mesh_triangles=mesh_triangles,
        metadata={"importer": importer},
    )


def _inspect_with_text_fallback(path: Path, error: str) -> StepInspection:
    from app.geometry.step_importer import _extract_body_names, _synthetic_bbox

    text = path.read_text(encoding="utf-8", errors="ignore")
    names = _extract_body_names(text)
    bodies: list[Body] = []
    for index, name in enumerate(names, start=1):
        role = default_role_for_name(name)
        bbox, volume = _synthetic_bbox(index, role, len(names))
        bodies.append(
            Body(
                id=f"step-{index:03d}",
                name=name,
                role=role,
                material=_default_material(role),
                initial_temperature_c={"mold": 35.0, "plastic": 220.0, "water": 22.0, "ignored": 25.0}[role],
                bbox_mm=bbox,
                volume_mm3=volume,
                source=str(path),
                hierarchy_path=f"/Text fallback/{name}",
                face_count=0,
                tessellation_status="placeholder bbox fallback; CAD kernel unavailable",
                metadata={"importer": "ascii-step-body-index"},
            )
        )
    return StepInspection(
        path=path,
        bodies=bodies,
        tree_lines=[f"STEP: {path}", "OCP/CadQuery inspection failed; text fallback used.", *[f"- {name}" for name in names]],
        warnings=[f"CAD kernel inspection failed: {error}"],
        log_lines=[f"CAD kernel inspection failed: {error}", f"Text fallback detected {len(bodies)} bodies."],
        used_kernel="text fallback",
    )


def _classify_from_metadata(
    name: str,
    volume_mm3: float,
    bbox: tuple[float, float, float, float, float, float],
) -> str:
    role = default_role_for_name(name)
    if role != "ignored":
        return role
    text = name.lower()
    if "main half water" in text or "secondary half water" in text:
        return "water"
    if "injected" in text:
        return "plastic"
    if "half" in text or volume_mm3 > 50_000:
        return "mold"
    x0, y0, z0, x1, y1, z1 = bbox
    slender = min(max(x1 - x0, 1.0), max(y1 - y0, 1.0), max(z1 - z0, 1.0))
    longest = max(x1 - x0, y1 - y0, z1 - z0, 1.0)
    if longest / slender > 8 and volume_mm3 < 20_000:
        return "water"
    return "ignored"


def _add_domain_warning(inspection: StepInspection) -> None:
    if not inspection.bodies:
        inspection.warnings.append(
            "No solid bodies were detected. Re-export the STEP with solid geometry and preserve separate bodies/components."
        )
    elif len(inspection.bodies) <= 2:
        inspection.warnings.append(
            "Only 1-2 solid bodies were detected. If this mold should contain mold halves, water volumes, "
            "and injected plastic separately, re-export STEP with those as separate bodies/components and preserve names."
        )
    roles = {body.role for body in inspection.bodies}
    missing = [role for role in ("mold", "plastic", "water") if role not in roles]
    if missing:
        inspection.warnings.append(
            "Automatic classification did not find all expected domains: " + ", ".join(missing) + ". User classification remains authoritative."
        )


def _write_diagnostics(inspection: StepInspection, output: Path) -> None:
    (output / "step_tree.txt").write_text("\n".join(inspection.tree_lines) + "\n", encoding="utf-8")
    log_lines = [
        f"STEP path: {inspection.path}",
        f"Kernel: {inspection.used_kernel}",
        f"Detected bodies: {len(inspection.bodies)}",
        "",
        "Warnings:",
        *[f"- {warning}" for warning in inspection.warnings],
        "",
        "Log:",
        *inspection.log_lines,
    ]
    (output / "step_import_log.txt").write_text("\n".join(log_lines) + "\n", encoding="utf-8")
    with (output / "step_bodies.csv").open("w", newline="", encoding="utf-8-sig") as handle:
        fieldnames = [
            "internal_id",
            "name",
            "role_guess",
            "source_hierarchy_path",
            "volume_mm3",
            "bounding_box_mm",
            "face_count",
            "color",
            "tessellation_status",
        ]
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for body in inspection.bodies:
            writer.writerow(
                {
                    "internal_id": body.id,
                    "name": body.name,
                    "role_guess": body.role,
                    "source_hierarchy_path": body.hierarchy_path,
                    "volume_mm3": body.volume_mm3,
                    "bounding_box_mm": body.bbox_mm,
                    "face_count": body.face_count,
                    "color": body.color,
                    "tessellation_status": body.tessellation_status,
                }
            )


def _default_material(role: str) -> str:
    return {
        "mold": "P20 steel",
        "plastic": "PP",
        "water": "Water",
        "ignored": "Unassigned",
    }[role]
