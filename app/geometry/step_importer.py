from __future__ import annotations

import re
from pathlib import Path

from app.geometry.bodies import Body, default_role_for_name, demo_bodies

BODY_PATTERNS = [
    re.compile(r"MANIFOLD_SOLID_BREP\s*\(\s*'([^']*)'", re.IGNORECASE),
    re.compile(r"BREP_WITH_VOIDS\s*\(\s*'([^']*)'", re.IGNORECASE),
    re.compile(r"ADVANCED_BREP_SHAPE_REPRESENTATION\s*\(\s*'([^']*)'", re.IGNORECASE),
    re.compile(r"/\*\s*BODY\s*:\s*([^*]+?)\s*\*/", re.IGNORECASE),
]
PRODUCT_PATTERN = re.compile(r"PRODUCT\s*\(\s*'([^']*)'", re.IGNORECASE)


class StepImportError(RuntimeError):
    pass


def import_step(path: str | Path) -> list[Body]:
    step_path = Path(path)
    if not step_path.exists():
        raise StepImportError(f"STEP file not found: {step_path}")

    text = step_path.read_text(encoding="utf-8", errors="ignore")
    names = _extract_body_names(text)
    if not names:
        raise StepImportError(
            "No separate STEP bodies were detected. Export as STEP AP214/AP242 with named solids, "
            "or use the demo geometry while the CAD kernel importer is extended."
        )

    bodies: list[Body] = []
    for index, name in enumerate(names, start=1):
        role = default_role_for_name(name)
        material = _default_material(role)
        initial = {"mold": 35.0, "plastic": 220.0, "water": 22.0, "ignored": 25.0}[role]
        bbox, volume = _synthetic_bbox(index, role, len(names))
        bodies.append(
            Body(
                id=f"step-{index:03d}",
                name=name,
                role=role,
                material=material,
                initial_temperature_c=initial,
                bbox_mm=bbox,
                volume_mm3=volume,
                source=str(step_path),
                metadata={"importer": "ascii-step-body-index"},
            )
        )
    return bodies


def load_demo_geometry() -> list[Body]:
    return demo_bodies()


def _extract_body_names(text: str) -> list[str]:
    raw: list[str] = []
    for pattern in BODY_PATTERNS:
        raw.extend(match.group(1).strip() for match in pattern.finditer(text))

    if not raw:
        raw.extend(match.group(1).strip() for match in PRODUCT_PATTERN.finditer(text))

    names: list[str] = []
    seen: set[str] = set()
    for item in raw:
        name = _clean_name(item)
        key = name.lower()
        if not name or key in seen or key in {"", "default", "none", "assembly"}:
            continue
        seen.add(key)
        names.append(name)
    return names


def _clean_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.replace("\\X2\\", "").replace("\\X0\\", "")).strip(" '\"\t\r\n")


def _default_material(role: str) -> str:
    return {
        "mold": "P20 steel",
        "plastic": "PP",
        "water": "Water",
        "ignored": "Unassigned",
    }[role]


def _synthetic_bbox(index: int, role: str, total: int) -> tuple[tuple[float, float, float, float, float, float], float]:
    if role == "mold":
        z0 = -18 if index % 2 else 0
        z1 = 0 if index % 2 else 18
        bbox = (-50, -38, z0, 50, 38, z1)
    elif role == "plastic":
        bbox = (-24, -13, -4, 24, 13, 4)
    elif role == "water":
        offset = -32 if index % 2 else 32
        bbox = (offset - 3, -30, -8, offset + 3, 30, 8)
    else:
        x = (index - (total + 1) / 2) * 18
        bbox = (x - 6, -6, -6, x + 6, 6, 6)
    x0, y0, z0, x1, y1, z1 = bbox
    volume = max(1.0, (x1 - x0) * (y1 - y0) * (z1 - z0))
    return bbox, volume
