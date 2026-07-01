from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from app.simulation.backends import BackendMode
from app.simulation.resources import SystemResources, detect_resources


@dataclass(frozen=True, slots=True)
class ResourceProfile:
    name: str
    selected_mode: str
    cpu_workers: int
    logical_threads_available: int
    logical_threads_reserved: int
    ram_cap_gb: float
    min_free_ram_gb: float
    emergency_free_ram_gb: float
    aggressive_ram_cap_gb: float
    vram_cap_gb: float
    vram_reserved_gb: float
    cache_output_path: str
    process_priority: str
    backend_mode: BackendMode
    gpu_enabled: bool
    cpu_affinity_workers: int
    notes: str


PRESET_BACKGROUND = "Background"
PRESET_NORMAL = "Normal"
PRESET_HEAVY = "Heavy"
PRESET_HYBRID_STEFAN = "Hybrid MAX - Stefan Workstation"
PRESET_HYBRID_STEFAN_RO = "Hybrid MAX - Ștefan Workstation"
PRESET_CUSTOM = "Custom"

PRESET_LABELS = [
    PRESET_BACKGROUND,
    PRESET_NORMAL,
    PRESET_HEAVY,
    PRESET_HYBRID_STEFAN_RO,
    PRESET_CUSTOM,
]


def get_resource_profile(name: str, resources: SystemResources | None = None) -> ResourceProfile:
    resources = resources or detect_resources()
    logical = max(1, resources.logical_threads)
    physical = max(1, resources.physical_cores)
    normalized = _normalize_name(name)
    cache_path = str(_default_cache_output_path())

    if normalized == PRESET_BACKGROUND:
        workers = max(1, min(physical // 2, logical // 2))
        return ResourceProfile(
            name=PRESET_BACKGROUND,
            selected_mode="background",
            cpu_workers=workers,
            logical_threads_available=logical,
            logical_threads_reserved=max(1, logical - workers),
            ram_cap_gb=max(1.0, min(resources.available_ram_gb * 0.35, resources.total_ram_gb * 0.35)),
            min_free_ram_gb=8.0,
            emergency_free_ram_gb=4.0,
            aggressive_ram_cap_gb=max(1.0, resources.total_ram_gb * 0.5),
            vram_cap_gb=0.0,
            vram_reserved_gb=2.0,
            cache_output_path=cache_path,
            process_priority="background",
            backend_mode=BackendMode.CPU_SAFE,
            gpu_enabled=False,
            cpu_affinity_workers=workers,
            notes="Conservative mode for working in parallel with other desktop tasks.",
        )

    if normalized == PRESET_HEAVY:
        workers = max(1, min(logical - 2, physical + max(1, physical // 2)))
        return ResourceProfile(
            name=PRESET_HEAVY,
            selected_mode="heavy",
            cpu_workers=workers,
            logical_threads_available=logical,
            logical_threads_reserved=max(1, logical - workers),
            ram_cap_gb=max(2.0, min(resources.available_ram_gb * 0.75, resources.total_ram_gb - 8.0)),
            min_free_ram_gb=8.0,
            emergency_free_ram_gb=4.0,
            aggressive_ram_cap_gb=max(2.0, resources.total_ram_gb - 4.0),
            vram_cap_gb=0.0,
            vram_reserved_gb=2.0,
            cache_output_path=cache_path,
            process_priority="normal",
            backend_mode=BackendMode.CPU_MAX,
            gpu_enabled=False,
            cpu_affinity_workers=workers,
            notes="High CPU mode with desktop responsiveness reserve.",
        )

    if normalized == PRESET_HYBRID_STEFAN:
        logical_budget = min(28, max(1, logical - 4))
        workers = min(26, max(1, logical_budget - 2))
        ram_cap = 56.0 if resources.total_ram_gb >= 60.0 else max(1.0, resources.total_ram_gb - 8.0)
        aggressive_cap = 60.0 if resources.total_ram_gb >= 60.0 else max(ram_cap, resources.total_ram_gb - 4.0)
        return ResourceProfile(
            name=PRESET_HYBRID_STEFAN_RO,
            selected_mode="hybrid_max_stefan",
            cpu_workers=workers,
            logical_threads_available=logical,
            logical_threads_reserved=max(4, logical - logical_budget),
            ram_cap_gb=ram_cap,
            min_free_ram_gb=8.0,
            emergency_free_ram_gb=4.0,
            aggressive_ram_cap_gb=aggressive_cap,
            vram_cap_gb=14.0,
            vram_reserved_gb=2.0,
            cache_output_path=cache_path,
            process_priority="normal",
            backend_mode=BackendMode.HYBRID_MAX_STEFAN,
            gpu_enabled=True,
            cpu_affinity_workers=logical_budget,
            notes=(
                "Stefan workstation target: Ryzen 9 9950X, 32 logical threads, 64 GB RAM, "
                "RX 9070 XT 16 GB VRAM. Reserves 4 logical threads, 8 GB RAM by default, "
                "and never intentionally drops below 4 GB free RAM."
            ),
        )

    workers = max(1, min(physical, max(1, logical - 4)))
    return ResourceProfile(
        name=PRESET_NORMAL if normalized != PRESET_CUSTOM else PRESET_CUSTOM,
        selected_mode="normal" if normalized != PRESET_CUSTOM else "custom",
        cpu_workers=workers,
        logical_threads_available=logical,
        logical_threads_reserved=max(1, logical - workers),
        ram_cap_gb=max(1.0, min(resources.available_ram_gb * 0.6, resources.total_ram_gb - 8.0)),
        min_free_ram_gb=8.0,
        emergency_free_ram_gb=4.0,
        aggressive_ram_cap_gb=max(1.0, resources.total_ram_gb - 4.0),
        vram_cap_gb=0.0,
        vram_reserved_gb=2.0,
        cache_output_path=cache_path,
        process_priority="normal",
        backend_mode=BackendMode.CPU_SAFE,
        gpu_enabled=False,
        cpu_affinity_workers=workers,
        notes="Balanced default profile.",
    )


def enforce_worker_limits(profile: ResourceProfile, requested_workers: int, ram_cap_gb: float | None = None) -> int:
    ram_cap = ram_cap_gb if ram_cap_gb is not None else profile.ram_cap_gb
    ram_limited = max(1, int(ram_cap / 0.25))
    return max(1, min(int(requested_workers), profile.cpu_affinity_workers, ram_limited))


def _normalize_name(name: str) -> str:
    return PRESET_HYBRID_STEFAN if name in {PRESET_HYBRID_STEFAN, PRESET_HYBRID_STEFAN_RO} else name


def _default_cache_output_path() -> Path:
    return Path.cwd() / "outputs"
