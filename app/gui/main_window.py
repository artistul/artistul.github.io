from __future__ import annotations

from pathlib import Path
from threading import Event
from time import perf_counter

from PySide6.QtCore import QThread, QTimer, Signal
from PySide6.QtWidgets import (
    QApplication,
    QCheckBox,
    QComboBox,
    QDoubleSpinBox,
    QFileDialog,
    QFormLayout,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QPushButton,
    QProgressBar,
    QSpinBox,
    QSplitter,
    QTableWidget,
    QTableWidgetItem,
    QTabWidget,
    QTextEdit,
    QVBoxLayout,
    QWidget,
)

from app.geometry.bodies import Body
from app.geometry.step_importer import StepImportError, import_step, load_demo_geometry
from app.optimization.sweep import SweepConfig, run_sweep
from app.reporting.exporter import create_session_dir, export_simulation, export_sweep
from app.simulation.backends import BackendMode, BackendSelection, run_simulation_backend
from app.simulation.profiles import PRESET_LABELS, PRESET_CUSTOM, get_resource_profile, enforce_worker_limits
from app.simulation.resources import (
    ResourceLimits,
    apply_process_controls,
    detect_resources,
    sample_resource_snapshot,
)
from app.simulation.solver import SimulationConfig, SimulationResult, run_transient_simulation
from app.visualization.mpl_viewer import MoldFigureCanvas


class SimulationThread(QThread):
    finished_result = Signal(object)
    failed = Signal(str)

    def __init__(self, bodies: list[Body], config: SimulationConfig, backend: BackendMode, cpu_only: bool, gpu_enabled: bool) -> None:
        super().__init__()
        self.bodies = bodies
        self.config = config
        self.backend = backend
        self.cpu_only = cpu_only
        self.gpu_enabled = gpu_enabled

    def run(self) -> None:
        try:
            result, selection = run_simulation_backend(self.bodies, self.config, self.backend, self.cpu_only, self.gpu_enabled)
            self.finished_result.emit((result, selection))
        except Exception as exc:
            self.failed.emit(str(exc))


class SweepThread(QThread):
    progress_changed = Signal(int, int, object)
    finished_rows = Signal(object)
    throttle_changed = Signal(str)
    failed = Signal(str)

    def __init__(self, bodies: list[Body], config: SimulationConfig, sweep: SweepConfig, limits: ResourceLimits) -> None:
        super().__init__()
        self.bodies = bodies
        self.config = config
        self.sweep = sweep
        self.limits = limits
        self.pause_event = Event()
        self.cancel_event = Event()

    def run(self) -> None:
        try:
            rows = run_sweep(
                self.bodies,
                self.config,
                self.sweep,
                self.progress_changed.emit,
                self._should_pause,
                self.cancel_event.is_set,
                self.throttle_changed.emit,
            )
            self.finished_rows.emit(rows)
        except Exception as exc:
            self.failed.emit(str(exc))

    def pause(self) -> None:
        self.pause_event.set()

    def resume(self) -> None:
        self.pause_event.clear()

    def cancel(self) -> None:
        self.cancel_event.set()
        self.pause_event.clear()

    def _should_pause(self) -> tuple[bool, str]:
        if self.pause_event.is_set():
            return True, "Manual pause requested."
        snapshot = sample_resource_snapshot(self.limits)
        if snapshot.throttle_state in {"THROTTLE", "EMERGENCY_PAUSE", "GPU_THROTTLE"}:
            return True, snapshot.throttle_reason
        return False, ""


