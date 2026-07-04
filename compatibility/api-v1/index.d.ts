/**
 * Interstice Telemetry public SDK entry point.
 *
 * Export stability is documented in `docs/API_STABILITY.md`. An export being
 * available from this module does not by itself make it stable: newer
 * adapter-stream and fleet-timeline contracts remain experimental, while a
 * small set of low-level construction and formatting helpers are internal
 * candidates retained for prerelease compatibility.
 *
 * @packageDocumentation
 */
/** Deterministic clock contracts and implementations. */
export { validateClock } from "./clock/clockValidator.js";
export { FleetClock } from "./clock/fleetClock.js";
export type { FleetClockOptions } from "./clock/fleetClock.js";
export { LogicalClock } from "./clock/logicalClock.js";
export type { LogicalClockOptions } from "./clock/logicalClock.js";
export { ReplayClock } from "./clock/replayClock.js";
export type { ReplayClockOptions } from "./clock/replayClock.js";
export { SimulationClock } from "./clock/simulationClock.js";
export type { SimulationClockOptions } from "./clock/simulationClock.js";
export { CLOCK_KINDS } from "./clock/clockTypes.js";
export type { ClockInfo, ClockKind, ClockOptions, ClockValidationResult, DeterministicClock, } from "./clock/clockTypes.js";
/** Experiment artifact models, persistence, and exporters. */
export { createArtifactMetadataDocument, createExperimentArtifactBundle, } from "./artifacts/artifactBundle.js";
export { readExperimentArtifacts } from "./artifacts/artifactReader.js";
export { EXPERIMENT_ARTIFACT_FILE_KINDS, EXPERIMENT_ARTIFACT_FORMATS, EXPERIMENT_ARTIFACT_KINDS, EXPERIMENT_ARTIFACT_VERSION, } from "./artifacts/artifactTypes.js";
export type { ArtifactExportOptions, ArtifactFileContents, ArtifactWriteOptions, ArtifactWriteResult, ExperimentArtifactBundle, ExperimentArtifactBundleInput, ExperimentArtifactFile, ExperimentArtifactFileKind, ExperimentArtifactFormat, ExperimentArtifactKind, ExperimentArtifactMetadataDocument, ExperimentArtifactValidationResult, ExperimentMetadata, LoadedExperimentArtifactFile, LoadedExperimentArtifacts, TelemetrySummary, } from "./artifacts/artifactTypes.js";
export { DEFAULT_ARTIFACT_ROOT, sanitizeArtifactPathSegment, writeExperimentArtifacts, } from "./artifacts/artifactWriter.js";
export { isSafeRelativeArtifactPath, validateExperimentArtifactBundle, } from "./artifacts/artifactValidator.js";
export { createFleetTelemetrySummary, exportFleetRunArtifacts, } from "./artifacts/fleetArtifactExporter.js";
export { exportCustomEvidenceArtifacts } from "./artifacts/customEvidenceArtifactExporter.js";
export { createScenarioTelemetrySummary, exportScenarioRunArtifacts, } from "./artifacts/scenarioArtifactExporter.js";
export type { CustomEvidenceArtifactExportInput, CustomEvidenceReport, CustomEvidenceReportInput, } from "./artifacts/artifactTypes.js";
/** Canonical evidence manifests, lineage queries, and provenance coverage. */
export { addEvidenceEntry, addEvidenceRelationship, buildEvidenceManifestFromArtifactBundle, buildFleetEvidenceManifest, buildScenarioEvidenceManifest, createEvidenceManifest, createEvidenceManifestEntry, createEvidenceRelationship, deserializeEvidenceManifest, serializeEvidenceManifest, } from "./evidence/evidenceManifestBuilder.js";
export type { CreateEvidenceManifestInput, EvidenceManifestEntryInput, EvidenceRelationshipInput, } from "./evidence/evidenceManifestBuilder.js";
export { findEvidenceByKind, findEvidenceByProvenance, findEvidenceByRobot, traceEvidenceAncestors, traceEvidenceDescendants, } from "./evidence/evidenceLineage.js";
export { renderProvenanceCoverageReport, summarizeProvenanceCoverage, } from "./evidence/evidenceCoverage.js";
export { renderEvidenceManifestReport } from "./evidence/evidenceManifestReport.js";
export { EVIDENCE_FORMATS, EVIDENCE_KINDS, EVIDENCE_MANIFEST_VERSION, EVIDENCE_RELATIONSHIP_TYPES, } from "./evidence/evidenceManifestTypes.js";
export type { EvidenceFormat, EvidenceKind, EvidenceManifest, EvidenceManifestEntry, EvidenceManifestValidationResult, EvidenceRelationship, EvidenceRelationshipType, ProvenanceCoverageSummary, } from "./evidence/evidenceManifestTypes.js";
export { isSafeRelativeEvidencePath, validateEvidenceManifest, } from "./evidence/evidenceManifestValidator.js";
/** Pure terminal and text report renderers. */
export type { ConsoleReport, EventTimelineOptions, } from "./console/consoleTypes.js";
export { renderEventTimeline } from "./console/eventTimeline.js";
export { renderFaultReport } from "./console/faultReport.js";
export { formatPercent, formatRobotState, formatTemperature, formatTimestampMs, formatVoltage, } from "./console/formatters.js";
export { renderReplayReport } from "./console/replayReport.js";
export { renderScenarioReport } from "./console/scenarioReport.js";
export { renderTelemetrySnapshot } from "./console/telemetryReport.js";
/** Deterministic telemetry event contracts and streams. */
export { TELEMETRY_EVENT_TYPES } from "./events/eventTypes.js";
export type { FaultInjectedPayload, StateChangedPayload, StreamLifecyclePayload, TelemetryEvent, TelemetryEventHandler, TelemetryEventType, TelemetrySnapshotPayload, } from "./events/eventTypes.js";
export { TelemetryStream } from "./events/telemetryStream.js";
export type { TelemetryStreamStatus } from "./events/telemetryStream.js";
/** Fault models and deterministic fault application. */
export { FaultInjector } from "./faults/faultInjector.js";
export { FAULT_TYPES } from "./faults/faultTypes.js";
export type { Fault, FaultType } from "./faults/faultTypes.js";
/** Deterministic multi-robot scenarios and fleet replay. */
export { BUILT_IN_FLEET_SCENARIO_IDS, BUILT_IN_FLEET_SCENARIOS, getBuiltInFleetScenario, } from "./fleet/builtInFleetScenarios.js";
export type { BuiltInFleetScenarioId } from "./fleet/builtInFleetScenarios.js";
export { createFleetReplayLog, deserializeFleetReplayLog, FLEET_REPLAY_LOG_VERSION, serializeFleetReplayLog, validateFleetReplayLog, } from "./fleet/fleetReplay.js";
export { renderFleetReplayReport, renderFleetScenarioReport, } from "./fleet/fleetReport.js";
export { FleetScenarioRunner, runFleetScenario, } from "./fleet/fleetScenarioRunner.js";
export type { FleetReplayLog, FleetReplayValidationResult, FleetRobotProfile, FleetScenarioProfile, FleetScenarioRunResult, FleetScenarioRunSummary, FleetValidationResult, } from "./fleet/fleetTypes.js";
export { validateFleetScenario } from "./fleet/fleetValidator.js";
/** Hardware adapter contracts, virtual adapters, and adapter telemetry. */
export { AdapterTelemetryCollector } from "./hardware/adapterTelemetryCollector.js";
export type { AdapterTelemetryCollectorOptions, TelemetryCollectionTimestamp, } from "./hardware/adapterTelemetryCollector.js";
export { ADAPTER_EVENT_TYPES } from "./hardware/adapterEventTypes.js";
export type { AdapterEventPayload, AdapterEventType, AdapterReadingChangedPayload, AdapterStatusChangedPayload, AdapterStreamLifecyclePayload, AdapterTelemetryEvent, AdapterTelemetryEventHandler, AdapterTelemetrySnapshotPayload, } from "./hardware/adapterEventTypes.js";
export { AdapterTelemetryStream } from "./hardware/adapterTelemetryStream.js";
export type { AdapterTelemetryStreamOptions, AdapterTelemetryStreamStatus, } from "./hardware/adapterTelemetryStream.js";
export { validateHardwareAdapter } from "./hardware/adapterValidator.js";
export type { HardwareAdapter, SteppableHardwareAdapter, } from "./hardware/hardwareAdapter.js";
export { HARDWARE_ADAPTER_STATUSES } from "./hardware/hardwareTypes.js";
export type { BatteryReading, HardwareAdapterInfo, HardwareAdapterStatus, HardwareAdapterValidationResult, ImuReading, MotorReading, SystemReading, } from "./hardware/hardwareTypes.js";
export { VirtualBatteryAdapter } from "./hardware/virtualBatteryAdapter.js";
export type { VirtualBatteryAdapterOptions } from "./hardware/virtualBatteryAdapter.js";
export { VirtualImuAdapter } from "./hardware/virtualImuAdapter.js";
export type { VirtualImuAdapterOptions } from "./hardware/virtualImuAdapter.js";
export { VirtualMotorAdapter } from "./hardware/virtualMotorAdapter.js";
export type { VirtualMotorAdapterOptions } from "./hardware/virtualMotorAdapter.js";
export { VirtualSystemAdapter } from "./hardware/virtualSystemAdapter.js";
export type { VirtualSystemAdapterOptions } from "./hardware/virtualSystemAdapter.js";
/** Snapshot serialization utility. */
export { snapshotToJson } from "./output/jsonOutput.js";
/** Replay recording, validation, serialization, and playback. */
export { deserializeReplayLog, REPLAY_LOG_VERSION, serializeReplayLog, } from "./replay/replayLog.js";
export type { ReplayLog } from "./replay/replayLog.js";
export { ReplayPlayer } from "./replay/replayPlayer.js";
export type { ReplayPlayerStatus } from "./replay/replayPlayer.js";
export { ReplayRecorder } from "./replay/replayRecorder.js";
export type { ReplayRecorderOptions, ReplayRecorderStatus, } from "./replay/replayRecorder.js";
export { validateReplayLog } from "./replay/replayValidator.js";
export type { ReplayValidationResult } from "./replay/replayValidator.js";
/** Immutable, deterministic evidence provenance and descriptive ownership. */
export { appendTransformation, createAdapterProvenance, createDerivedProvenance, createImporterProvenance, createManualProvenance, createProvenance, createReplayProvenance, createSimulationProvenance, createTelemetryProvenance, deriveProvenance, } from "./provenance/provenanceBuilder.js";
export type { CreateProvenanceInput, CreateTypedProvenanceInput, DeriveProvenanceOptions, ProvenanceStepInput, } from "./provenance/provenanceBuilder.js";
export { createDeterministicProvenanceId, deterministicProvenanceStringify, provenanceTimestampToIso, toImmutableProvenanceValue, } from "./provenance/provenanceHelpers.js";
export { createEvidenceOwnership, DEFAULT_EVIDENCE_OWNERSHIP, } from "./provenance/provenanceOwnership.js";
export { renderProvenanceReport } from "./provenance/provenanceReport.js";
export { EVIDENCE_OWNER_TYPES, EVIDENCE_PROVENANCE_VERSION, EVIDENCE_VISIBILITIES, PROVENANCE_VERSION, PROVENANCE_CONFIDENCE_LEVELS, PROVENANCE_SOURCE_TYPES, } from "./provenance/provenanceTypes.js";
export type { EvidenceOwnerType, EvidenceOwnership, EvidenceProvenance, EvidenceVisibility, ProvenanceConfidence, ProvenanceSourceType, ProvenanceStep, ProvenanceValidationResult, } from "./provenance/provenanceTypes.js";
export { validateEvidenceProvenance, validateProvenance, } from "./provenance/provenanceValidator.js";
/** Reusable deterministic single-robot scenarios. */
export { BUILT_IN_SCENARIO_IDS, BUILT_IN_SCENARIOS, getBuiltInScenario, } from "./scenarios/builtInScenarios.js";
export type { BuiltInScenarioId } from "./scenarios/builtInScenarios.js";
export { runScenario, ScenarioRunner, } from "./scenarios/scenarioRunner.js";
export type { ScenarioProfile, ScenarioRunResult, ScenarioRunSummary, ScenarioValidationResult, ScheduledFault, } from "./scenarios/scenarioTypes.js";
export { validateScenarioProfile } from "./scenarios/scenarioValidator.js";
/** Deterministic robot simulation and seeded random generation. */
export { RobotSimulator } from "./simulator/robotSimulator.js";
export type { RobotSimulatorOptions } from "./simulator/robotSimulator.js";
export { createSeededRandom } from "./simulator/seed.js";
export type { RandomSource } from "./simulator/seed.js";
export type { ImuTelemetry, TelemetrySnapshot, Vector3, } from "./types.js";
/** Simulator/telemetry lifecycle status; called `RobotState` before v1.1. */
export type { RobotState as RobotOperatingMode } from "./types.js";
/** Derived global fleet timelines, queries, validation, and reports. */
export { deserializeFleetEventTimeline, serializeFleetEventTimeline, } from "./timeline/timelineArtifacts.js";
export { buildFleetEventTimeline } from "./timeline/timelineBuilder.js";
export { filterTimelineByEventType, filterTimelineByRobot, filterTimelineByTimeRange, getTimelineEventByFleetSequence, summarizeTimelineByEventType, summarizeTimelineByRobot, } from "./timeline/timelineQueries.js";
export { renderFleetTimelineReport, renderFleetTimelineSummary, } from "./timeline/timelineReport.js";
export { FLEET_EVENT_TIMELINE_VERSION, } from "./timeline/timelineTypes.js";
export type { FleetEventTimeline, FleetTimelineBuildOptions, FleetTimelineValidationResult, GlobalFleetEvent, } from "./timeline/timelineTypes.js";
export { validateFleetEventTimeline, } from "./timeline/timelineValidator.js";
/** Immutable digital-twin structure and deterministic JSON primitives. */
export { deterministicEqual, deterministicStringify, parseImmutableJson, toImmutableJson, } from "./digitalTwin/deterministicJson.js";
export type { JsonPrimitive, JsonValue, } from "./digitalTwin/deterministicJson.js";
export { createRobot, deserializeRobot, DIGITAL_TWIN_MODEL_VERSION, serializeRobot, STANDARD_JOINT_TYPES, } from "./digitalTwin/model.js";
export type { Actuator, Attachment, CoordinateFrame, Joint, JointLimit, Link, Quaternion, Robot, RobotInput, RobotMetadata, Sensor, StandardJointType, Transform, Vector3 as DigitalTwinVector3, } from "./digitalTwin/model.js";
/** Complete immutable robot state snapshots. */
export { createRobotState, deserializeRobotState, ROBOT_OPERATING_MODES, ROBOT_STATE_VERSION, robotStatesEqual, serializeRobotState, } from "./digitalTwin/robotState.js";
export type { BatteryStatus, CanonicalRobotOperatingMode, HealthIndicator, JointState, Pose, RobotState, RobotStateInput, } from "./digitalTwin/robotState.js";
/** Deterministic environment metadata. */
export { createScene, deserializeScene, SCENE_MODEL_VERSION, serializeScene, STANDARD_SCENE_TYPES, } from "./digitalTwin/scene.js";
export type { Landmark, Scene, SceneAnnotation, SceneCoordinateSystem, SceneInput, SceneRegion, StandardSceneType, StaticObstacle, } from "./digitalTwin/scene.js";
/** Ordered markers for replay inspection and future visualization. */
export { compareReplayEvents, createReplayEvent, deserializeReplayEvents, REPLAY_EVENT_VERSION, serializeReplayEvents, STANDARD_REPLAY_EVENT_TYPES, } from "./digitalTwin/replayEvent.js";
export type { ReplayEvent, ReplayEventInput, StandardReplayEventType, } from "./digitalTwin/replayEvent.js";
/** Robot-state timeline reconstruction, persistence, and inspection. */
export { createTwinTimeline, deserializeTwinTimeline, reconstructTwinTimeline, serializeTwinTimeline, TWIN_REPLAY_CURSOR_STATE_VERSION, TWIN_TIMELINE_VERSION, TwinReplayCursor, } from "./digitalTwin/twinTimeline.js";
export type { RobotStateReconstructor, TwinTelemetryRecord, TwinTimeline, TwinTimelineInput, TwinReplayCursorState, } from "./digitalTwin/twinTimeline.js";
/** Machine-readable digital-twin schemas and v1.1 compatibility fixtures. */
export { DIGITAL_TWIN_FIXTURE_VERSION_V1_1, robotStateFixtureV1_1, sceneModelFixtureV1_1, twinTimelineFixtureV1_1, } from "./digitalTwin/fixtures.js";
export { robotStateSchema, sceneModelSchema, twinTimelineSchema, validateDigitalTwinSchema, validateRobotStateSchema, validateSceneModelSchema, validateTwinTimelineSchema, } from "./digitalTwin/schemaValidation.js";
export type { DigitalTwinSchemaName, SchemaValidationIssue, SchemaValidationResult, } from "./digitalTwin/schemaValidation.js";
/** Explicit deterministic telemetry/replay to canonical-state bridges. */
export { buildTwinTimelineFromReplay, buildTwinTimelineFromTelemetry, defaultReplayEventMapper, defaultTelemetrySnapshotMapper, mapReplayEventToState, mapTelemetrySnapshotToState, TELEMETRY_BRIDGE_SOURCES, } from "./digitalTwin/telemetryBridge.js";
export type { CanonicalRobotState, TelemetryBridgeBuildOptions, TelemetryBridgeContext, TelemetryBridgeMapOptions, TelemetryBridgeSource, TelemetryToStateMapper, } from "./digitalTwin/telemetryBridge.js";
/** Rule-based deterministic digital-twin evidence diagnostics. */
export { createTwinDiagnosticReport, renderTwinDiagnosticReport, runTwinDiagnostics, TWIN_DIAGNOSTIC_SEVERITIES, validateRobotState, validateTwinTimeline, } from "./digitalTwin/twinDiagnostics.js";
export type { TwinDiagnostic, TwinDiagnosticOptions, TwinDiagnosticReport, TwinDiagnosticSeverity, } from "./digitalTwin/twinDiagnostics.js";
/** Derived multi-robot state views for future visualization consumers. */
export { createMultiRobotTwinView, getRobotTwinTimeline, getTwinStatesAtTime, MULTI_ROBOT_TWIN_VIEW_VERSION, summarizeMultiRobotTwinView, validateMultiRobotTwinView, } from "./digitalTwin/multiRobotTwinView.js";
export type { MultiRobotTwinView, MultiRobotTwinViewOptions, MultiRobotTwinViewSummary, } from "./digitalTwin/multiRobotTwinView.js";
/** Future platform extension points; no integrations are implemented. */
export type { DigitalTwinContext, FleetVisualization, GazeboAdapter, NVIDIAIsaacAdapter, PhysicsEngine, PlatformAdapterInfo, Renderer, RoboticsPlatformAdapter, ROSAdapter, SimulationRuntime, UnityAdapter, UnrealAdapter, } from "./digitalTwin/platform.js";
