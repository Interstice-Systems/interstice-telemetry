# Replay

Replay preserves and re-emits one robot's ordered telemetry events.

## Record

```ts
const recorder = new ReplayRecorder({
  robotId: "rover-1",
  seed: 42,
});
const unsubscribe = stream.subscribe(recorder.record);

recorder.start();
stream.start();
stream.step(1_000);
stream.stop();
recorder.stop();
unsubscribe();

const log = recorder.toLog({ scenario: "regression" });
```

The recorder ignores events while inactive. It stores independent event copies
and returns independent copies from `getEvents()` and `toLog()`.

Recording may begin after a stream has already emitted events, so valid replay
sequences must be positive and increasing but need not start at one or be
contiguous.

## Validate

```ts
const validation = validateReplayLog(log);
if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}
```

Validation enforces:

- supported replay format version,
- robot identity and valid creation time,
- declared event count,
- unique event IDs,
- known event types,
- non-negative nondecreasing timestamps,
- positive increasing sequences,
- event robot identity matching the log,
- payload field presence.

## Serialize

```ts
const json = serializeReplayLog(log);
const parsed = deserializeReplayLog(json);
const parsedValidation = validateReplayLog(parsed);
```

Deserialization checks that the root JSON value is an object but does not
replace validation. Never treat external JSON as trusted solely because it was
deserialized.

The npm package version and `REPLAY_LOG_VERSION` are independent.

## Play

```ts
const player = new ReplayPlayer(log);
player.subscribe((event) => console.log(event));
player.start();
player.playAll();
```

`step()` emits one remaining event while running. `playAll()` synchronously
emits the rest. Reaching the end stops the player.

Playback:

- preserves event value and array order,
- gives each subscriber an independent event copy,
- does not mutate the source log,
- does not advance a simulator,
- does not wait for timestamp deltas.

An optional `ReplayClock` can expose the current recorded timestamp as the
cursor advances. Construct it from the same event sequence used by the player.

## Error behavior

Handlers run synchronously. A handler exception propagates and stops the
current delivery loop. Validate a log before constructing operational replay
workflows, and keep observer handlers deterministic and non-throwing when
complete delivery matters.

## Fleet replay

`FleetReplayLog` is a sorted wrapper around independent `ReplayLog` values. It
does not flatten events. Build a [Fleet Timeline](FLEET_TIMELINES.md) when a
cross-robot ordered read model is needed.
