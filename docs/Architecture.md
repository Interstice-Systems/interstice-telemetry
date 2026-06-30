# Architecture

Interstice Telemetry v0.2 is split into five small layers.

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

## No hardware dependencies

The foundation has no ROS, device driver, network, or hardware dependency.
This keeps tests fast and reproducible and prevents early hardware assumptions
from becoming part of the public model. Hardware adapters can be introduced
later behind explicit interfaces.
