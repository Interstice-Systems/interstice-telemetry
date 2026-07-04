# Telemetry-to-State Bridge

The telemetry bridge is the explicit boundary between observed evidence and a
canonical `RobotState`. `TelemetryToStateMapper` receives the prior state, an
immutable input record, and a context containing robot, timestamp, and source.
The returned state must match that identity and timestamp.

`mapTelemetrySnapshotToState` and `mapReplayEventToState` handle one record.
`buildTwinTimelineFromTelemetry` and `buildTwinTimelineFromReplay` sort and
fold records into a timeline. Inputs and prior states are never mutated.

Replay ordering is timestamp, sequence, then event ID. Every replay event is
passed to the mapper, including events that share a timestamp. The mapper's
`previousState` therefore includes the preceding same-timestamp event. The
timeline retains one final state per timestamp by replacing the earlier
same-timestamp state after mapping.

For physical integration, advance motion only when time advances:

```ts
const deltaMs =
  previousState === undefined
    ? 0
    : Math.max(0, context.timestamp - previousState.timestamp);
```

Apply zero elapsed time to later events at the same timestamp, while still
folding their sensor or status evidence into the returned state. This avoids
integrating one adapter interval more than once.

The default mappers are deliberately conservative. Snapshot mapping preserves
battery, IMU, motor, resource, signal, and operating-mode evidence but does
not invent position. Replay mapping carries the prior complete state forward
and records the latest event marker.

High-fidelity reconstruction requires an application mapper with explicit
knowledge of units, frames, sensors, calibration, and event semantics.

## Provenance

Seed provenance at the recording boundary and pass the resulting log to the
bridge:

```ts
const recorder = new ReplayRecorder({
  provenance: adapterOrigin,
  createdAt: 0,
});
// subscribe recorder.record, start, step, and stop...
const timeline = buildTwinTimelineFromReplay(recorder.toLog());
```

`ReplayRecorder` and the replay bridge append deterministic transformation
steps. When supplying a raw event array instead, pass `provenance` in
`TelemetryBridgeBuildOptions`.

Command/custom adapter events, mutable adapter operating-state transitions,
and richer bridge helpers are intentionally deferred until after public v1.
Applications should keep these semantics in their mapper and application event
model for now.

The SDK does not infer perfect physical state automatically. It provides
stable contracts and deterministic tools so applications can map evidence
into canonical robot state.
