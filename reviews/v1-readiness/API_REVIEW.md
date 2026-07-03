# API Review

## Executive assessment

The public API is usable and strongly typed, and every test imports through
`src/index.ts`, which provides unusually good coverage of export visibility.
The main risk is not missing capability; it is that the 241-line barrel makes
almost every constant, formatter, serializer, path helper, model, runner, and
implementation class equally public.

The project needs a declared support policy and an intentional export list
before v1. A v1 release should not freeze the current surface by accident.

## Public surface overview

The root entry point exposes these families:

- Simulation: `RobotSimulator`, seeded randomness, snapshots, states, faults.
- Streams: `TelemetryStream`, adapter streams, event and payload types.
- Replay: recorder, player, log serialization, validation, versions.
- Scenarios: profiles, runners, built-ins, validation, result types.
- Fleet: profiles, runner, replay wrapper, reports, validation, built-ins.
- Clocks: four implementations, contracts, options, validation.
- Hardware: adapter contracts, reading types, collector, virtual adapters.
- Timeline: builder, model, validation, queries, serialization, reports.
- Artifacts: bundle construction, validation, read/write, exporters, types.
- Console/output: report functions, individual formatters, JSON conversion.

This is discoverable by scanning the file, but there is no conceptual grouping
in generated API documentation and no stability annotation.

## APIs that feel v1-ready

These APIs have focused responsibilities, strong examples, and substantial
tests:

- `RobotSimulator`, `RobotSimulatorOptions`, `TelemetrySnapshot`,
  `RobotState`.
- `Fault`, `FaultType`, `FaultInjector`.
- `TelemetryStream`, `TelemetryEvent`, `TelemetryEventType`.
- `ReplayRecorder`, `ReplayPlayer`, `ReplayLog`, and replay validation,
  subject to the boundary hardening below.
- `ScenarioProfile`, `ScenarioRunner`, `runScenario`,
  `validateScenarioProfile`.
- `FleetScenarioProfile`, `FleetScenarioRunner`, `runFleetScenario`,
  `FleetReplayLog`.
- `HardwareAdapter<TReading>`, the four reading contracts,
  `AdapterTelemetryCollector`, and virtual adapter implementations.
- `SimulationClock`, `LogicalClock`, `ReplayClock`, `FleetClock`, and
  `DeterministicClock`, once ownership semantics are made normative.
- `buildFleetEventTimeline`, timeline queries, and timeline reports.
- Scenario/fleet artifact exporters and artifact reader/writer for a
  documented Node-only persistence surface.
- Pure report renderers.

## APIs that still feel experimental

- `AdapterTelemetryStream`: useful and well tested, but its event typing,
  reading-change behavior, and hardware event integration are newer and need
  stronger contract documentation.
- `FleetEventTimeline` and `GlobalFleetEvent`: the model is good, but format
  version and canonical-order validation are incomplete.
- Generic artifact bundle construction and discovery fallback: exporters are
  clearer than the lower-level assembly API.
- `ClockInfo.metadata` and `ExperimentMetadata.clock`: useful but loosely
  typed and not fully connected to runner outputs.
- Public format-version constants: they are appropriate to expose only if
  version compatibility behavior is defined.
- Broad `Record<string, unknown>` metadata hooks: practical, but their
  cloneability/serializability requirements are implicit.

## Exports to document as stable public API

At minimum, document and support:

1. Core models: snapshots, states, faults, events, replay logs, scenario and
   fleet profiles/results, timelines, artifact metadata.
2. Primary operations: simulate, stream, record, validate, replay, run a
   scenario/fleet, build/query a timeline, render, export/read artifacts.
3. Extension contracts: deterministic clocks and hardware adapters.
4. Built-in scenario discovery functions and IDs.
5. Serialization functions and their compatibility/error behavior.

For every public class, document lifecycle state, idempotency, mutation
ownership, thrown errors, and whether methods advance time.

## Exports that may belong to an advanced or internal surface

These exports are not necessarily bad, but freezing them at the root raises
maintenance cost:

- `createSeededRandom` and `RandomSource`.
- Individual console formatters such as `formatVoltage`.
- `sanitizeArtifactPathSegment`, `isSafeRelativeArtifactPath`, and
  `DEFAULT_ARTIFACT_ROOT`.
