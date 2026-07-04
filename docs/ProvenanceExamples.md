# Provenance Examples

## Origin and transformation

```ts
const origin = createSimulationProvenance({
  sourceName: "ScenarioRunner",
  robotId: "rover-1",
  timestamp: 1_000,
});

const replay = appendTransformation(origin, {
  name: "Replay Recorder",
  timestamp: 2_000,
});
```

`origin` remains unchanged. `replay` has a new deterministic `provenanceId`
and one transformation referencing the origin.

## Validation and reporting

```ts
const validation = validateEvidenceProvenance(replay);
if (!validation.valid) throw new Error(validation.errors.join("\n"));

console.log(renderProvenanceReport(replay));
```

## Automatic pipeline propagation

Provide provenance on a telemetry event or in `ReplayRecorder` options. The
recorder, replay-to-twin bridge, and diagnostics runner append their own
steps:

```ts
const recorder = new ReplayRecorder({ provenance: origin, createdAt: 1_000 });
// record events...
const log = recorder.toLog();
const timeline = buildTwinTimelineFromReplay(log);
const report = runTwinDiagnostics(timeline);
```

Runnable examples:

- `examples/provenance/basic.ts`
- `examples/provenance/replay.ts`
- `examples/provenance/twin.ts`
- `examples/provenance/ownership.ts`
