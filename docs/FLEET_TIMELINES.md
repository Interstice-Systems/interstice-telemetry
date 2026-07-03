# Fleet Timelines

A fleet timeline derives one canonical global order from the independent replay
logs in a `FleetReplayLog`.

## Build and validate

```ts
const timeline = buildFleetEventTimeline(fleetResult.fleetReplayLog);
const validation = validateFleetEventTimeline(timeline);

if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}
```

The builder:

1. clones events from every robot log,
2. sorts by timestamp,
3. breaks ties by robot ID,
4. then by robot sequence,
5. then by event ID,
6. assigns `fleetSequence` from one.

String ordering uses JavaScript lexical comparison, not locale collation.

## Authority

The timeline is a read model:

- `robotSequence` remains the source stream sequence.
- `fleetSequence` exists only in the derived global view.
- event ID, timestamp, type, robot ID, and payload values are preserved.
- source replay logs are not mutated.

Do not write fleet sequences back into per-robot logs.

## Queries

Pure query helpers:

- `filterTimelineByRobot`
- `filterTimelineByEventType`
- `filterTimelineByTimeRange` (inclusive)
- `getTimelineEventByFleetSequence`
- `summarizeTimelineByRobot`
- `summarizeTimelineByEventType`

Render with `renderFleetTimelineSummary` or
`renderFleetTimelineReport`.

## Validation contract

Validation requires:

- the supported timeline format version,
- fleet identity and valid creation time,
- matching event count,
- contiguous fleet sequences beginning at one,
- positive robot sequences,
- non-negative nondecreasing timestamps,
- unique event IDs,
- known event types,
- canonical tie-break ordering.

## Limits

Timelines are built after a fleet run. They do not synchronize distributed
robots, assign live global sequences, infer causal relationships, or correct
clock drift. Timestamp quality cannot exceed the source replay evidence.
