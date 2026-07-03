# Determinism Contract

Interstice Telemetry is deterministic robotics observability infrastructure.
In this SDK, determinism means that equal supported inputs and equal ordered
operations produce equal observable telemetry, events, replay data, timelines,
reports, and artifact contents.

Determinism is a software execution contract. It is not a claim about physical
robot repeatability, distributed clock synchronization, real-time scheduling,
or identical floating-point behavior across unrelated runtimes.

## Required preconditions

Two runs are comparable when all of the following are equal:

- Interstice Telemetry package version and serialized format versions.
- Supported Node.js major version and JavaScript runtime semantics.
- Simulator, scenario, fleet, adapter, clock, and artifact configuration.
- Numeric or string seed.
- Initial state and start time.
- Ordered sequence of lifecycle, step, state, fault, adapter, replay, and
  export operations.
- Step durations and fault schedules.
- Values and insertion order of caller-provided metadata when byte equality of
  JSON is required.
- Behavior of caller-provided adapters, clocks, and event handlers.

Input data must be valid, structured-cloneable where the API clones it, and
JSON-serializable where it is written to an artifact.

## Seed contract

`RobotSimulator` defaults to seed `1`. Equal seeds produce equal pseudo-random
samples for an equal call sequence.

- String seeds are hashed deterministically.
- Numeric seeds are normalized with JavaScript unsigned 32-bit conversion.
- Different textual seeds can theoretically collide because the internal
  state is 32-bit.
- The generator is for repeatability, not security or statistical guarantees.
- Adding, removing, or reordering random draws is a determinism-contract
  change and requires release notes.

Callers should record the seed in scenario or replay evidence. Do not use
`Math.random()`, wall time, process state, or nondeterministic external values
to construct a run if replayable equality is required.

## Clock contract

All SDK clocks are synchronous state machines. They do not create timers,
sleep, poll, or read wall time.

| Context | Time owner |
|---|---|
| `RobotSimulator` without external clock | Simulator advances its ISO snapshot timestamp on `step` |
| `TelemetryStream` with clock | Stream advances the supplied clock after a successful simulator step |
| `AdapterTelemetryStream` with clock | Stream advances the supplied clock before observing and emitting the step |
| `ScenarioRunner` with clock | Its stream advances the supplied clock once per scenario step |
| `FleetScenarioRunner` with clock | Runner advances the supplied clock once after all robots finish a global step |
| `ReplayPlayer` with `ReplayClock` | Player advances to the next recorded timestamp with the replay cursor |

Use one mutable clock per controlling workflow. Reusing a clock continues from
its current state unless it is explicitly reset. Do not let multiple
independent controllers advance the same clock.

Event timestamps are numeric milliseconds. Snapshot timestamps are ISO 8601
strings. Fleet timeline timestamps preserve numeric source event timestamps.

## Stream and event contract

Events are emitted only by explicit method calls. Event sequences increase per
stream, and IDs are derived from robot ID plus sequence.

Within a simulator telemetry step:

1. simulator state advances,
2. an observed `state.changed` event is emitted if needed,
3. `telemetry.snapshot` is emitted.

Within an adapter telemetry step:

1. steppable adapters advance in battery, motor, IMU, system order,
2. time advances,
3. status and optional reading transitions emit in domain order,
4. the adapter-backed snapshot emits last.

Each subscriber receives an independent structured clone of the event. A
subscriber cannot mutate evidence seen by a later subscriber. Handler
exceptions still propagate synchronously and stop the current delivery loop;
handlers used in deterministic workflows must therefore be deterministic and
should not throw.

## Replay contract

`ReplayRecorder` stores independent event copies. `getEvents()` and `toLog()`
also return independent copies. `ReplayPlayer` copies its input and gives each
subscriber and step caller an independent event copy.

Given an equal valid replay log and equal player calls:

- events are emitted in array order,
- IDs, types, timestamps, robot IDs, sequences, and payload values are
  preserved,
- no simulator is advanced,
- playback is not delayed or paced according to event timestamps.

`validateReplayLog` requires the supported replay version, valid identity and
date fields, a matching event count, known event types, unique event IDs,
positive increasing sequences, non-negative nondecreasing timestamps, matching
robot IDs, and payload presence. Sequence gaps are allowed so recording may
begin after a stream has already emitted earlier events.

