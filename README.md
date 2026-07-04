# Interstice Telemetry

Deterministic telemetry and digital-twin infrastructure.

Interstice Telemetry is a transport-independent TypeScript SDK for generating,
recording, replaying, validating, and inspecting repeatable robot telemetry
experiments. It gives robotics teams useful software evidence before hardware
is available, safe, or reproducible.

Version `1.0.0-rc.1` is the first public v1 release candidate. The repository's
v1.1–v1.5 labels were unpublished engineering milestones, not npm releases.
The candidate freezes APIs, gates declarations and serialized fixtures, tests
packed consumers, and includes the pre-v1 Rover-0 dogfood fixes.

The SDK is synchronous and manually stepped. It does not start timers,
background loops, network connections, or hardware polling.

## What it provides

- Seeded robot telemetry simulation.
- Simulator and adapter-backed event streams.
- Replay recording, validation, JSON serialization, and playback.
- Reusable single-robot and fleet scenarios.
- Explicit simulation, logical, replay, and fleet clocks.
- A derived global fleet event timeline.
- Pure terminal reports.
- Versioned local experiment artifacts.
- Generic custom-mission evidence artifact export.
- Synchronous hardware adapter contracts and virtual adapters.
- Immutable robot structure and environment metadata.
- Complete deterministic `RobotState` snapshots.
- Reconstructable twin timelines and ordered replay markers.
- JSON Schema validation and stable v1.1 compatibility fixtures.
- Explicit telemetry/replay-to-state bridge interfaces.
- Rule-based diagnostics and derived multi-robot twin views.
- Deterministic plain-text twin diagnostic reports.
- Browser-safe `interstice-telemetry/digital-twin` exports.
- Immutable provenance, ownership, validation, reports, and propagation.
- Canonical evidence manifests, lineage queries, and provenance coverage.
- API/serialization compatibility gates and packed-consumer verification.
- Future-facing platform interfaces without platform implementations.

It is not a physics engine, renderer, robot controller, production telemetry
transport, distributed clock service, database, cloud platform, ROS
integration, or real-time fleet dashboard.

## Requirements and installation

- Node.js 20 or newer.
- ESM project configuration.

```bash
npm install interstice-telemetry
```

For a source checkout:

```bash
npm ci
npm run check
```

## Quick start

Run a built-in deterministic scenario and inspect its evidence:

```ts
import {
  getBuiltInScenario,
  ReplayPlayer,
  renderScenarioReport,
  runScenario,
} from "interstice-telemetry";

const profile = getBuiltInScenario("motor-overheat");
if (!profile) throw new Error("Scenario not found");

const result = runScenario(profile);
console.log(renderScenarioReport(result));

const player = new ReplayPlayer(result.replayLog);
player.subscribe((event) => {
  console.log(event.sequence, event.type, event.timestamp);
});
player.start();
player.playAll();
```

Equal package/runtime versions, profile, seed, start time, and ordered calls
produce equal values. See [Determinism](docs/DETERMINISM.md) for the exact
preconditions and limits.

## Evidence pipeline

```text
simulate / adapt
  -> collect telemetry
  -> stream events
  -> record replay
  -> reconstruct RobotState
  -> inspect twin timeline
  -> build fleet timeline
  -> render reports
  -> export artifacts
  -> derive evidence manifest
```

Optional provenance follows evidence through this pipeline without changing
legacy shapes. It describes origin and transformation history; it does not
prove authenticity.

The models remain separate on purpose:

- `TelemetrySnapshot` is the common observation contract.
- `RobotOperatingMode` is the telemetry lifecycle string union such as
  `"active"` or `"faulted"`.
