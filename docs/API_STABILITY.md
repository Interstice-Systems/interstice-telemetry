# API Stability

For the v1 release-candidate classification, see
[Public API Freeze for v1](API_FREEZE_V1.md). That document supersedes this
historical 0.12 classification where they differ.

Interstice Telemetry 0.12 classifies every export from `src/index.ts` before
the v1 contract is frozen. No exports were removed in this release.

## Stability levels

### Stable public API

Stable exports are the intended v1 foundation. Before 1.0, changes should be
additive whenever practical. A necessary breaking correction requires release
notes and a migration path. At and after 1.0, these exports follow semantic
versioning.

Stable families:

- Core telemetry: `TelemetrySnapshot`, `ImuTelemetry`, `Vector3`,
  `RobotState`.
- Simulation: `RobotSimulator`, `RobotSimulatorOptions`.
- Faults: `FaultInjector`, `Fault`, `FaultType`, `FAULT_TYPES`.
- Telemetry streams: `TelemetryStream`, `TelemetryStreamStatus`,
  `TelemetryEvent`, `TelemetryEventType`, `TelemetryEventHandler`, the
  simulator-stream payload types, and `TELEMETRY_EVENT_TYPES`.
- Replay: `ReplayLog`, `ReplayRecorder`, `ReplayPlayer`, their options/status
  types, `REPLAY_LOG_VERSION`, replay serialization, and replay validation.
- Scenarios: `ScenarioProfile`, `ScheduledFault`, result/summary/validation
  types, `ScenarioRunner`, `runScenario`, `validateScenarioProfile`,
  `BUILT_IN_SCENARIO_IDS`, `BuiltInScenarioId`, and
  `getBuiltInScenario`.
- Fleet execution: fleet profile/result/summary/validation/replay types,
  `FleetScenarioRunner`, `runFleetScenario`, `validateFleetScenario`,
  fleet replay functions, `FLEET_REPLAY_LOG_VERSION`,
  `BUILT_IN_FLEET_SCENARIO_IDS`, `BuiltInFleetScenarioId`, and
  `getBuiltInFleetScenario`.
- Clocks: `DeterministicClock`, clock information/options/validation types,
  all four clock implementations and their option types, `ClockKind`,
  `CLOCK_KINDS`, and `validateClock`.
- Adapter contracts: `HardwareAdapter`, `SteppableHardwareAdapter`, adapter
  information/status/validation types, domain reading types,
  `HARDWARE_ADAPTER_STATUSES`, `validateHardwareAdapter`,
  `AdapterTelemetryCollector`, and all virtual adapters.
- High-level artifacts: artifact metadata/bundle/file/result types,
  `EXPERIMENT_ARTIFACT_VERSION`, artifact kind/format constants and types,
  `validateExperimentArtifactBundle`, `writeExperimentArtifacts`,
  `readExperimentArtifacts`, `exportScenarioRunArtifacts`, and
  `exportFleetRunArtifacts`.
- Reports: `renderTelemetrySnapshot`, `renderEventTimeline`,
  `renderFaultReport`, `renderReplayReport`, `renderScenarioReport`,
  `renderFleetScenarioReport`, and `renderFleetReplayReport`.
- Output: `snapshotToJson`.

Stable means the API is intended to survive into v1. It does not mean every
serialized input is trusted: callers must use the corresponding validator
after deserialization. See [API](API.md) and [Determinism](DETERMINISM.md).

## Experimental public API

Experimental exports are public and supported during the 0.x line, but their
types or detailed behavior may change before v1 based on compatibility
hardening. Changes require release notes.

### Adapter event streams

- `ADAPTER_EVENT_TYPES`
- `AdapterEventType`, `AdapterEventPayload`
- `AdapterStreamLifecyclePayload`
- `AdapterTelemetrySnapshotPayload`
- `AdapterStatusChangedPayload`
- `AdapterReadingChangedPayload`
- `AdapterTelemetryEvent`, `AdapterTelemetryEventHandler`
- `AdapterTelemetryStream`, `AdapterTelemetryStreamOptions`,
  `AdapterTelemetryStreamStatus`

