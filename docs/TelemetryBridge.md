# Telemetry-to-State Bridge

The telemetry bridge is the explicit boundary between observed evidence and a
canonical `RobotState`. `TelemetryToStateMapper` receives the prior state, an
immutable input record, and a context containing robot, timestamp, and source.
The returned state must match that identity and timestamp.

`mapTelemetrySnapshotToState` and `mapReplayEventToState` handle one record.
`buildTwinTimelineFromTelemetry` and `buildTwinTimelineFromReplay` sort and
fold records into a timeline. Inputs and prior states are never mutated.

The default mappers are deliberately conservative. Snapshot mapping preserves
battery, IMU, motor, resource, signal, and operating-mode evidence but does
not invent position. Replay mapping carries the prior complete state forward
and records the latest event marker.

High-fidelity reconstruction requires an application mapper with explicit
knowledge of units, frames, sensors, calibration, and event semantics.

The SDK does not infer perfect physical state automatically. It provides
stable contracts and deterministic tools so applications can map evidence
into canonical robot state.