class MainWindow(QMainWindow):
    def __init__(self) -> None:
        super().__init__()
        self.setWindowTitle("InFlux Thermal Mold Analyzer")
        self.resize(1320, 820)
        self.bodies: list[Body] = load_demo_geometry()
        self.last_result: SimulationResult | None = None
        self.last_sweep_rows: list[dict[str, float | str]] = []
        self.session_dir = create_session_dir()
        self.worker_thread: QThread | None = None
        self.active_workers = 0
        self.active_jobs = 0
        self.completed_jobs = 0
        self.last_rate = 0.0
        self.throttle_reason = "No throttling active."
        self.backend_selection: BackendSelection | None = None
        self.started_at = perf_counter()

        self._build_ui()
        self._load_body_table()
        self.viewer.draw_bodies(self.bodies)
        self._refresh_resource_defaults()

        self.usage_timer = QTimer(self)
        self.usage_timer.timeout.connect(self._update_usage)
        self.usage_timer.start(1000)

    def _build_ui(self) -> None:
        root = QSplitter()
        controls = QWidget()
        controls.setMinimumWidth(430)
        controls_layout = QVBoxLayout(controls)

        file_box = QGroupBox("Geometry")
        file_layout = QHBoxLayout(file_box)
        self.import_button = QPushButton("Import STEP")
        self.demo_button = QPushButton("Load Demo")
        self.import_button.clicked.connect(self._import_step)
        self.demo_button.clicked.connect(self._load_demo)
        file_layout.addWidget(self.import_button)
        file_layout.addWidget(self.demo_button)

        self.body_table = QTableWidget(0, 5)
        self.body_table.setHorizontalHeaderLabels(["Body", "Role", "Material", "Initial C", "Volume mm3"])
        self.body_table.cellChanged.connect(self._body_table_changed)

        sim_box = QGroupBox("Simulation")
        sim_form = QFormLayout(sim_box)
        self.dt_spin = _double_spin(0.05, 20.0, 0.5, 0.05)
        self.cycle_spin = _double_spin(1.0, 600.0, 30.0, 1.0)
        self.cycles_spin = _spin(1, 500, 3)
        self.water_spin = _double_spin(0.0, 95.0, 22.0, 1.0)
        self.convection_spin = _double_spin(50.0, 50000.0, 3000.0, 100.0)
        self.target_spin = _double_spin(20.0, 250.0, 75.0, 1.0)
        for label, widget in [
            ("Timestep (s)", self.dt_spin),
            ("Cycle time (s)", self.cycle_spin),
            ("Cycles", self.cycles_spin),
            ("Water temp (C)", self.water_spin),
            ("Convection W/m2K", self.convection_spin),
            ("Target ejection (C)", self.target_spin),
        ]:
            sim_form.addRow(label, widget)

        resource_box = QGroupBox("Resources")
        resource_form = QFormLayout(resource_box)
        self.profile_combo = QComboBox()
        self.profile_combo.addItems(PRESET_LABELS)
        self.profile_combo.setCurrentText("Normal")
        self.profile_combo.currentTextChanged.connect(self._refresh_resource_defaults)
        self.worker_spin = _spin(1, 256, 1)
        self.ram_spin = _double_spin(0.5, 1024.0, 4.0, 0.5)
        self.min_free_ram_spin = _double_spin(4.0, 128.0, 8.0, 0.5)
        self.vram_spin = _double_spin(0.0, 128.0, 0.0, 0.5)
        self.cache_path_edit = QLineEdit()
        self.cache_browse_button = QPushButton("Browse")
        self.cache_browse_button.clicked.connect(self._choose_cache_path)
        self.priority_combo = QComboBox()
        self.priority_combo.addItems(["background", "below_normal", "normal", "high"])
        self.affinity_spin = _spin(0, 256, 0)
        self.backend_combo = QComboBox()
        self.backend_combo.addItems([mode.value for mode in BackendMode])
        self.cpu_only_check = QCheckBox("CPU-only")
        self.gpu_enabled_check = QCheckBox("GPU / Hybrid enabled")
        self.resource_label = QLabel("")
        self.resource_label.setWordWrap(True)
        cache_row = QWidget()
        cache_layout = QHBoxLayout(cache_row)
        cache_layout.setContentsMargins(0, 0, 0, 0)
        cache_layout.addWidget(self.cache_path_edit)
        cache_layout.addWidget(self.cache_browse_button)
        for label, widget in [
            ("Preset", self.profile_combo),
            ("Workers", self.worker_spin),
            ("Max RAM GB", self.ram_spin),
            ("Min free RAM GB", self.min_free_ram_spin),
            ("VRAM cap GB", self.vram_spin),
            ("Cache/output", cache_row),
            ("Priority", self.priority_combo),
            ("Affinity CPUs (0=auto)", self.affinity_spin),
            ("Backend", self.backend_combo),
            ("CPU override", self.cpu_only_check),
            ("GPU option", self.gpu_enabled_check),
            ("Detected", self.resource_label),
        ]:
            resource_form.addRow(label, widget)

        monitor_box = QGroupBox("Resource Monitor")
        monitor_form = QFormLayout(monitor_box)
        self.cpu_monitor_label = QLabel("CPU --")
        self.ram_monitor_label = QLabel("RAM --")
        self.disk_monitor_label = QLabel("Disk --")
        self.gpu_monitor_label = QLabel("GPU telemetry unavailable")
        self.throttle_label = QLabel("No throttling active.")
        self.throttle_label.setWordWrap(True)
        for label, widget in [
            ("CPU", self.cpu_monitor_label),
            ("RAM", self.ram_monitor_label),
            ("Cache disk", self.disk_monitor_label),
            ("GPU / VRAM", self.gpu_monitor_label),
            ("Throttling", self.throttle_label),
        ]:
            monitor_form.addRow(label, widget)

        action_box = QGroupBox("Run")
        action_layout = QGridLayout(action_box)
        self.single_button = QPushButton("Run Single Simulation")
        self.sweep_button = QPushButton("Run Parameter Sweep")
        self.pause_button = QPushButton("Pause")
        self.resume_button = QPushButton("Resume")
        self.cancel_button = QPushButton("Cancel")
        self.export_button = QPushButton("Export Current Result")
        self.single_button.clicked.connect(self._run_single)
        self.sweep_button.clicked.connect(self._run_sweep)
        self.pause_button.clicked.connect(self._pause_run)
        self.resume_button.clicked.connect(self._resume_run)
        self.cancel_button.clicked.connect(self._cancel_run)
        self.export_button.clicked.connect(self._export_current)
        self.progress = QProgressBar()
        self.status_label = QLabel("Ready.")
        self.usage_label = QLabel("CPU 0% | RAM 0% | workers 0 | completed 0")
        action_layout.addWidget(self.single_button, 0, 0, 1, 2)
        action_layout.addWidget(self.sweep_button, 1, 0, 1, 2)
        action_layout.addWidget(self.pause_button, 2, 0)
        action_layout.addWidget(self.resume_button, 2, 1)
        action_layout.addWidget(self.cancel_button, 3, 0)
        action_layout.addWidget(self.export_button, 3, 1)
        action_layout.addWidget(self.progress, 4, 0, 1, 2)
        action_layout.addWidget(self.status_label, 5, 0, 1, 2)
        action_layout.addWidget(self.usage_label, 6, 0, 1, 2)

        self.log = QTextEdit()
        self.log.setReadOnly(True)

        controls_layout.addWidget(file_box)
        controls_layout.addWidget(self.body_table, 2)
        controls_layout.addWidget(sim_box)
        controls_layout.addWidget(resource_box)
        controls_layout.addWidget(monitor_box)
        controls_layout.addWidget(action_box)
        controls_layout.addWidget(self.log, 1)

        tabs = QTabWidget()
        self.viewer = MoldFigureCanvas()
        self.results_text = QTextEdit()
        self.results_text.setReadOnly(True)
        self.leaderboard_table = QTableWidget(0, 5)
        self.leaderboard_table.setHorizontalHeaderLabels(["Rank", "Score", "Water C", "Convection", "Cycle s"])
        tabs.addTab(self.viewer, "3D / Temperature")
        tabs.addTab(self.results_text, "Results")
        tabs.addTab(self.leaderboard_table, "Optimization Leaderboard")

        root.addWidget(controls)
        root.addWidget(tabs)
        root.setSizes([440, 880])
        self.setCentralWidget(root)

    def _import_step(self) -> None:
        path, _ = QFileDialog.getOpenFileName(self, "Import STEP mold assembly", "", "STEP files (*.step *.stp);;All files (*.*)")
        if not path:
            return
        try:
            self.bodies = import_step(path)
            self._load_body_table()
            self.viewer.draw_bodies(self.bodies)
            self._log(f"Imported {len(self.bodies)} bodies from {path}")
        except StepImportError as exc:
            QMessageBox.warning(self, "STEP import diagnostic", str(exc))
            self._log(str(exc))

    def _load_demo(self) -> None:
        self.bodies = load_demo_geometry()
        self._load_body_table()
        self.viewer.draw_bodies(self.bodies)
        self._log("Loaded synthetic clamped mold assembly.")

    def _load_body_table(self) -> None:
        self.body_table.blockSignals(True)
        self.body_table.setRowCount(len(self.bodies))
        for row, body in enumerate(self.bodies):
            self.body_table.setItem(row, 0, QTableWidgetItem(body.name))
            role_combo = QComboBox()
            role_combo.addItems(["mold", "plastic", "water", "ignored"])
            role_combo.setCurrentText(body.role)
            role_combo.currentTextChanged.connect(lambda value, r=row: self._role_changed(r, value))
            self.body_table.setCellWidget(row, 1, role_combo)
            material_combo = QComboBox()
            material_combo.addItems(["P20 steel", "Tool steel", "Aluminum", "PP", "ABS", "PLA", "Water", "Unassigned"])
            material_combo.setCurrentText(body.material)
            material_combo.currentTextChanged.connect(lambda value, r=row: self._material_changed(r, value))
            self.body_table.setCellWidget(row, 2, material_combo)
            self.body_table.setItem(row, 3, QTableWidgetItem(f"{body.initial_temperature_c:.1f}"))
            self.body_table.setItem(row, 4, QTableWidgetItem(f"{body.volume_mm3:.1f}"))
        self.body_table.resizeColumnsToContents()
        self.body_table.blockSignals(False)

    def _role_changed(self, row: int, value: str) -> None:
        self.bodies[row].role = value  # type: ignore[assignment]
        self.viewer.draw_bodies(self.bodies)

    def _material_changed(self, row: int, value: str) -> None:
        self.bodies[row].material = value

    def _body_table_changed(self, row: int, column: int) -> None:
        if column == 0:
            self.bodies[row].name = self.body_table.item(row, column).text()
        if column == 3:
            try:
                self.bodies[row].initial_temperature_c = float(self.body_table.item(row, column).text())
            except ValueError:
                self._log("Initial temperature must be numeric.")

    def _run_single(self) -> None:
        self._sync_process_controls()
        self._set_running(True)
        self.progress.setRange(0, 0)
        self.worker_thread = SimulationThread(
            self.bodies,
            self._sim_config(),
            BackendMode(self.backend_combo.currentText()),
            self.cpu_only_check.isChecked(),
            self.gpu_enabled_check.isChecked(),
        )
        self.worker_thread.finished_result.connect(self._single_finished)
        self.worker_thread.failed.connect(self._run_failed)
        self.worker_thread.start()
        self.active_workers = 1
        self._log("Single transient simulation started.")

    def _run_sweep(self) -> None:
        self._sync_process_controls()
        self._set_running(True)
        self.progress.setRange(0, 100)
        self.progress.setValue(0)
        effective_workers = enforce_worker_limits(self._current_profile(), self.worker_spin.value(), self.ram_spin.value())
        sweep = SweepConfig(
            water_temperatures_c=(self.water_spin.value() - 4, self.water_spin.value(), self.water_spin.value() + 4),
            convection_w_m2k=(self.convection_spin.value() * 0.5, self.convection_spin.value(), self.convection_spin.value() * 2.0),
            cycle_times_s=(max(1.0, self.cycle_spin.value() - 10), self.cycle_spin.value(), self.cycle_spin.value() + 10),
            workers=effective_workers,
        )
        self.worker_thread = SweepThread(self.bodies, self._sim_config(), sweep, self._resource_limits())
        self.worker_thread.progress_changed.connect(self._sweep_progress)
        self.worker_thread.finished_rows.connect(self._sweep_finished)
        self.worker_thread.throttle_changed.connect(self._throttle_changed)
        self.worker_thread.failed.connect(self._run_failed)
        self.worker_thread.start()
        self.active_workers = effective_workers
        self._log(f"Parameter sweep started with {sweep.workers} workers. RAM cap: {self.ram_spin.value():.1f} GB.")

    def _single_finished(self, payload: object) -> None:
        result, selection = payload
        self.backend_selection = selection
        self.last_result = result
        final_temps = {body_id: temps[-1] for body_id, temps in result.body_temperatures_c.items()}
        self.viewer.draw_bodies(self.bodies, final_temps)
        paths = export_simulation(self.session_dir, self.bodies, result)
        self.results_text.setPlainText(
            f"Backend: requested {selection.requested.value}, effective {selection.effective.value}\n"
            f"{selection.message}\n\nSummary:\n{result.summary}\n\nExports:\n"
            + "\n".join(f"{k}: {v}" for k, v in paths.items())
        )
        self._log(f"Simulation complete. Exported to {self.session_dir}")
        self.progress.setRange(0, 100)
        self.progress.setValue(100)
        self.active_workers = 0
        self._set_running(False)

    def _sweep_progress(self, done: int, total: int, row: object) -> None:
        percent = int(done / max(1, total) * 100)
        self.progress.setValue(percent)
        elapsed = max(0.001, perf_counter() - self.started_at)
        rate = done / elapsed * 60.0
        self.completed_jobs = done
        self.active_jobs = max(0, total - done)
        self.last_rate = rate
        speedup = max(1, self.active_workers)
        self.status_label.setText(f"Sweep {done}/{total} | {rate:.1f} simulations/min | worker speedup target x{speedup}")
        self._log(f"Sweep case {done}/{total}: {row}")

    def _sweep_finished(self, rows: object) -> None:
        self.last_sweep_rows = list(rows)
        path = export_sweep(self.session_dir, self.last_sweep_rows)
        best = self.last_sweep_rows[0] if self.last_sweep_rows else {}
        self.results_text.setPlainText(f"Best sweep result:\n{best}\n\nCSV: {path}")
        self._update_leaderboard()
        self._log(f"Sweep complete. Best result: {best}")
        self.progress.setValue(100)
        self.active_workers = 0
        self._set_running(False)

    def _run_failed(self, message: str) -> None:
        self._set_running(False)
        self.progress.setRange(0, 100)
        self.progress.setValue(0)
        self.active_workers = 0
        self._log(f"ERROR: {message}")
        QMessageBox.critical(self, "Simulation error", message)

    def _pause_run(self) -> None:
        if isinstance(self.worker_thread, SweepThread):
            self.worker_thread.pause()
            self._throttle_changed("Manual pause requested.")

    def _resume_run(self) -> None:
        if isinstance(self.worker_thread, SweepThread):
            self.worker_thread.resume()
            self._throttle_changed("No throttling active.")

    def _cancel_run(self) -> None:
        if isinstance(self.worker_thread, SweepThread):
            self.worker_thread.cancel()
            self._throttle_changed("Cancel requested; active jobs will finish, new jobs will not be scheduled.")
        elif self.worker_thread and self.worker_thread.isRunning():
            self.worker_thread.requestInterruption()
            self._throttle_changed("Cancel requested; single simulation will stop after current solver call.")

    def _throttle_changed(self, reason: str) -> None:
        self.throttle_reason = reason
        self.throttle_label.setText(reason)
        self.status_label.setText(reason)

    def _export_current(self) -> None:
        if not self.last_result:
            self._log("No simulation result to export yet.")
            return
        paths = export_simulation(self.session_dir, self.bodies, self.last_result)
        screenshot = self.session_dir / "viewer_screenshot.png"
        self.viewer.save_screenshot(str(screenshot))
        self._log("Exported CSV, chart, log, HTML report, and viewer screenshot.")
        self.results_text.setPlainText("\n".join(f"{k}: {v}" for k, v in {**paths, "screenshot": screenshot}.items()))

    def _sim_config(self) -> SimulationConfig:
        return SimulationConfig(
            timestep_s=self.dt_spin.value(),
            cycle_time_s=self.cycle_spin.value(),
            cycles=self.cycles_spin.value(),
            water_temperature_c=self.water_spin.value(),
            convection_w_m2k=self.convection_spin.value(),
            target_ejection_temperature_c=self.target_spin.value(),
        )

    def _refresh_resource_defaults(self) -> None:
        resources = detect_resources()
        profile = get_resource_profile(self.profile_combo.currentText(), resources)
        self.worker_spin.setMaximum(max(1, resources.logical_threads))
        self.worker_spin.setValue(profile.cpu_workers)
        self.affinity_spin.setMaximum(max(0, resources.logical_threads))
        self.affinity_spin.setValue(profile.cpu_affinity_workers)
        self.ram_spin.setMaximum(max(1.0, resources.total_ram_gb))
        self.ram_spin.setValue(profile.ram_cap_gb)
        self.min_free_ram_spin.setValue(profile.min_free_ram_gb)
        self.vram_spin.setValue(profile.vram_cap_gb)
        self.cache_path_edit.setText(profile.cache_output_path)
        self.priority_combo.setCurrentText(profile.process_priority)
        self.backend_combo.setCurrentText(profile.backend_mode.value)
        self.gpu_enabled_check.setChecked(profile.gpu_enabled)
        self.cpu_only_check.setChecked(not profile.gpu_enabled)
        self.resource_label.setText(
            f"{profile.name}: {resources.physical_cores} cores / {resources.logical_threads} threads | "
            f"logical available {profile.logical_threads_available}, workers {profile.cpu_workers}, "
            f"reserved threads {profile.logical_threads_reserved} | "
            f"RAM cap {profile.ram_cap_gb:.1f} GB, aggressive cap {profile.aggressive_ram_cap_gb:.1f} GB, "
            f"free reserve {profile.min_free_ram_gb:.1f} GB, emergency {profile.emergency_free_ram_gb:.1f} GB | "
            f"VRAM cap {profile.vram_cap_gb:.1f} GB | GPU: {resources.gpu_summary} | {profile.notes}"
        )

    def _sync_process_controls(self) -> None:
        if self.priority_combo.currentText() == "high":
            self._log("WARNING: high process priority was explicitly selected. Desktop responsiveness may suffer.")
        message = apply_process_controls(
            self.priority_combo.currentText(),
            self.affinity_spin.value() or None,
            reserve_logical_threads=self._current_profile().logical_threads_reserved,
        )
        self.started_at = perf_counter()
        self._log(message)

    def _update_usage(self) -> None:
        worker_active = self.active_workers if self.worker_thread and self.worker_thread.isRunning() else 0
        snapshot = sample_resource_snapshot(
            self._resource_limits(),
            worker_active,
            self.active_jobs,
            self.completed_jobs,
            self.last_rate,
        )
        completed = self.completed_jobs or len(self.last_sweep_rows)
        self.cpu_monitor_label.setText(f"system {snapshot.cpu_percent:.0f}% | app {snapshot.app_cpu_percent:.0f}%")
        self.ram_monitor_label.setText(
            f"used {snapshot.ram_used_gb:.1f} GB | free {snapshot.ram_free_gb:.1f} GB | app {snapshot.app_ram_gb:.2f} GB"
        )
        self.disk_monitor_label.setText(f"free {snapshot.disk_free_gb:.1f} GB | used {snapshot.disk_used_percent:.0f}%")
        self.gpu_monitor_label.setText(
            f"{snapshot.gpu.name} | VRAM cap {self.vram_spin.value():.1f} GB | {snapshot.gpu.message}"
        )
        if snapshot.throttle_state != "OK":
            self.throttle_reason = snapshot.throttle_reason
        self.throttle_label.setText(self.throttle_reason if self.throttle_reason != "No throttling active." else snapshot.throttle_reason)
        self.usage_label.setText(
            f"CPU {snapshot.cpu_percent:.0f}% | RAM {snapshot.ram_percent:.0f}% | "
            f"workers {worker_active} | active jobs {self.active_jobs} | completed {completed} | "
            f"{snapshot.simulations_per_minute:.1f} sim/min"
        )

    def _set_running(self, running: bool) -> None:
        for button in [self.single_button, self.sweep_button, self.import_button, self.demo_button]:
            button.setEnabled(not running)
        self.status_label.setText("Running..." if running else "Ready.")

    def _current_profile(self):
        return get_resource_profile(self.profile_combo.currentText(), detect_resources())

    def _resource_limits(self) -> ResourceLimits:
        return ResourceLimits(
            ram_cap_gb=self.ram_spin.value(),
            aggressive_ram_cap_gb=max(self.ram_spin.value(), min(60.0, self.ram_spin.value() + 4.0)),
            min_free_ram_gb=self.min_free_ram_spin.value(),
            emergency_free_ram_gb=4.0,
            vram_cap_gb=self.vram_spin.value(),
            cache_output_path=self.cache_path_edit.text() or str(Path.cwd() / "outputs"),
        )

    def _choose_cache_path(self) -> None:
        path = QFileDialog.getExistingDirectory(self, "Select cache/output folder", self.cache_path_edit.text())
        if path:
            self.cache_path_edit.setText(path)
            self.profile_combo.setCurrentText(PRESET_CUSTOM)

    def _update_leaderboard(self) -> None:
        rows = self.last_sweep_rows[:10]
        self.leaderboard_table.setRowCount(len(rows))
        for row_idx, row in enumerate(rows):
            values = [
                str(row_idx + 1),
                f"{float(row.get('score', 0.0)):.2f}",
                f"{float(row.get('water_temperature_c', 0.0)):.1f}",
                f"{float(row.get('convection_w_m2k', 0.0)):.0f}",
                f"{float(row.get('cycle_time_s', 0.0)):.1f}",
            ]
            for col, value in enumerate(values):
                self.leaderboard_table.setItem(row_idx, col, QTableWidgetItem(value))
        self.leaderboard_table.resizeColumnsToContents()

    def _log(self, message: str) -> None:
        self.log.append(message)


def _double_spin(minimum: float, maximum: float, value: float, step: float) -> QDoubleSpinBox:
    widget = QDoubleSpinBox()
    widget.setRange(minimum, maximum)
    widget.setValue(value)
    widget.setSingleStep(step)
    widget.setDecimals(2)
    return widget


def _spin(minimum: int, maximum: int, value: int) -> QSpinBox:
    widget = QSpinBox()
    widget.setRange(minimum, maximum)
    widget.setValue(value)
    return widget


def launch() -> int:
    app = QApplication([])
    window = MainWindow()
    window.show()
    return app.exec()
