# Architecture

Interstice Telemetry is a synchronous evidence pipeline for repeatable robotics
experiments. Plain data contracts move through small layers; scheduling,
transport, middleware, and device I/O remain outside the core.

## Evidence pipeline

```text
ScenarioProfile / FleetScenarioProfile
              │
              v
RobotSimulator or HardwareAdapter<TReading>
              │
              v
      TelemetrySnapshot
              │
              v
       TelemetryEvent
              │
              v
          ReplayLog
              │
        ┌─────┴─────────┐
        v               v
FleetReplayLog       Reports
        │
        v
FleetEventTimeline
        │
        v
ExperimentArtifactBundle
        │
        v
   EvidenceManifest
```

`TelemetrySnapshot`, `TelemetryEvent`, `ReplayLog`, `FleetReplayLog`,
`FleetEventTimeline`, and `ExperimentArtifactBundle` are the canonical
evidence chain.

## Layer responsibilities

| Layer | Owns | Does not own |
|---|---|---|
| `simulator`, `faults` | Seeded telemetry evolution and fault transforms | Scheduling, transport |
| `hardware` | Adapter contracts, virtual readings, adapter collection | Real drivers, polling |
| `events` | Stream lifecycle, event identity and delivery | Persistence, queues |
| `replay` | Event recording, validation and ordered playback | Simulation, time pacing |
| `scenarios` | One-robot configuration and orchestration | Filesystem output |
| `fleet` | Sorted multi-robot orchestration and replay wrapper | Distributed coordination |
| `clock` | Explicit deterministic time state | Wall time, timers |
| `timeline` | Derived global fleet ordering and queries | Live sequence assignment |
| `console` | Pure text views | Terminal control, logging |
| `artifacts` | Indexed local JSON/text persistence | Databases, cloud storage |
| `digitalTwin` | Immutable state contracts, schemas, bridges, diagnostics, multi-robot views | Rendering, physics, state inference |
| `provenance` | Immutable origin, transformation, confidence, and ownership descriptions | Authentication, signatures, permissions |
| `evidence` | Manifest inventory, declared relationships, lineage queries, and provenance coverage | Content verification, graph storage, trust |

Dependencies should point from orchestration and views toward smaller data and
behavior layers. Cross-layer composition belongs in scenario/fleet runners and
artifact exporters.

## Simulation and snapshots

`RobotSimulator` owns seeded pseudo-random sampling, internal time, baseline
state, battery evolution, and motor temperature evolution. `FaultInjector`
transforms a cloned snapshot rather than rewriting baseline evolution.

`TelemetrySnapshot` is the common boundary for simulator and adapter-backed
telemetry. It contains:

- ISO timestamp and robot identity,
- battery percentage and voltage,
- motor RPM and Celsius temperatures,
- CPU and memory percentages,
- signal strength in dBm,
- IMU acceleration and gyro vectors,
- robot state.

The simulator is a repeatable software model, not a physics engine.

## Event streams and ownership

`TelemetryStream` wraps a simulator. `AdapterTelemetryStream` combines four
adapter domains with the same event/replay pipeline. Both are stopped by
default and advance only through explicit calls.

Events have deterministic IDs, numeric millisecond timestamps, robot IDs, and
per-stream sequences. Every handler receives a structured clone. This prevents
one subscriber from changing evidence delivered to another subscriber.
Handlers remain synchronous and fail-fast: an exception propagates and stops
the current delivery loop.

The adapter stream and global timeline are experimental public contracts until
v1. See [API Stability](API_STABILITY.md).

## Replay

`ReplayRecorder` retains independent event copies while active.
`ReplayPlayer` copies a log at construction and emits independent copies in
array order. Playback neither advances a simulator nor waits for timestamp
deltas.

Replay validation enforces the supported format version, required identity,
event count, unique IDs, known event types, non-negative nondecreasing
timestamps, positive increasing sequences, robot identity, and payload
presence.

Deserializers parse JSON but callers must validate loaded data.

## Scenarios and fleet execution

`ScenarioRunner` validates a profile, creates simulator/stream/recorder
components, injects scheduled faults, and returns in-memory evidence.

`FleetScenarioRunner` applies one duration and step interval to each effective
robot scenario. Robot runtimes are sorted by robot ID and stepped once per
global iteration. Each robot keeps an independent replay log.

