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
