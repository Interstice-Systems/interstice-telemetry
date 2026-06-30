# Architecture

Interstice Telemetry v0.3 is split into six small layers.

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

## No hardware dependencies

The foundation has no ROS, device driver, network, or hardware dependency.
This keeps tests fast and reproducible and prevents early hardware assumptions
from becoming part of the public model. Hardware adapters can be introduced
later behind explicit interfaces.
