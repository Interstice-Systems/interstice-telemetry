# API Reference

Interstice Telemetry is an ESM TypeScript SDK for Node.js 20 or newer. Import
public APIs from the package root:

```ts
import {
  getBuiltInScenario,
  renderScenarioReport,
  runScenario,
} from "interstice-telemetry";
```

This reference groups the root exports by workflow. Stability classifications
are defined in [API Stability](API_STABILITY.md). Deterministic behavior is
defined in [Determinism](DETERMINISM.md).

## Simulation and telemetry

### `RobotSimulator`

Creates deterministic telemetry snapshots from an explicit configuration and
sequence of method calls.

```ts
const simulator = new RobotSimulator({
  robotId: "rover-1",
  seed: 42,
  startTime: 0,
  initialState: "active",
});

const snapshot = simulator.step(1_000);
```

Important methods:

- `step(milliseconds)` advances simulation time and returns a snapshot.
- `getSnapshot()` returns the current fault-adjusted snapshot.
- `setState(state)` changes operating state.
- `injectFault(fault)`, `clearFault(type)` control active faults.

`step` requires a positive finite duration. Snapshot timestamps are ISO 8601
strings. Percentages use a 0–100 scale, motor speeds use RPM, temperatures use
degrees Celsius, voltage uses volts, and signal strength uses dBm.

Core types: `TelemetrySnapshot`, `ImuTelemetry`, `Vector3`, `RobotState`,
`RobotSimulatorOptions`.

### Faults

`FaultInjector` applies `Fault` values without changing baseline simulator
evolution. Supported `FaultType` values are exposed by `FAULT_TYPES`.

## Telemetry event streams

`TelemetryStream` wraps a simulator with a synchronous, manually stepped event
lifecycle.

```ts
const stream = new TelemetryStream(simulator);
const unsubscribe = stream.subscribe((event) => {
  console.log(event.sequence, event.type);
});

stream.start();
stream.step(1_000);
stream.stop();
unsubscribe();
```

`start` and `stop` are idempotent. `step` returns `undefined` while stopped.
Handlers run synchronously in subscription order and each receives an
independent event copy. A handler exception propagates to the caller and stops
the current delivery loop.

Events have numeric millisecond timestamps and per-stream sequences.
`TelemetryEvent.payload` is `unknown`; use `event.type` plus runtime checks or
the exported payload interfaces.

## Replay

### `ReplayRecorder`

Records events while active. Its bound `record` method can be subscribed
directly to a stream.

### `ReplayPlayer`

Emits recorded events synchronously in log order. `step()` emits one event
while running; `playAll()` emits all remaining events. Playback is not paced
according to timestamps.

### Serialization and validation

- `serializeReplayLog(log)` produces compact JSON.
- `deserializeReplayLog(json)` parses and checks only that the root is an
  object.
- `validateReplayLog(value)` performs structural validation.

Always validate externally loaded data before playback. The current replay
format is identified by `REPLAY_LOG_VERSION`.

## Scenarios

`ScenarioProfile` describes one deterministic run: identity, seed, initial
state, duration, step interval, and scheduled faults.

```ts
const profile = getBuiltInScenario("motor-overheat");
if (!profile) throw new Error("Unknown scenario");

const result = runScenario(profile);
console.log(renderScenarioReport(result));
```

Use `validateScenarioProfile` for untrusted profiles. `ScenarioRunner` is the
class form of `runScenario`. Built-in discovery uses
`BUILT_IN_SCENARIO_IDS` and `getBuiltInScenario`.

`ScenarioRunResult` includes final telemetry, all events, a replay log,
validation results, and a summary.

## Fleet scenarios

`FleetScenarioProfile` composes single-robot scenarios under one duration and
step interval. `runFleetScenario` steps robots synchronously in sorted robot-ID
order and preserves one replay log per robot.

```ts
const profile = getBuiltInFleetScenario("mixed-fault-fleet");
if (!profile) throw new Error("Unknown fleet scenario");

const result = runFleetScenario(profile);
console.log(renderFleetScenarioReport(result));
```

Use `validateFleetScenario` before execution. Fleet replay helpers create,
validate, serialize, and deserialize the `FleetReplayLog` wrapper.

## Deterministic clocks

All clocks implement `DeterministicClock`:

- `SimulationClock`: caller-provided elapsed time.
- `LogicalClock`: explicit steps plus fixed-size `tick()`.
- `ReplayClock`: navigation across replay event timestamps.
- `FleetClock`: one global time basis for a fleet run.

Clocks do not schedule work or read wall time. A clock passed to
`TelemetryStream`, `AdapterTelemetryStream`, or `ScenarioRunner` is advanced
by that component on successful running steps. `FleetScenarioRunner` advances
its clock once after all robots complete a global step. `ReplayPlayer` advances
a supplied `ReplayClock` with its cursor.

Do not share one mutable clock between concurrently controlled components.

## Hardware adapters

`HardwareAdapter<TReading>` defines synchronous `getInfo()` and `read()`
operations. `SteppableHardwareAdapter<TReading>` adds explicit deterministic
advancement.

Reading domains:

- `BatteryReading`
- `MotorReading`
- `ImuReading`
- `SystemReading`

`AdapterTelemetryCollector` maps one adapter from each domain to a
`TelemetrySnapshot`. Virtual battery, motor, IMU, and system adapters provide
deterministic in-memory implementations.

`AdapterTelemetryStream` adds manually stepped adapter events and remains
experimental before v1. It does not poll hardware or run background work.

## Global fleet timelines

`buildFleetEventTimeline` derives a global ordered view from a
`FleetReplayLog`. Source replay logs remain authoritative.

Canonical ordering is:

1. numeric timestamp,
2. robot ID,
3. per-robot sequence,
4. event ID.

`fleetSequence` is assigned after sorting, starting at one.

Queries filter by robot, event type, or inclusive time range; retrieve a fleet
sequence; and summarize counts. Timeline serialization, validation, and report
functions are experimental until their loaded-format contract is frozen.

## Artifacts

High-level exporters persist complete scenario or fleet evidence:

- `exportScenarioRunArtifacts`
- `exportFleetRunArtifacts`
- `readExperimentArtifacts`

Artifact persistence is synchronous, local-filesystem, Node-only behavior.
Writers refuse to replace an existing experiment unless `overwrite: true` is
set. Replacement is not atomic.

Low-level bundle construction and path helpers are internal candidates. Prefer
the exporters unless building a custom artifact layout is necessary.

## Reports and JSON output

Report renderers are pure functions returning strings. They do not write to
stdout, inspect terminal capabilities, or use wall time.

- `renderTelemetrySnapshot`
- `renderEventTimeline`
- `renderFaultReport`
- `renderReplayReport`
- `renderScenarioReport`
- `renderFleetScenarioReport`
- `renderFleetReplayReport`
- `renderFleetTimelineSummary`
- `renderFleetTimelineReport`

`snapshotToJson` serializes a telemetry snapshot, optionally with indentation.

## Validation conventions

Validators return:

```ts
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

Validators do not generally throw for malformed data. Constructors, runners,
parsers, and writers may throw for invalid arguments or invalid state. Error
message wording is not a stable machine-readable contract.

## Metadata

Several models accept `Record<string, unknown>` metadata. Use values supported
by `structuredClone`; artifact metadata must also be JSON-serializable. Avoid
functions, symbols, cyclic objects, and environment-specific class instances.
