# Getting Started

This guide creates a deterministic scenario, validates its replay evidence,
plays it back, renders a report, and exports a local artifact.

## Prerequisites

- Node.js 20 or newer.
- An ESM TypeScript or JavaScript project.

```bash
npm install interstice-telemetry
```

For TypeScript, use Node-compatible ESM settings such as `module` and
`moduleResolution` set to `NodeNext`.

## Run a scenario

```ts
import {
  getBuiltInScenario,
  renderScenarioReport,
  runScenario,
  validateReplayLog,
} from "interstice-telemetry";

const profile = getBuiltInScenario("motor-overheat");
if (!profile) throw new Error("Scenario not found");

const result = runScenario(profile);
const validation = validateReplayLog(result.replayLog);
if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}

console.log(renderScenarioReport(result));
```

The result contains:

- the effective scenario profile,
- final telemetry,
- emitted events,
- replay log,
- scenario and replay validation,
- duration, step, event, fault, and final-state summary.

## Replay the evidence

```ts
import { ReplayPlayer } from "interstice-telemetry";

const player = new ReplayPlayer(result.replayLog);
player.subscribe((event) => {
  console.log(event.sequence, event.type, event.timestamp);
});
player.start();
player.playAll();
```

Replay is synchronous and ordered. It does not wait according to timestamps.

## Export an artifact

```ts
import {
  exportScenarioRunArtifacts,
  readExperimentArtifacts,
} from "interstice-telemetry";

const written = exportScenarioRunArtifacts(result, {
  rootDir: "artifacts",
});

const loaded = readExperimentArtifacts(written.experimentPath);
if (!loaded.validation.valid) {
  throw new Error(loaded.validation.errors.join("\n"));
}

console.log(written.experimentPath);
console.log(loaded.files.map((file) => file.path));
```

The filesystem API is synchronous and Node-only. Use a unique experiment ID or
set `overwrite: true` intentionally for repeat runs.

## Build a fleet timeline

```ts
import {
  buildFleetEventTimeline,
  getBuiltInFleetScenario,
  runFleetScenario,
  validateFleetEventTimeline,
} from "interstice-telemetry";

const fleetProfile = getBuiltInFleetScenario("mixed-fault-fleet");
if (!fleetProfile) throw new Error("Fleet scenario not found");

const fleetResult = runFleetScenario(fleetProfile);
const timeline = buildFleetEventTimeline(fleetResult.fleetReplayLog);
const timelineValidation = validateFleetEventTimeline(timeline);

if (!timelineValidation.valid) {
  throw new Error(timelineValidation.errors.join("\n"));
}
```

The timeline adds global order without replacing per-robot replay logs.

## Make a run reproducible

Set and retain:

- package/runtime version,
- profile and seed,
- initial state and start time,
- ordered calls and step durations,
- clock and adapter configuration,
- metadata insertion order when byte-identical JSON matters.

Do not source those values from `Date.now()`, `Math.random()`, live sensors, or
other external state when repeatability is required. Read
[Determinism](DETERMINISM.md) before treating artifacts as regression evidence.

## Next steps

- Browse all [Examples](EXAMPLES.md).
- Review the [API](API.md) and [API Stability](API_STABILITY.md).
- Understand [Replay](REPLAY.md), [Fleet Timelines](FLEET_TIMELINES.md), and
  [Artifacts](ARTIFACTS.md).
- Implement a custom source through [Hardware Adapters](HARDWARE_ADAPTERS.md).
