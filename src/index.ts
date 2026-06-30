export type {
  ConsoleReport,
  EventTimelineOptions,
} from "./console/consoleTypes.js";
export { renderEventTimeline } from "./console/eventTimeline.js";
export { renderFaultReport } from "./console/faultReport.js";
export {
  formatPercent,
  formatRobotState,
  formatTemperature,
  formatTimestampMs,
  formatVoltage,
} from "./console/formatters.js";
export { renderReplayReport } from "./console/replayReport.js";
export { renderScenarioReport } from "./console/scenarioReport.js";
export { renderTelemetrySnapshot } from "./console/telemetryReport.js";
export { TELEMETRY_EVENT_TYPES } from "./events/eventTypes.js";
export type {
  FaultInjectedPayload,
  StateChangedPayload,
  StreamLifecyclePayload,
  TelemetryEvent,
  TelemetryEventHandler,
  TelemetryEventType,
  TelemetrySnapshotPayload,
} from "./events/eventTypes.js";
export { TelemetryStream } from "./events/telemetryStream.js";
export type { TelemetryStreamStatus } from "./events/telemetryStream.js";
export { FaultInjector } from "./faults/faultInjector.js";
export { FAULT_TYPES } from "./faults/faultTypes.js";
export type { Fault, FaultType } from "./faults/faultTypes.js";
export {
  BUILT_IN_FLEET_SCENARIO_IDS,
  BUILT_IN_FLEET_SCENARIOS,
  getBuiltInFleetScenario,
} from "./fleet/builtInFleetScenarios.js";
export type { BuiltInFleetScenarioId } from "./fleet/builtInFleetScenarios.js";
export {
  createFleetReplayLog,
  deserializeFleetReplayLog,
  FLEET_REPLAY_LOG_VERSION,
  serializeFleetReplayLog,
  validateFleetReplayLog,
} from "./fleet/fleetReplay.js";
export {
  renderFleetReplayReport,
  renderFleetScenarioReport,
} from "./fleet/fleetReport.js";
export {
  FleetScenarioRunner,
  runFleetScenario,
} from "./fleet/fleetScenarioRunner.js";
export type {
  FleetReplayLog,
  FleetReplayValidationResult,
  FleetRobotProfile,
  FleetScenarioProfile,
  FleetScenarioRunResult,
  FleetScenarioRunSummary,
  FleetValidationResult,
} from "./fleet/fleetTypes.js";
export { validateFleetScenario } from "./fleet/fleetValidator.js";
export { AdapterTelemetryCollector } from "./hardware/adapterTelemetryCollector.js";
export type {
  AdapterTelemetryCollectorOptions,
  TelemetryCollectionTimestamp,
} from "./hardware/adapterTelemetryCollector.js";
export { validateHardwareAdapter } from "./hardware/adapterValidator.js";
export type {
  HardwareAdapter,
  SteppableHardwareAdapter,
} from "./hardware/hardwareAdapter.js";
export { HARDWARE_ADAPTER_STATUSES } from "./hardware/hardwareTypes.js";
export type {
  BatteryReading,
  HardwareAdapterInfo,
  HardwareAdapterStatus,
  HardwareAdapterValidationResult,
  ImuReading,
  MotorReading,
  SystemReading,
} from "./hardware/hardwareTypes.js";
export { VirtualBatteryAdapter } from "./hardware/virtualBatteryAdapter.js";
export type { VirtualBatteryAdapterOptions } from "./hardware/virtualBatteryAdapter.js";
export { VirtualImuAdapter } from "./hardware/virtualImuAdapter.js";
export type { VirtualImuAdapterOptions } from "./hardware/virtualImuAdapter.js";
export { VirtualMotorAdapter } from "./hardware/virtualMotorAdapter.js";
export type { VirtualMotorAdapterOptions } from "./hardware/virtualMotorAdapter.js";
export { VirtualSystemAdapter } from "./hardware/virtualSystemAdapter.js";
export type { VirtualSystemAdapterOptions } from "./hardware/virtualSystemAdapter.js";
export { snapshotToJson } from "./output/jsonOutput.js";
export {
  deserializeReplayLog,
  REPLAY_LOG_VERSION,
  serializeReplayLog,
} from "./replay/replayLog.js";
export type { ReplayLog } from "./replay/replayLog.js";
export { ReplayPlayer } from "./replay/replayPlayer.js";
export type { ReplayPlayerStatus } from "./replay/replayPlayer.js";
export { ReplayRecorder } from "./replay/replayRecorder.js";
export type {
  ReplayRecorderOptions,
  ReplayRecorderStatus,
} from "./replay/replayRecorder.js";
export { validateReplayLog } from "./replay/replayValidator.js";
export type { ReplayValidationResult } from "./replay/replayValidator.js";
export {
  BUILT_IN_SCENARIO_IDS,
  BUILT_IN_SCENARIOS,
  getBuiltInScenario,
} from "./scenarios/builtInScenarios.js";
export type { BuiltInScenarioId } from "./scenarios/builtInScenarios.js";
export {
  runScenario,
  ScenarioRunner,
} from "./scenarios/scenarioRunner.js";
export type {
  ScenarioProfile,
  ScenarioRunResult,
  ScenarioRunSummary,
  ScenarioValidationResult,
  ScheduledFault,
} from "./scenarios/scenarioTypes.js";
export { validateScenarioProfile } from "./scenarios/scenarioValidator.js";
export { RobotSimulator } from "./simulator/robotSimulator.js";
export type { RobotSimulatorOptions } from "./simulator/robotSimulator.js";
export { createSeededRandom } from "./simulator/seed.js";
export type { RandomSource } from "./simulator/seed.js";
export type {
  ImuTelemetry,
  RobotState,
  TelemetrySnapshot,
  Vector3,
} from "./types.js";