The event strings and manual-step model are expected to remain. Payload typing,
ownership rules, and integration with the shared event taxonomy may be refined
before v1.

### Global fleet timelines

- `FLEET_EVENT_TIMELINE_VERSION`
- `GlobalFleetEvent`, `FleetEventTimeline`
- `FleetTimelineBuildOptions`, `FleetTimelineValidationResult`
- `buildFleetEventTimeline`
- timeline serialization and validation
- all timeline query and report functions

The derived-timeline model and ordering rule are expected to remain. Loaded
format validation and some field types may be tightened before v1.

### Clock and artifact metadata extensions

The `metadata` fields on clock, replay, timeline, scenario, fleet, and artifact
models are supported extension points, but their accepted content may be
restricted to structured-cloneable and JSON-serializable values before v1.
`ExperimentMetadata.clock` is experimental while clock provenance is refined.

## Internal candidates retained as public

These low-level exports remain available in 0.12 to avoid an unnecessary
prerelease break. New applications should prefer the stable high-level
workflow beside each item.

| Internal candidate | Preferred public workflow |
|---|---|
| `createSeededRandom`, `RandomSource` | Configure `RobotSimulator` with `seed` |
| `BUILT_IN_SCENARIOS` | `BUILT_IN_SCENARIO_IDS` and `getBuiltInScenario` |
| `BUILT_IN_FLEET_SCENARIOS` | `BUILT_IN_FLEET_SCENARIO_IDS` and `getBuiltInFleetScenario` |
| `createArtifactMetadataDocument` | Scenario/fleet artifact exporters |
| `createExperimentArtifactBundle` | Scenario/fleet artifact exporters |
| `sanitizeArtifactPathSegment` | Artifact writer/exporters |
| `isSafeRelativeArtifactPath` | Artifact validation |
| `DEFAULT_ARTIFACT_ROOT` | Explicit `rootDir` option |
| `createScenarioTelemetrySummary` | `exportScenarioRunArtifacts` |
| `createFleetTelemetrySummary` | `exportFleetRunArtifacts` |
| `formatPercent`, `formatVoltage`, `formatTemperature`, `formatTimestampMs`, `formatRobotState` | Report renderers |
| `ConsoleReport` | `string` or a report renderer return type |

These exports may move to a subpath, become explicitly advanced, or be removed
in a documented prerelease. They are not accidental, and 0.12 does not
deprecate them.

## Deprecated candidates

There are no deprecated exports in 0.12. An export will not be labeled
deprecated without:

1. a supported replacement,
2. a JSDoc `@deprecated` notice,
3. a changelog entry, and
4. at least one prerelease migration window before v1.

## Semantic versioning expectations

Until 1.0:

- Patch releases fix defects without intentionally changing documented
  behavior.
- Minor releases may tighten validation or change experimental/internal
  candidates.
- Necessary changes to stable exports require explicit migration notes.
- Serialized format versions are independent from the npm package version.

At and after 1.0:

- Removing or incompatibly changing a stable export requires a major release.
- Additive exports and backward-compatible capabilities may use a minor
  release.
- Compatible fixes use a patch release.
- Experimental APIs remain exempt only when their experimental status is
  clear in API documentation and release notes.

## How applications should depend on the SDK

- Import from `"interstice-telemetry"`, not `dist` or source file paths.
- Prefer stable workflow functions and contracts.
- Validate deserialized replay, fleet, timeline, and artifact values before
  use.
- Avoid depending on object identity, undocumented report spacing, validator
  error wording, or iteration order not stated in the docs.
- Pin an exact 0.x version for production use or review minor-release notes
  before upgrading.
- Keep experimental use behind a local adapter so a prerelease migration is
  contained.

## Change process

Changes to stable exports must include tests, API documentation, and a
changelog entry. Before v1, the generated declarations in `dist/index.d.ts`
should be reviewed as part of every release candidate.