Deserialization parses data but does not make it trustworthy. Validate loaded
logs before playback.

## Fleet contract

Fleet runners sort robots by robot ID before constructing and stepping their
runtimes. Each global iteration steps every robot with the same delta, then
advances the optional fleet clock once. Equal-time faults retain their profile
order.

Per-robot replay logs remain authoritative. Fleet replay wraps those logs
without flattening or changing their per-robot sequences.

## Timeline contract

`buildFleetEventTimeline` clones all source event payloads and applies this
total order:

1. timestamp ascending,
2. robot ID ascending by JavaScript string comparison,
3. robot sequence ascending,
4. event ID ascending by JavaScript string comparison.

It then assigns contiguous `fleetSequence` values beginning at one. The
builder does not mutate source replay logs.

Timeline validation requires this canonical order, supported format version,
valid creation time, contiguous fleet sequences, positive robot sequences,
unique event IDs, known event types, and non-negative nondecreasing
timestamps.

Changing a tie-break rule or sequence assignment is a determinism-contract and
serialized-format change.

## Artifact contract

Scenario and fleet exporters derive their default creation time from replay
evidence. They sort robot IDs and reuse deterministic report renderers.

JSON artifacts use:

- `JSON.stringify` with two-space indentation,
- a single trailing newline,
- JavaScript object insertion order.

Text artifacts also end in one newline. Equal structured inputs, including
metadata key insertion order, produce byte-identical files. The writer does
not canonicalize arbitrary object keys; semantically equal objects built with
different key insertion orders may not be byte-identical.

Artifact directory writes are synchronous but not transactional. External
filesystem behavior, interruption, permissions, and concurrent writers are
outside the deterministic content guarantee.

## Reports

Report functions are pure for supported input values. They do not inspect
terminal width, locale, environment variables, wall time, or color support.
Equal input and options produce equal strings.

Report text is human-readable output, not a substitute for JSON evidence.
Consumers should not parse report spacing as a stable data format.

## Guaranteed

Under the preconditions above, the SDK guarantees:

- repeatable simulator values for equal versions, seeds, and calls,
- explicit time advancement with no background scheduling,
- stable event ordering, IDs, and per-stream sequences,
- value-preserving replay with isolated event ownership,
- stable sorted fleet execution and timeline derivation,
- pure deterministic reports,
- byte-identical artifact files for equal structured inputs.

## Not guaranteed

The SDK does not guarantee:

- physical fidelity or repeatability of a real robot,
- cryptographic randomness,
- distributed, NTP, PTP, ROS, or hardware-clock synchronization,
- real-time pacing or deadline behavior,
- deterministic third-party adapters, clocks, handlers, or metadata,
- compatibility with unsupported serialized versions,
- equality across different SDK/runtime versions,
- byte equality for objects with different key insertion order,
- atomic filesystem replacement or deterministic filesystem metadata,
- continuation to later subscribers after a handler throws.

## Examples

Deterministic:

```ts
const run = () => {
  const simulator = new RobotSimulator({
    robotId: "rover-1",
    seed: 42,
    startTime: 0,
    initialState: "active",
  });

  return [simulator.step(1_000), simulator.step(500)];
};

console.log(JSON.stringify(run()) === JSON.stringify(run())); // true
```

Not deterministic:

```ts
const simulator = new RobotSimulator({
  seed: Date.now(),
  startTime: Date.now(),
});

simulator.step(Math.random() * 1_000);
```

A custom adapter that reads a live sensor, a handler that injects wall time
into payloads, or metadata built from unordered external input also makes the
result dependent on that external source.

## Contributor rules

Changes that affect deterministic output must:

1. identify the affected contract: random draw order, time, event order,
   sequence, sorting, serialization, or formatting;
2. add or update an equality test and a negative/boundary test;
3. preserve input ownership and avoid shared mutable evidence;
4. avoid wall time, global randomness, locale-sensitive sorting, background
   work, and environment-dependent formatting;
5. update this document and format/API stability docs;
6. add a changelog entry;
7. bump a serialized format version when persisted meaning or canonical
   ordering changes.

Refactors must demonstrate that equal fixtures remain byte-for-byte equal
unless a deliberate prerelease migration is documented.