- `createArtifactMetadataDocument` and
  `createExperimentArtifactBundle`.
- Raw arrays such as `BUILT_IN_SCENARIOS` and
  `BUILT_IN_FLEET_SCENARIOS`, which expose the full mutable runtime value even
  though the getter already returns defensive copies.
- Low-level `ConsoleReport` alias.
- Separate serializer functions if the intended public path is validated
  loading rather than unchecked casting.

Before v1, either keep these and explicitly promise compatibility, move them
to documented subpath exports, or remove them. Do not silently treat root
presence as an implementation detail after v1.

## Important missing API contract information

The problem is primarily documentation, not missing functions:

- Units and valid ranges for every telemetry and adapter reading.
- Whether timestamps are epoch milliseconds or elapsed milliseconds in each
  context.
- Whether sequences must start at one and remain contiguous.
- Event and payload immutability/ownership.
- Supported serialized format versions and forward/backward compatibility.
- Whether deserializers validate or merely parse.
- Subscriber exception behavior and subscription delivery order.
- Metadata requirements: cloneable, JSON-serializable, or arbitrary values.
- Node-only status of filesystem artifact APIs.
- Clock ownership and whether one clock may be reused across runs.
- Reset/reuse behavior for runners, players, streams, and recorders.

## Type-safety findings

Strengths:

- `strict`, `noUncheckedIndexedAccess`, and
  `exactOptionalPropertyTypes` are enabled.
- Domain readings are separate interfaces.
- Literal arrays derive event, fault, adapter status, and clock-kind unions.
- Optional properties are handled carefully when objects are constructed.
- Tests compile against the root barrel.

Weaknesses:

- `TelemetryEvent.payload` is `unknown`, so event `type` does not narrow the
  payload. The separately exported payload interfaces do not form a
  discriminated union.
- Deserializers cast parsed objects to domain types after only checking the
  root object.
- `FleetEventTimeline.clockKind` and build options use `string` rather than
  `ClockKind`.
- Metadata types permit values that `structuredClone` or JSON serialization
  may reject or transform.
- Adapter event types intersect a broad `TelemetryEvent` with narrower fields
  instead of deriving from a shared discriminated event base.

The highest-value type improvement is a discriminated event union, but it
could be a broad breaking change. Decide before v1; do not attempt it casually
after the API freezes.

## Naming and ergonomics

Naming is generally descriptive and consistent. `runScenario` /
`ScenarioRunner`, `runFleetScenario` / `FleetScenarioRunner`, `render*`,
`validate*`, and `serialize*` are easy to predict.

Inconsistencies:

- `TelemetryStream` receives its optional clock as a second constructor
  argument; `AdapterTelemetryStream` receives it inside options.
- `TelemetryStream` has no `getSequence`, while `AdapterTelemetryStream` does.
- `ReplayClock` adds `advanceToNextEvent` outside the shared clock contract.
- Some validation messages use sentence punctuation/capitalization and clock
  validation messages do not.
- "timestamp" alternates between an ISO string on snapshots and a number on
  events without a naming cue.
- "replay" means exact event-order playback, not timestamp-scheduled playback;
  that distinction needs to be prominent.

These are manageable if documented. Constructor consistency and timestamp
naming are the only potential breaking changes worth evaluating before v1.

## Breaking changes worth considering before v1

1. Replace the broad event interface with a discriminated union or introduce
   a compatible typed mapping that makes payload narrowing reliable.
2. Type timeline `clockKind` as `ClockKind`.
3. Decide whether low-level helpers and raw built-in arrays remain root
   exports.
4. Standardize optional clock injection if the resulting ergonomics justify
   the migration.
5. Make deserialization return validated data or use explicit names such as
   `parseUnchecked*`.

The first, third, and fifth decisions are worth making now because they are
expensive after v1. None should be implemented without a migration note and
API compatibility tests.

## Can users understand the SDK from `src/index.ts`?

An experienced TypeScript user can infer the capability map, but not the
recommended path. The entry point is exhaustive rather than explanatory.
Generated API documentation or a hand-maintained public API reference should
group exports by workflow and label advanced utilities.

## API verdict

The core workflows are close to v1 quality. The surface is not ready to freeze
until export scope, serialized compatibility, event ownership, payload typing,
and lifecycle/error semantics are explicitly decided.
