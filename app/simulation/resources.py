from __future__ import annotations

import os
import subprocess
from functools import lru_cache
from dataclasses import dataclass
from pathlib import Path

import psutil


@dataclass(frozen=True, slots=True)
class SystemResources:
    logical_threads: int
    physical_cores: int
    total_ram_gb: float
    available_ram_gb: float
    gpu_summary: str


@dataclass(frozen=True, slots=True)
class GpuTelemetry:
    name: str
    vram_total_gb: float | None
    vram_used_gb: float | None
    telemetry_available: bool
    message: str


@dataclass(frozen=True, slots=True)
class ResourceSnapshot:
    cpu_percent: float
    app_cpu_percent: float
    ram_percent: float
    ram_used_gb: float
    ram_free_gb: float
    app_ram_gb: float
    workers_active: int
    active_jobs: int
    completed_jobs: int
    simulations_per_minute: float
    disk_free_gb: float
    disk_used_percent: float
    gpu: GpuTelemetry
    throttle_state: str
    throttle_reason: str


@dataclass(frozen=True, slots=True)
class ResourceLimits:
    ram_cap_gb: float
    aggressive_ram_cap_gb: float
    min_free_ram_gb: float
    emergency_free_ram_gb: float
    vram_cap_gb: float
    cache_output_path: str


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


def apply_process_controls(
    priority: str = "normal",
    affinity_count: int | None = None,
    reserve_logical_threads: int = 0,
) -> str:
    process = psutil.Process()
    messages: list[str] = []
    priority_map = {
        "background": psutil.IDLE_PRIORITY_CLASS,
        "below_normal": psutil.BELOW_NORMAL_PRIORITY_CLASS,
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
            reserve = max(0, int(reserve_logical_threads))
            usable = available[reserve:] if len(available) > reserve else available
            process.cpu_affinity(usable[: max(1, min(affinity_count, len(usable)))])
            messages.append(f"CPU affinity limited to {len(process.cpu_affinity())} logical CPUs.")
            if reserve:
                messages.append(f"Logical CPU reserve strategy kept the first {reserve} threads available to Windows/GUI.")
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


def sample_resource_snapshot(
    limits: ResourceLimits,
    workers_active: int = 0,
    active_jobs: int = 0,
    completed_jobs: int = 0,
    simulations_per_minute: float = 0.0,
) -> ResourceSnapshot:
    process = psutil.Process()
    vm = psutil.virtual_memory()
    try:
        disk = psutil.disk_usage(str(Path(limits.cache_output_path).resolve().anchor or Path.cwd().anchor))
    except Exception:
        disk = psutil.disk_usage(str(Path.cwd().anchor))
    app_ram_gb = process.memory_info().rss / (1024**3)
    gpu = sample_gpu_telemetry()
    throttle_state, throttle_reason = evaluate_throttle(limits, vm.available / (1024**3), app_ram_gb, gpu)
    return ResourceSnapshot(
        cpu_percent=psutil.cpu_percent(interval=None),
        app_cpu_percent=process.cpu_percent(interval=None),
        ram_percent=vm.percent,
        ram_used_gb=vm.used / (1024**3),
        ram_free_gb=vm.available / (1024**3),
        app_ram_gb=app_ram_gb,
        workers_active=workers_active,
        active_jobs=active_jobs,
        completed_jobs=completed_jobs,
        simulations_per_minute=simulations_per_minute,
        disk_free_gb=disk.free / (1024**3),
        disk_used_percent=disk.percent,
        gpu=gpu,
        throttle_state=throttle_state,
        throttle_reason=throttle_reason,
    )


def evaluate_throttle(limits: ResourceLimits, free_ram_gb: float, app_ram_gb: float, gpu: GpuTelemetry | None = None) -> tuple[str, str]:
    if free_ram_gb < limits.emergency_free_ram_gb:
        return "EMERGENCY_PAUSE", f"Free RAM {free_ram_gb:.1f} GB is below emergency minimum {limits.emergency_free_ram_gb:.1f} GB."
    if app_ram_gb >= limits.aggressive_ram_cap_gb:
        return "EMERGENCY_PAUSE", f"Estimated app RAM {app_ram_gb:.1f} GB reached aggressive cap {limits.aggressive_ram_cap_gb:.1f} GB."
    if free_ram_gb < limits.min_free_ram_gb:
        return "THROTTLE", f"Free RAM {free_ram_gb:.1f} GB is below reserve {limits.min_free_ram_gb:.1f} GB."
    if app_ram_gb >= limits.ram_cap_gb:
        return "THROTTLE", f"Estimated app RAM {app_ram_gb:.1f} GB reached RAM cap {limits.ram_cap_gb:.1f} GB."
    if gpu and gpu.telemetry_available and gpu.vram_used_gb is not None and gpu.vram_used_gb >= limits.vram_cap_gb:
        return "GPU_THROTTLE", f"VRAM usage {gpu.vram_used_gb:.1f} GB reached cap {limits.vram_cap_gb:.1f} GB."
    return "OK", "No throttling active."


def sample_gpu_telemetry() -> GpuTelemetry:
    summary = _detect_gpu_summary()
    total = _detect_adapter_ram_gb()
    return GpuTelemetry(
        name=summary,
        vram_total_gb=total,
        vram_used_gb=None,
        telemetry_available=False,
        message="AMD VRAM usage telemetry is not available through the current offline monitor; GPU usage is not estimated.",
    )


def _subprocess_creationflags() -> int:
    return getattr(subprocess, "CREATE_NO_WINDOW", 0)


def _run_hidden_powershell(command: str, timeout: float = 3.0) -> str:
    return subprocess.check_output(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", command],
        stderr=subprocess.DEVNULL,
        stdin=subprocess.DEVNULL,
        text=True,
        timeout=timeout,
        creationflags=_subprocess_creationflags(),
    )


@lru_cache(maxsize=1)
def _detect_gpu_summary() -> str:
    try:
        output = _run_hidden_powershell(
            "Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name",
        )
        names = [line.strip() for line in output.splitlines() if line.strip()]
        return ", ".join(names[:3]) if names else "Not detected"
    except Exception:
        return "Not detected"


@lru_cache(maxsize=1)
def _detect_adapter_ram_gb() -> float | None:
    try:
        output = _run_hidden_powershell(
            "Get-CimInstance Win32_VideoController | Select-Object -First 1 -ExpandProperty AdapterRAM",
        ).strip()
        if not output:
            return None
        return int(output) / (1024**3)
    except Exception:
        return None