- `Robot` and `Scene` provide structural and environmental context.
- `RobotState` is the canonical complete normalized state at one timestamp.
- `TwinTimeline` is a deterministic history of states and event markers.
- `TelemetryEvent` records an ordered stream action or observation.
- `ReplayLog` preserves one robot's event evidence.
- `FleetReplayLog` retains independent replay logs for multiple robots.
- `FleetEventTimeline` derives a canonical cross-robot order.
- `ExperimentArtifactBundle` indexes persisted JSON and text evidence.
- `EvidenceProvenance` describes origin, confidence, ownership, and transforms.
- `EvidenceManifest` inventories an experiment package and its relationships.

See [Evidence Provenance](docs/EvidenceProvenance.md), [Evidence
Ownership](docs/EvidenceOwnership.md), [Evidence Manifest](docs/EvidenceManifest.md),
and [Evidence Lineage](docs/EvidenceLineage.md).

## Digital twin quick start

```ts
import {
  createRobotState,
  reconstructTwinTimeline,
  TwinReplayCursor,
} from "interstice-telemetry";

const timeline = reconstructTwinTimeline(
  "rover-1",
  telemetryRecords,
  (_previous, record) =>
    createRobotState({
      ...baseState,
      robotId: record.robotId,
      timestamp: record.timestamp,
      sensorValues: record.payload.sensors,
    }),
);

const cursor = new TwinReplayCursor(timeline);
console.log(cursor.next());
console.log(cursor.seek(5_000));
```

The reconstruction callback is application-owned because telemetry meaning,
units, and completeness depend on the producer. Input records are ordered by
timestamp, sequence, then identifier before reconstruction.

The SDK does not infer perfect physical state automatically. It provides
stable contracts and deterministic tools so applications can map evidence
into canonical robot state.

## Core workflows

### Simulate

```ts
import { RobotSimulator } from "interstice-telemetry";

const robot = new RobotSimulator({
  robotId: "rover-1",
  seed: 42,
  startTime: 0,
  initialState: "active",
});

console.log(robot.step(1_000));
robot.injectFault({ type: "low_battery" });
console.log(robot.step(1_000));
```

### Stream and record

```ts
import {
  ReplayRecorder,
  RobotSimulator,
  TelemetryStream,
} from "interstice-telemetry";

const stream = new TelemetryStream(
  new RobotSimulator({ robotId: "rover-1", seed: 42 }),
);
const recorder = new ReplayRecorder();
const unsubscribe = stream.subscribe(recorder.record);

recorder.start();
stream.start();
stream.step(1_000);
stream.stop();
recorder.stop();
unsubscribe();

const log = recorder.toLog();
```

Every subscriber and replay boundary receives an independent event copy.
Handler exceptions propagate synchronously.

### Run a fleet and build a timeline

```ts
import {
  buildFleetEventTimeline,
  getBuiltInFleetScenario,
  renderFleetTimelineReport,
  runFleetScenario,
} from "interstice-telemetry";

const profile = getBuiltInFleetScenario("mixed-fault-fleet");
if (!profile) throw new Error("Fleet scenario not found");

const result = runFleetScenario(profile);
const timeline = buildFleetEventTimeline(result.fleetReplayLog);
console.log(renderFleetTimelineReport(timeline));
```

The timeline is derived evidence. Per-robot replay logs remain authoritative.

### Export artifacts

```ts
import {
  exportFleetRunArtifacts,
  readExperimentArtifacts,
} from "interstice-telemetry";

const written = exportFleetRunArtifacts(result, {
  rootDir: "artifacts",
});
const loaded = readExperimentArtifacts(written.experimentPath);
console.log(loaded.validation);
```

Artifact persistence is synchronous and Node-only. Existing experiment
directories are not replaced unless `overwrite: true` is explicit.

Applications that do not use a built-in runner can export the same indexed
layout without manufacturing a scenario result:

```ts
import { exportCustomEvidenceArtifacts } from "interstice-telemetry";

exportCustomEvidenceArtifacts({
  experimentId: "rover-0-mission",
  rootDir: "artifacts",
  metadata: { name: "Rover-0 mission", robotIds: ["rover-0"] },
  replayLog,
  replayValidation,
  twinTimeline,
  diagnostics,
  provenance,
  evidenceManifest,
  reports: { "mission-report.txt": missionReport },
});
```

