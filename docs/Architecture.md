# Architecture

Interstice Telemetry v0.5 is split into eight small layers.

## Simulator

`RobotSimulator` owns the robot clock and baseline state. Calling `step` moves
the clock forward, updates battery and motor temperature, and samples the next
snapshot from a seeded pseudo-random source. Equal configuration and operation
sequences therefore produce equal output.

## Telemetry snapshot model

`TelemetrySnapshot` is the stable data contract. It contains identity, time,
power, motor, compute, communications, IMU, and robot-state values. Snapshots
are plain objects so consumers can store or transform them without simulator
knowledge.

## Fault injection

`FaultInjector` maintains a set of active faults and transforms a baseline
snapshot when it is read. Keeping faults outside the baseline evolution makes
them easy to activate, clear, test, and extend. The initial fault set covers
low battery, motor overheating, signal loss, sensor noise, and stalled motors.

## Event stream layer

`TelemetryStream` wraps an existing `RobotSimulator`; it does not duplicate or
replace simulation behavior. A stream starts in the `stopped` state. `start`
and `stop` move it through an explicit, idempotent lifecycle, while `step`
advances the wrapped simulator only when the stream is running. Callers receive
events through `subscribe` and can detach handlers with `unsubscribe` or the
function returned by `subscribe`.

Each event includes a robot ID, simulator-clock timestamp, deterministic ID,
and strictly increasing per-stream sequence number. A running step emits
`state.changed` first when the observed robot state changes, followed by the
`telemetry.snapshot` that reflects that state. Fault injection and lifecycle
operations emit their corresponding events synchronously. This fixed ordering
makes equal simulator configurations and action sequences produce equal event
streams.

The stream intentionally has no timer, network transport, background loop, or
asynchronous queue. Manual stepping keeps control with the caller, makes tests
fast and deterministic, and avoids committing the core SDK to scheduling or
transport policy. Those concerns can be layered on later.

## Output layer

The JSON output helper serializes the public snapshot contract without adding
transport behavior. Future output formats can use the same boundary.

## Replay layer

The replay layer records and reproduces the public `TelemetryEvent` contract.
It is additive to the simulator and stream: recording observes events, while
playback operates on an already-created log without advancing a simulator.

### Replay log model

A `ReplayLog` contains a format version, one robot ID, an ISO creation time,
an optional simulation seed, the declared event count, an ordered event array,
and optional caller metadata. Events are stored in their original form so
their IDs, types, simulator-clock timestamps, robot IDs, sequences, and
payloads remain the authoritative recorded values.

`serializeReplayLog` and `deserializeReplayLog` convert between this plain
object model and JSON. They do not read or write files.

### Recorder

`ReplayRecorder` starts inactive. A stream can subscribe its bound `record`
handler directly; events are ignored while the recorder is inactive and
appended in delivery order while it is active. `clear` removes the current
recording, and `toLog` creates a new log and event array without rewriting the
events. The robot ID and creation time can be configured; otherwise they are
derived from the first recorded event.

### Player

`ReplayPlayer` starts stopped and maintains a cursor into a replay log. `start`
enables playback, `step` synchronously emits one event, and `playAll`
synchronously emits every remaining event. Reaching the end stops the player.
Subscribers receive the original event objects in exact log order.

### Validator

`validateReplayLog` returns `valid`, `errors`, and `warnings` instead of
throwing or returning only a boolean. It checks required log identity and
version fields, declared event count, required event fields, known event types,
strictly increasing sequences, and agreement between every event robot ID and
the log robot ID.

### Deterministic replay guarantees

Replay does not generate new IDs, timestamps, sequences, or payloads and does
not reorder events. Given the same valid log and the same sequence of player
calls, subscribers observe the same values in the same order. Playback has no
timers, asynchronous background loop, network access, or hardware dependency.

Current replay non-goals are scheduling events according to timestamps,
network transport, multi-robot logs, and direct disk persistence. Applications
may store the serialized JSON using their own persistence layer.

## Scenario layer

