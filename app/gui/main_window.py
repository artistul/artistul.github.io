from __future__ import annotations

from pathlib import Path
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
from app.simulation.resources import apply_process_controls, detect_resources, live_usage, recommended_workers
from app.simulation.solver import SimulationConfig, SimulationResult, run_transient_simulation
from app.visualization.mpl_viewer import MoldFigureCanvas


class SimulationThread(QThread):
    finished_result = Signal(object)
    failed = Signal(str)

    def __init__(self, bodies: list[Body], config: SimulationConfig) -> None:
        super().__init__()
        self.bodies = bodies
        self.config = config

    def run(self) -> None:
        try:
            self.finished_result.emit(run_transient_simulation(self.bodies, self.config))
        except Exception as exc:
            self.failed.emit(str(exc))


class SweepThread(QThread):
    progress_changed = Signal(int, int, object)
    finished_rows = Signal(object)
    failed = Signal(str)

    def __init__(self, bodies: list[Body], config: SimulationConfig, sweep: SweepConfig) -> None:
        super().__init__()
        self.bodies = bodies
        self.config = config
        self.sweep = sweep

    def run(self) -> None:
        try:
            rows = run_sweep(self.bodies, self.config, self.sweep, self.progress_changed.emit)
            self.finished_rows.emit(rows)
        except Exception as exc:
            self.failed.emit(str(exc))


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
        self.mode_combo = QComboBox()
        self.mode_combo.addItems(["background", "normal", "high", "max"])
        self.mode_combo.setCurrentText("normal")
        self.mode_combo.currentTextChanged.connect(self._refresh_resource_defaults)
        self.aggressive_max = QCheckBox("Aggressive MAX")
        self.aggressive_max.stateChanged.connect(self._refresh_resource_defaults)
        self.worker_spin = _spin(1, 256, 1)
        self.ram_spin = _double_spin(0.5, 1024.0, 4.0, 0.5)
        self.priority_combo = QComboBox()
        self.priority_combo.addItems(["background", "normal", "high"])
        self.affinity_spin = _spin(0, 256, 0)
        self.resource_label = QLabel("")
        for label, widget in [
            ("Mode", self.mode_combo),
            ("MAX option", self.aggressive_max),
            ("Workers", self.worker_spin),
            ("Max RAM GB", self.ram_spin),
            ("Priority", self.priority_combo),
            ("Affinity CPUs (0=auto)", self.affinity_spin),
            ("Detected", self.resource_label),
        ]:
            resource_form.addRow(label, widget)

        action_box = QGroupBox("Run")
        action_layout = QGridLayout(action_box)
        self.single_button = QPushButton("Run Single Simulation")
        self.sweep_button = QPushButton("Run Parameter Sweep")
        self.export_button = QPushButton("Export Current Result")
        self.single_button.clicked.connect(self._run_single)
        self.sweep_button.clicked.connect(self._run_sweep)
        self.export_button.clicked.connect(self._export_current)
        self.progress = QProgressBar()
        self.status_label = QLabel("Ready.")
        self.usage_label = QLabel("CPU 0% | RAM 0% | workers 0 | completed 0")
        action_layout.addWidget(self.single_button, 0, 0, 1, 2)
        action_layout.addWidget(self.sweep_button, 1, 0, 1, 2)
        action_layout.addWidget(self.export_button, 2, 0, 1, 2)
        action_layout.addWidget(self.progress, 3, 0, 1, 2)
        action_layout.addWidget(self.status_label, 4, 0, 1, 2)
        action_layout.addWidget(self.usage_label, 5, 0, 1, 2)

        self.log = QTextEdit()
        self.log.setReadOnly(True)

        controls_layout.addWidget(file_box)
        controls_layout.addWidget(self.body_table, 2)
        controls_layout.addWidget(sim_box)
        controls_layout.addWidget(resource_box)
        controls_layout.addWidget(action_box)
        controls_layout.addWidget(self.log, 1)

        tabs = QTabWidget()
        self.viewer = MoldFigureCanvas()
        self.results_text = QTextEdit()
        self.results_text.setReadOnly(True)
        tabs.addTab(self.viewer, "3D / Temperature")
        tabs.addTab(self.results_text, "Results")

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
        self.worker_thread = SimulationThread(self.bodies, self._sim_config())
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
        ram_limited_workers = max(1, int(self.ram_spin.value() / 0.25))
        effective_workers = min(self.worker_spin.value(), ram_limited_workers)
        sweep = SweepConfig(
            water_temperatures_c=(self.water_spin.value() - 4, self.water_spin.value(), self.water_spin.value() + 4),
            convection_w_m2k=(self.convection_spin.value() * 0.5, self.convection_spin.value(), self.convection_spin.value() * 2.0),
            cycle_times_s=(max(1.0, self.cycle_spin.value() - 10), self.cycle_spin.value(), self.cycle_spin.value() + 10),
            workers=effective_workers,
        )
        self.worker_thread = SweepThread(self.bodies, self._sim_config(), sweep)
        self.worker_thread.progress_changed.connect(self._sweep_progress)
        self.worker_thread.finished_rows.connect(self._sweep_finished)
        self.worker_thread.failed.connect(self._run_failed)
        self.worker_thread.start()
        self.active_workers = effective_workers
        self._log(f"Parameter sweep started with {sweep.workers} workers. RAM cap: {self.ram_spin.value():.1f} GB.")

    def _single_finished(self, result: SimulationResult) -> None:
        self.last_result = result
        final_temps = {body_id: temps[-1] for body_id, temps in result.body_temperatures_c.items()}
        self.viewer.draw_bodies(self.bodies, final_temps)
        paths = export_simulation(self.session_dir, self.bodies, result)
        self.results_text.setPlainText(f"Summary:\n{result.summary}\n\nExports:\n" + "\n".join(f"{k}: {v}" for k, v in paths.items()))
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
        speedup = max(1, self.active_workers)
        self.status_label.setText(f"Sweep {done}/{total} | {rate:.1f} simulations/min | worker speedup target x{speedup}")
        self._log(f"Sweep case {done}/{total}: {row}")

    def _sweep_finished(self, rows: object) -> None:
        self.last_sweep_rows = list(rows)
        path = export_sweep(self.session_dir, self.last_sweep_rows)
        best = self.last_sweep_rows[0] if self.last_sweep_rows else {}
        self.results_text.setPlainText(f"Best sweep result:\n{best}\n\nCSV: {path}")
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
        workers = recommended_workers(self.mode_combo.currentText(), self.aggressive_max.isChecked())
        self.worker_spin.setMaximum(max(1, resources.logical_threads))
        self.worker_spin.setValue(workers)
        self.affinity_spin.setMaximum(max(0, resources.logical_threads))
        self.ram_spin.setMaximum(max(1.0, resources.total_ram_gb))
        self.ram_spin.setValue(max(1.0, min(resources.available_ram_gb * 0.7, resources.total_ram_gb)))
        self.resource_label.setText(
            f"{resources.physical_cores} cores / {resources.logical_threads} threads | "
            f"{resources.available_ram_gb:.1f}/{resources.total_ram_gb:.1f} GB free | GPU: {resources.gpu_summary}"
        )

    def _sync_process_controls(self) -> None:
        message = apply_process_controls(self.priority_combo.currentText(), self.affinity_spin.value() or None)
        self.started_at = perf_counter()
        self._log(message)

    def _update_usage(self) -> None:
        usage = live_usage()
        worker_active = self.active_workers if self.worker_thread and self.worker_thread.isRunning() else 0
        completed = len(self.last_sweep_rows)
        self.usage_label.setText(
            f"CPU {usage['cpu_percent']:.0f}% | RAM {usage['ram_percent']:.0f}% | "
            f"free {usage['available_ram_gb']:.1f} GB | workers active {worker_active} | "
            f"completed {completed} | speedup target x{max(1, worker_active)}"
        )

    def _set_running(self, running: bool) -> None:
        for button in [self.single_button, self.sweep_button, self.import_button, self.demo_button]:
            button.setEnabled(not running)
        self.status_label.setText("Running..." if running else "Ready.")

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
