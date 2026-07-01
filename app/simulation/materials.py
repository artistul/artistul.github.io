from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Material:
    name: str
    density_kg_m3: float
    specific_heat_j_kgk: float
    conductivity_w_mk: float


MATERIALS: dict[str, Material] = {
    "P20 steel": Material("P20 steel", 7850.0, 460.0, 29.0),
    "Tool steel": Material("Tool steel", 7800.0, 470.0, 25.0),
    "Aluminum": Material("Aluminum", 2700.0, 900.0, 170.0),
    "PP": Material("PP", 900.0, 1900.0, 0.22),
    "ABS": Material("ABS", 1040.0, 1500.0, 0.18),
    "PLA": Material("PLA", 1240.0, 1800.0, 0.13),
    "Water": Material("Water", 997.0, 4180.0, 0.60),
    "Unassigned": Material("Unassigned", 1000.0, 1000.0, 1.0),
}


def get_material(name: str) -> Material:
    return MATERIALS.get(name, MATERIALS["Unassigned"])