The scenario layer composes the simulator, event stream, and replay layers into
a small deterministic robotics test lab. It adds configuration and orchestration
without changing the behavior or public APIs of those lower layers.

### Scenario profile model

A `ScenarioProfile` is a plain reusable data object with a stable ID,
human-readable name and description, optional seed and robot configuration,
positive duration and step interval, an optional scheduled-fault timeline, and
optional caller metadata. Each `ScheduledFault` pairs an existing `Fault` with
an elapsed scenario time in milliseconds. Profiles contain no functions,
timers, persistence, or transport configuration.

### Built-in scenarios

The SDK ships with `basic-patrol`, `battery-drain`, `motor-overheat`,
`signal-loss`, `sensor-noise`, and `stalled-motor`. Their IDs, seeds, robot
identities, timing, and fault schedules are stable. `getBuiltInScenario`
returns an independent copy so callers can customize a profile without
changing the shared definitions.

### Validator

`validateScenarioProfile` returns structured `valid`, `errors`, and `warnings`
fields. It verifies required identity fields, positive duration and step
values, step-to-duration bounds, optional robot identity, fault timing bounds,
and known fault types. `ScenarioRunner` validates before creating any
simulation components and rejects invalid profiles.

### Runner and replay flow

`ScenarioRunner` copies the input profile, creates a `RobotSimulator`,
`TelemetryStream`, and `ReplayRecorder`, then starts and advances them
synchronously. Each iteration advances by `stepMs`, except for a final partial
step when the duration is not evenly divisible. After elapsed time reaches or
crosses a scheduled `atMs`, the runner injects that fault exactly once. Faults
at zero are injected immediately after stream start.

The resulting flow is:

```text
ScenarioProfile
  -> validate
  -> RobotSimulator
  -> TelemetryStream
  -> ReplayRecorder
  -> ReplayLog
  -> validateReplayLog
```

The result includes the copied profile, final snapshot, emitted events, replay
log, both validation results, and summary counts. Replay metadata records the
scenario ID and optional scenario metadata.

### Deterministic scenario guarantees

Given an equal profile, a run produces equal snapshots, event IDs, sequences,
timestamps, payloads, replay logs, validation results, and summaries. Numeric
and string seeds are deterministic; string seeds are converted with a stable
in-process hash before pseudo-random sampling. Equal-time faults retain their
profile order. The runner does not mutate its input and uses no timers,
asynchronous loops, networking, hardware, or file-system persistence.

## Console and reporting layer

The console layer is a read-only view over existing public models. It renders
scenario results, telemetry snapshots, event arrays, fault events, and replay
logs as fixed-layout plain text. It neither changes nor duplicates simulator,
stream, replay, or scenario behavior.

Each renderer is a pure function that returns a string. Library code does not
write to standard output, detect terminal width, inspect environment state, or
use colors and cursor control. This keeps the output usable in terminals, CI
logs, text files managed by callers, and exact string assertions. The example
script is the only console-specific component that prints output.

Console formatting centralizes percentages, voltages, temperatures,
millisecond values, robot states, and telemetry numbers. Timeline rendering
retains the supplied event order, supports a deterministic leading-event
limit, and can include compact payload summaries. Runtime payload checks let
event and fault reports remain readable when optional or externally loaded
metadata is absent.

The reporting flow extends scenario execution without adding a new data model:

```text
ScenarioProfile
  -> ScenarioRunner
  -> ScenarioRunResult
     -> final TelemetrySnapshot -> telemetry report
     -> TelemetryEvent[]       -> timeline and fault reports
     -> validated ReplayLog    -> replay report
     -> summary                -> scenario report
```

Replay reports run the existing structured validator at render time, then
show validation status, sequence bounds, and deterministic event-type counts.
No report uses timers, background work, networking, file-system persistence,
terminal capabilities, or mutable global state. Equal input and equal options
therefore produce byte-for-byte equal output.

## No hardware dependencies

The foundation has no ROS, device driver, network, or hardware dependency.
This keeps tests fast and reproducible and prevents early hardware assumptions
from becoming part of the public model. Hardware adapters can be introduced
later behind explicit interfaces.