The two runners intentionally remain direct implementations. Their duplicated
orchestration is small and should be extracted only when a concrete shared
change requires it.

## Time

Clocks are explicit synchronous state machines:

- `SimulationClock` tracks elapsed simulation time.
- `LogicalClock` supplies fixed logical ticks.
- `ReplayClock` follows recorded timestamps.
- `FleetClock` advances once per global fleet step.

Clock ownership differs by workflow. The exact rules are defined in
[Determinism](DETERMINISM.md). Clocks are not schedulers and should not be
shared between independently controlled workflows.

## Fleet timeline

`FleetEventTimeline` is a read-only derivation from `FleetReplayLog`. It clones
payloads, applies a total order, and assigns a separate contiguous
`fleetSequence`.

```text
timestamp
  -> robotId
  -> robotSequence
  -> eventId
  -> fleetSequence
```

The validator enforces this canonical order. Source replay events and
per-robot sequences are never modified.

## Reports

Report functions convert supported models to fixed-layout strings. They do not
write output, inspect terminal capabilities, use locale-sensitive formatting,
or read environment state. Applications choose where report strings go.

JSON remains the machine-readable evidence format; report text is for humans.

## Provenance

Optional `EvidenceProvenance` accompanies evidence without embedding its
payload. Replay recording, twin construction, and diagnostics preserve the
origin and append ordered transformations. Canonical JSON ordering, explicit
timestamps, content-derived non-cryptographic IDs, and recursive freezing make
the records deterministic.

Provenance describes evidence movement. It does not prove authenticity or
enforce ownership. See [Evidence Provenance](EvidenceProvenance.md).

## Evidence manifests

`EvidenceManifest` is a derived, immutable inventory of an experiment package.
Entries describe records or files; directed relationships describe declared
production and containment edges. Lineage queries traverse those edges with
cycle detection, while provenance coverage identifies entries without a
`provenanceId`.

Scenario and fleet exporters write the canonical JSON manifest and two pure
text reports under `evidence/`. Existing artifact, replay, twin, and provenance
contracts are not rewritten. A manifest describes evidence. It does not
authenticate evidence. See [Evidence Manifest](EvidenceManifest.md).

## Artifacts

Artifact exporters assemble completed scenario or fleet results into a
versioned indexed directory. The index declares safe relative paths, semantic
file kinds, and formats. Writers serialize all content before writing, refuse
overwrite by default, and use fixed JSON indentation and trailing newlines.

Writes are local, synchronous, and non-transactional. With overwrite enabled,
an interruption can leave incomplete output. Integrity digests and atomic
replacement are post-v1 candidates.

## Platform and extension boundaries

The package targets Node.js 20+ ESM. Filesystem-backed artifact exports remain
part of the root package. The `interstice-telemetry/digital-twin` subpath
contains only browser-safe contracts and pure utilities.

Future integrations should wrap the core:

- timers or real-time pacing drive explicit `step` calls,
- transports consume events or artifacts,
- real device code implements adapter contracts,
- ROS or middleware bridges translate at package boundaries.

They should not introduce background behavior into the deterministic core.

The digital-twin layer adds immutable `Robot`, `RobotState`, `Scene`,
`ReplayEvent`, and `TwinTimeline` contracts above this evidence pipeline. It
does not alter existing evidence formats. Version 1.2 adds schemas,
compatibility fixtures, explicit telemetry bridges, diagnostics, and
multi-robot views around those contracts. See
[Digital Twin Architecture](DigitalTwinArchitecture.md) for the contract
boundaries and future platform ports.

## Compatibility

The npm API and persisted formats have separate versions. Stable public exports
follow [API Stability](API_STABILITY.md). Persisted values must carry their
format version and pass the corresponding validator.

The v1 release candidate stores all generated declarations in
`compatibility/api-v1` and checks them exactly in CI. Representative replay,
timeline, state, twin, provenance, manifest, and artifact documents live in
`fixtures/compatibility` and are validated and round-tripped by tests. Packed
consumer verification exercises the root and browser entry points from the
actual tarball.

Any change to random draw order, clock advancement, event order, timeline
sorting, report formatting, or artifact serialization must follow the
contributor rules in [Determinism](DETERMINISM.md).
