from __future__ import annotations

import os
from dataclasses import dataclass

import psutil


@dataclass(frozen=True, slots=True)
class SystemResources:
    logical_threads: int
    physical_cores: int
    total_ram_gb: float
    available_ram_gb: float
    gpu_summary: str


def detect_resources() -> SystemResources:
    vm = psutil.virtual_memory()
    return SystemResources(
        logical_threads=os.cpu_count() or 1,
        physical_cores=psutil.cpu_count(logical=False) or os.cpu_count() or 1,
        total_ram_gb=vm.total / (1024**3),
        available_ram_gb=vm.available / (1024**3),
        gpu_summary=_detect_gpu_summary(),
    )


def recommended_workers(mode: str, aggressive_max: bool = False) -> int:
    resources = detect_resources()
    logical = max(1, resources.logical_threads)
    if mode == "background":
        return max(1, min(resources.physical_cores, logical // 2))
    if mode == "high":
        return max(1, logical - 1)
    if mode == "max":
        return logical if aggressive_max else max(1, logical - 1)
    return max(1, min(resources.physical_cores, max(1, logical - 2)))


def apply_process_controls(priority: str = "normal", affinity_count: int | None = None) -> str:
    process = psutil.Process()
    messages: list[str] = []
    priority_map = {
        "background": psutil.IDLE_PRIORITY_CLASS,
        "normal": psutil.NORMAL_PRIORITY_CLASS,
        "high": psutil.HIGH_PRIORITY_CLASS,
    }
    try:
        process.nice(priority_map.get(priority, psutil.NORMAL_PRIORITY_CLASS))
        messages.append(f"Priority set to {priority}.")
    except Exception as exc:
        messages.append(f"Priority unchanged: {exc}")

    if affinity_count:
        try:
            available = process.cpu_affinity()
            process.cpu_affinity(available[: max(1, min(affinity_count, len(available)))])
            messages.append(f"CPU affinity limited to {len(process.cpu_affinity())} logical CPUs.")
        except Exception as exc:
            messages.append(f"CPU affinity unchanged: {exc}")
    return " ".join(messages)


def live_usage() -> dict[str, float]:
    vm = psutil.virtual_memory()
    return {
        "cpu_percent": psutil.cpu_percent(interval=None),
        "ram_percent": vm.percent,
        "available_ram_gb": vm.available / (1024**3),
    }


def _detect_gpu_summary() -> str:
    try:
        import subprocess

        output = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name"],
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=3,
        )
        names = [line.strip() for line in output.splitlines() if line.strip()]
        return ", ".join(names[:3]) if names else "Not detected"
    except Exception:
        return "Not detected"
