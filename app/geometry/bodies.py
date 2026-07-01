from __future__ import annotations

from dataclasses import dataclass, field
from typing import Literal

BodyRole = Literal["mold", "plastic", "water", "ignored"]


@dataclass(slots=True)
class Body:
    id: str
    name: str
    role: BodyRole = "ignored"
    material: str = "Unassigned"
    initial_temperature_c: float = 25.0
    bbox_mm: tuple[float, float, float, float, float, float] = (0, 0, 0, 10, 10, 10)
    volume_mm3: float = 1000.0
    source: str = "step"
    hierarchy_path: str = ""
    face_count: int = 0
    color: str = ""
    tessellation_status: str = "placeholder"
    mesh_vertices: list[tuple[float, float, float]] = field(default_factory=list)
    mesh_triangles: list[tuple[int, int, int]] = field(default_factory=list)
    metadata: dict[str, str] = field(default_factory=dict)

    @property
    def center_mm(self) -> tuple[float, float, float]:
        x0, y0, z0, x1, y1, z1 = self.bbox_mm
        return ((x0 + x1) * 0.5, (y0 + y1) * 0.5, (z0 + z1) * 0.5)

    @property
    def size_mm(self) -> tuple[float, float, float]:
        x0, y0, z0, x1, y1, z1 = self.bbox_mm
        return (max(1.0, x1 - x0), max(1.0, y1 - y0), max(1.0, z1 - z0))

    def as_dict(self) -> dict[str, object]:
        return {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "material": self.material,
            "initial_temperature_c": self.initial_temperature_c,
            "bbox_mm": self.bbox_mm,
            "volume_mm3": self.volume_mm3,
            "source": self.source,
            "hierarchy_path": self.hierarchy_path,
            "face_count": self.face_count,
            "color": self.color,
            "tessellation_status": self.tessellation_status,
            "metadata": self.metadata,
        }


def default_role_for_name(name: str) -> BodyRole:
    text = name.lower()
    if any(token in text for token in ("water", "cool", "channel", "fluid")):
        return "water"
    if any(token in text for token in ("plastic", "part", "injected", "polymer", "melt")):
        return "plastic"
    if any(token in text for token in ("mold", "mould", "half", "steel", "core", "cavity")):
        return "mold"
    return "ignored"


def demo_bodies() -> list[Body]:
    bodies = [
        Body(
            id="body-001",
            name="mold half A",
            role="mold",
            material="P20 steel",
            initial_temperature_c=35.0,
            bbox_mm=(-45, -35, -16, 45, 35, 0),
            volume_mm3=90 * 70 * 16,
            source="demo",
            hierarchy_path="/Demo/mold half A",
            face_count=6,
            tessellation_status="placeholder demo box",
        ),
        Body(
            id="body-002",
            name="mold half B",
            role="mold",
            material="P20 steel",
            initial_temperature_c=35.0,
            bbox_mm=(-45, -35, 0, 45, 35, 16),
            volume_mm3=90 * 70 * 16,
            source="demo",
            hierarchy_path="/Demo/mold half B",
            face_count=6,
            tessellation_status="placeholder demo box",
        ),
        Body(
            id="body-003",
            name="injected plastic body",
            role="plastic",
            material="PP",
            initial_temperature_c=220.0,
            bbox_mm=(-23, -12, -3, 23, 12, 3),
            volume_mm3=46 * 24 * 6,
            source="demo",
            hierarchy_path="/Demo/injected plastic body",
            face_count=6,
            tessellation_status="placeholder demo box",
        ),
        Body(
            id="body-004",
            name="water body - cooling channel left",
            role="water",
            material="Water",
            initial_temperature_c=22.0,
            bbox_mm=(-36, -29, -7, -30, 29, 7),
            volume_mm3=6 * 58 * 14,
            source="demo",
            hierarchy_path="/Demo/water body - cooling channel left",
            face_count=6,
            tessellation_status="placeholder demo box",
        ),
        Body(
            id="body-005",
            name="water body - cooling channel right",
            role="water",
            material="Water",
            initial_temperature_c=22.0,
            bbox_mm=(30, -29, -7, 36, 29, 7),
            volume_mm3=6 * 58 * 14,
            source="demo",
            hierarchy_path="/Demo/water body - cooling channel right",
            face_count=6,
            tessellation_status="placeholder demo box",
        ),
    ]
    return bodies