## Documentation

- [Getting started](docs/GETTING_STARTED.md)
- [API reference](docs/API.md)
- [API stability](docs/API_STABILITY.md)
- [v1 API freeze](docs/API_FREEZE_V1.md)
- [Determinism contract](docs/DETERMINISM.md)
- [Architecture](docs/Architecture.md)
- [Digital twin architecture](docs/DigitalTwinArchitecture.md)
- [Digital twin schemas](docs/DigitalTwinSchemas.md)
- [Telemetry bridge](docs/TelemetryBridge.md)
- [Twin diagnostics](docs/TwinDiagnostics.md)
- [Multi-robot twin view](docs/MultiRobotTwinView.md)
- [Browser-safe exports](docs/BrowserExports.md)
- [RobotState](docs/RobotState.md)
- [Twin timeline](docs/TwinTimeline.md)
- [Scene model](docs/SceneModel.md)
- [Digital twin roadmap](docs/FutureRoadmap.md)
- [v1.2 migration](docs/MIGRATION_V1_2.md)
- [v1.3 migration](docs/MIGRATION_V1_3.md)
- [Evidence manifest](docs/EvidenceManifest.md)
- [Evidence lineage](docs/EvidenceLineage.md)
- [Provenance coverage](docs/ProvenanceCoverage.md)
- [v1.4 migration](docs/MIGRATION_V1_4.md)
- [Examples](docs/EXAMPLES.md)
- [Replay](docs/REPLAY.md)
- [Fleet timelines](docs/FLEET_TIMELINES.md)
- [Artifacts](docs/ARTIFACTS.md)
- [Dogfooding](docs/DOGFOODING.md)
- [Hardware adapters](docs/HARDWARE_ADAPTERS.md)
- [Roadmap](docs/Roadmap.md)
- [Release process](docs/RELEASING.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [v1 release plan](docs/V1_RELEASE_PLAN.md)
- [GitHub repository setup](docs/GITHUB_REPO_SETUP.md)
- [npm release setup](docs/NPM_RELEASE_SETUP.md)

## Example commands

```bash
npm run example
npm run example:stream
npm run example:replay
npm run example:scenario
npm run example:console
npm run example:hardware
npm run example:fleet
npm run example:artifacts
npm run example:adapter-stream
npm run example:clock
npm run example:timeline
npm run example:evidence:manifest
npm run example:evidence:artifacts
npm run example:evidence:lineage
npm run example:evidence:coverage
```

See [Examples](docs/EXAMPLES.md) for expected behavior and side effects.

## Current limitations

- Simulation physics are deliberately simple.
- Adapter implementations are virtual; no real device drivers are included.
- Execution and persistence are synchronous.
- Playback preserves event order but is not time-paced.
- Twin reconstruction requires an application-specific pure mapping from
  telemetry to complete state.
- A twin timeline permits one complete state per robot timestamp.
- Scene obstacles are descriptive metadata, not collision geometry.
- Platform interfaces do not ship integrations.
- Fleet timelines are derived after a run, not assigned to live events.
- Persistence uses local JSON and text directories without atomic replacement,
  compression, integrity digests, or cloud storage.
- The root entry is Node.js ESM and includes Node filesystem APIs; the
  `digital-twin` subpath is browser-safe.
- Report text is intended for humans, not as a machine-readable format.
- Manifests and coverage describe declared evidence; they do not authenticate
  files or establish trust.

## v1 release-candidate direction

The remaining work is external release confirmation: repository ownership,
private security reporting, npm publishing controls, and an RC validation
period. Physics, rendering, robotics middleware, hardware I/O, networking, and
cloud services remain external integrations.

See [Roadmap](docs/Roadmap.md).

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). The project is licensed under the
[MIT License](LICENSE).
