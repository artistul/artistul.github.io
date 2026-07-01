from __future__ import annotations

from typing import Mapping

from matplotlib import colormaps
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

from app.geometry.bodies import Body

ROLE_COLORS = {
    "mold": "#6b7280",
    "plastic": "#e11d48",
    "water": "#0284c7",
    "ignored": "#d1d5db",
}


class MoldFigureCanvas(FigureCanvas):
    def __init__(self) -> None:
        self.figure = Figure(figsize=(6, 5), dpi=100)
        super().__init__(self.figure)
        self.axes = self.figure.add_subplot(111, projection="3d")
        self._mesh_face_cache: dict[tuple[int, int, int, int, int], list[list[tuple[float, float, float]]]] = {}
        self.figure.subplots_adjust(left=0.02, right=0.98, bottom=0.04, top=0.94)

    def draw_bodies(self, bodies: list[Body], temperatures: Mapping[str, float] | None = None) -> None:
        self.axes.cla()
        temps = list(temperatures.values()) if temperatures else []
        tmin = min(temps) if temps else 20.0
        tmax = max(temps) if temps else 220.0
        cmap = colormaps["inferno"]
        mesh_body_count = sum(1 for body in bodies if body.mesh_vertices and body.mesh_triangles)
        triangle_budget = max(1000, min(4500, 18000 // max(1, mesh_body_count)))
        for body in bodies:
            if temperatures and body.id in temperatures:
                span = max(1e-9, tmax - tmin)
                color = cmap((temperatures[body.id] - tmin) / span)
            else:
                color = ROLE_COLORS.get(body.role, "#d1d5db")
            if body.mesh_vertices and body.mesh_triangles:
                self._add_mesh(body.mesh_vertices, body.mesh_triangles, color, body.name, body.center_mm, triangle_budget)
            else:
                self._add_box(body.bbox_mm, color, body.name)
        self.axes.set_xlabel("X mm")
        self.axes.set_ylabel("Y mm")
        self.axes.set_zlabel("Z mm")
        self.axes.set_title("Imported assembly / temperature field")
        self.axes.set_proj_type("ortho")
        self.axes.view_init(elev=24, azim=-55)
        self._autoscale(bodies)
        self.draw_idle()

    def save_screenshot(self, path: str) -> None:
        self.figure.savefig(path, dpi=160)

    def _add_box(self, bbox: tuple[float, float, float, float, float, float], color: object, label: str) -> None:
        x0, y0, z0, x1, y1, z1 = bbox
        vertices = [
            [(x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0)],
            [(x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)],
            [(x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1)],
            [(x0, y1, z0), (x1, y1, z0), (x1, y1, z1), (x0, y1, z1)],
            [(x0, y0, z0), (x0, y1, z0), (x0, y1, z1), (x0, y0, z1)],
            [(x1, y0, z0), (x1, y1, z0), (x1, y1, z1), (x1, y0, z1)],
        ]
        collection = Poly3DCollection(vertices, alpha=0.58, facecolor=color, edgecolor="#111827", linewidth=0.45)
        self.axes.add_collection3d(collection)
        cx, cy, cz = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
        self.axes.text(cx, cy, cz, label[:18], fontsize=7)

    def _add_mesh(
        self,
        vertices: list[tuple[float, float, float]],
        triangles: list[tuple[int, int, int]],
        color: object,
        label: str,
        center: tuple[float, float, float],
        triangle_budget: int,
    ) -> None:
        faces = self._preview_faces(vertices, triangles, triangle_budget)
        collection = Poly3DCollection(faces, alpha=0.50, facecolor=color, edgecolor="none", linewidth=0.0)
        self.axes.add_collection3d(collection)
        self.axes.text(center[0], center[1], center[2], label[:18], fontsize=7)

    def _preview_faces(
        self,
        vertices: list[tuple[float, float, float]],
        triangles: list[tuple[int, int, int]],
        triangle_budget: int,
    ) -> list[list[tuple[float, float, float]]]:
        key = (id(vertices), id(triangles), len(vertices), len(triangles), triangle_budget)
        cached = self._mesh_face_cache.get(key)
        if cached is not None:
            return cached
        preview_triangles = triangles
        if len(triangles) > triangle_budget:
            stride = max(1, len(triangles) // triangle_budget)
            preview_triangles = triangles[::stride]
        faces = [[vertices[a], vertices[b], vertices[c]] for a, b, c in preview_triangles]
        if len(self._mesh_face_cache) > 64:
            self._mesh_face_cache.clear()
        self._mesh_face_cache[key] = faces
        return faces

    def _autoscale(self, bodies: list[Body]) -> None:
        if not bodies:
            return
        xs, ys, zs = [], [], []
        for body in bodies:
            x0, y0, z0, x1, y1, z1 = body.bbox_mm
            xs.extend([x0, x1])
            ys.extend([y0, y1])
            zs.extend([z0, z1])
        max_range = max(max(xs) - min(xs), max(ys) - min(ys), max(zs) - min(zs), 1.0)
        cx = (max(xs) + min(xs)) / 2
        cy = (max(ys) + min(ys)) / 2
        cz = (max(zs) + min(zs)) / 2
        radius = max_range * 0.58
        self.axes.set_xlim(cx - radius, cx + radius)
        self.axes.set_ylim(cy - radius, cy + radius)
        self.axes.set_zlim(cz - radius, cz + radius)
