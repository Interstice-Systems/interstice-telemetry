# Twin Timeline

A `TwinTimeline` is the replayable state history for one robot. It stores
complete immutable states separately from ordered event markers:

```text
telemetry records
      |
      v
pure reconstruction
      |
      v
RobotState[] + ReplayEvent[]
      |
      v
TwinReplayCursor
      |
      v
deterministic inspection
```

`reconstructTwinTimeline` accepts transport-independent telemetry records and a
caller-owned pure function. Records are ordered by timestamp, sequence, then
identifier before reconstruction. The function receives the previous complete
state and one record, and returns the next complete state. The resulting state
must use the record's robot identifier and timestamp.

```ts
const timeline = reconstructTwinTimeline(
  "rover-1",
  records,
  (previous, record) => ({
    ...baseState,
    timestamp: record.timestamp,
    batteryStatus: { charge: record.payload.charge },
    metadata: {
      previousTimestamp: previous?.timestamp ?? null,
    },
  }),
);
```

`TwinReplayCursor.next()` steps through states. `seek(timestamp)` returns the
latest state at or before the target using binary search. `eventsThrough`
returns ordered markers through the target. The cursor owns only its index;
it never mutates the timeline.

A timeline permits one complete state per timestamp. Producers with multiple
observations at the same timestamp must fold them into one state or use a
finer clock domain. This prevents ambiguous inspection because RobotState does
not carry an independent state sequence.

Existing `ReplayLog` and `FleetEventTimeline` formats are unchanged. They
remain event evidence; a twin timeline is a separate derived artifact.
