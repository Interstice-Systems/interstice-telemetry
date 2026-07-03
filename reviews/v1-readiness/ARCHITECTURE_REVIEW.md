# Architecture Review

## Executive assessment

Interstice Telemetry has a sound small-library architecture. Its strongest
decision is to keep execution synchronous, manually stepped, transport-free,
and represented by plain data. Simulation, event capture, replay, fleet
coordination, derived timelines, reporting, and persistence form a coherent
pipeline without requiring middleware or hardware.

The architecture is suitable for a v1 line after contract hardening. It does
not need a rewrite. The primary pre-v1 risks are incomplete validation at
serialization boundaries, mutable event ownership, an inverted dependency
between core events and hardware events, and duplicated orchestration whose
behavior could drift.

## Current module model

```text
faults ──> simulator ──> events ──> replay ──> scenarios ──> fleet
                  │          │          │             │          │
                  │          └──────────┴─────────────┴──────────┤
                  │                                              v
types <───────────┴── hardware/adapters                    timeline
  ^                     │                                      │
  └─────────────────────┘                                      v
          clock (optional coordination)                    artifacts
                                                               │
                console/reporting <────────────────────────────┘
```

This is the intended conceptual direction. One implementation exception is
that `events/eventTypes.ts` imports the hardware-specific adapter event
vocabulary. That makes a core layer aware of a higher-level integration.

## Review by concern

### Module boundaries and layering

Strengths:

- The 59 source files are small and grouped by responsibility.
- Most cross-layer composition occurs in runners and exporters rather than in
  data models.
- Replay observes events without controlling simulation.
- Timeline is correctly modeled as a derivation from fleet replay, not as a
  second source of truth.
- Reporting is pure and persistence is kept out of core simulation.
- Types use `import type` consistently, limiting runtime coupling.

Fragilities:

- The event vocabulary is split between `events` and `hardware`, while
  `events` imports the hardware constant. This is conceptually inverted even
  though the reverse import is type-only and therefore does not currently
  produce a runtime cycle.
- `ScenarioRunner` and `FleetScenarioRunner` independently implement similar
  simulator/stream/recorder/fault-scheduling flows. Their semantics can drift.
- `AdapterTelemetryStream` is structurally parallel to `TelemetryStream` but
  has a different constructor style and additional sequence introspection.
- The root entry point exports filesystem-backed artifact modules alongside
  pure modules, making the package explicitly Node-oriented and broadening the
  loaded dependency graph.

No harmful runtime circular dependency was found in the current sources.

### Determinism guarantees

Strong guarantees:

- Random sampling uses a local seeded PRNG.
- Default time starts at the Unix epoch rather than wall time.
- All state advancement is explicit and synchronous.
- Fleet runtimes are sorted by robot ID before stepping.
- Same-time faults retain profile order.
- Timeline ordering uses timestamp, robot ID, robot sequence, and event ID.
- Reports sort keyed aggregates and avoid terminal/environment inspection.
- Scenario and fleet artifact creation times derive from deterministic replay
  times by default.

Limitations that should be documented or hardened:

- Determinism assumes the same JavaScript runtime semantics and identical
  caller actions. It is not a distributed-time guarantee.
- Events and payloads are passed and retained by reference. A subscriber can
  mutate an event before another subscriber sees it, after recording, or
  during replay. This weakens the claim that recorded evidence is immutable.
- `ReplayPlayer` does not validate its input or verify that an optional
  `ReplayClock` was built from the same event sequence.
- User-provided adapters, clocks, handlers, and metadata can be
  nondeterministic; the SDK cannot guarantee more than their contracts.
- Numeric seeds are normalized through JavaScript unsigned 32-bit conversion,
  but that normalization is not part of the documented contract.
- Subscriber exceptions propagate synchronously and can interrupt later
  subscribers or runner cleanup.

The README should describe these as deterministic-input and ownership
preconditions, not claim unconditional determinism.

### Replayability

The replay model is appropriately simple: ordered event arrays, explicit
cursor movement, no timing scheduler, and preservation of source event fields.
This should remain unchanged.

Before v1, replay validation should enforce the supported format version,
positive/contiguous sequence policy, non-negative/nondecreasing timestamps if
that is the contract, event ID uniqueness, and payload shape at least by event
type. Deserialization currently proves only that the JSON root is an object;
callers must separately remember to validate.

### Artifact model and persistence

The indexed directory model is inspectable, portable, deterministic, and a
good fit for local robotics QA. Safe relative-path checks, duplicate manifest
checks, pre-serialization, and refusal to overwrite by default are good
choices.

Risks:

- Format versions are checked only for non-empty strings, not compatibility.
- Loaded JSON is cast to domain types without validation in deserializers.
- Writes are not atomic. With overwrite enabled, the previous directory is
  deleted before the new directory is fully written.
- The index contains no content integrity information, so corruption or
  post-write modification is detected only where a domain validator happens
  to notice it.
- Reader recovery without an index recognizes only a fixed set of paths and
  does not infer the newer timeline files.
- Persistence is synchronous and Node-specific. That is reasonable for v1 but
  must be stated clearly.

### Timeline model

The derived global timeline is architecturally strong. It preserves
per-robot replay authority and adds a separate fleet sequence without
mutating source events.

The validator does not yet enforce all builder guarantees. It accepts gaps in
fleet sequence, treats backward timestamps as warnings, does not validate
`createdAt`, does not check duplicate event IDs, and does not prove the full
canonical tie-break order. A loaded timeline can therefore be "valid" without
being canonical.

### Fleet model

The fleet layer reuses single-robot primitives effectively. Sorted execution,
per-robot replay logs, and a wrapper rather than a flattened log are clear,
testable decisions.

The fleet runner duplicates the single-scenario execution algorithm. This is
not urgent enough to justify a risky pre-v1 rewrite, but shared conformance
tests are required so both paths retain identical fault and partial-step
semantics.

### Hardware adapter abstraction

The small synchronous `HardwareAdapter<TReading>` contract is a credible seam
for deterministic and real-device implementations. Domain-specific readings
preserve useful type safety, and virtual adapters allow the whole path to be
tested without hardware.

The contract deliberately omits lifecycle, errors, sampling freshness,
calibration, and async I/O. That is appropriate for the current package, but
real hardware support should not be implied. Adapter IDs, reading ranges, and
unit semantics also need stronger documentation before users implement the
interfaces.

### Clock abstraction

Explicit clocks clarify time and avoid scheduling policy. Keeping clocks
optional preserved compatibility.

There are three concerns:

- `SimulationClock` and `FleetClock` are behaviorally almost identical; their
  separate types express intent but duplicate implementation.
- The common `DeterministicClock.step` permits zero while stream steps require
  positive durations.
- Clock ownership differs by integration: streams step their clock, the fleet
  runner steps its clock outside robot streams, and replay advances through a
  specialized method. These rules are documented but easy to misuse.

Keep the public clock roles, but specify ownership and zero-step semantics as
normative API behavior.

### Reporting layer

Pure string renderers are an excellent boundary for CI and terminal use.
Deterministic formatting and no implicit output should remain unchanged.

Some low-level formatters are exported even though they appear primarily
implementation-oriented. The v1 API decision should either bless them as
stable public utilities or stop exposing them before v1.

## What should remain unchanged

- Synchronous, caller-stepped execution.
- Plain-object snapshots, events, profiles, logs, timelines, and artifacts.
- Seeded local simulation with no wall-clock reads.
- Independent per-robot replay logs.
- Timeline as a derived read model.
- Pure report renderers.
- Transport and middleware independence.
- Small hardware adapter interfaces and deterministic virtual adapters.
- Structured validation results rather than validator exceptions.

## What should be simplified before v1

1. Define one authoritative event-type vocabulary below both stream
   implementations.
2. Define one supported-version policy and apply it at every load boundary.
3. Specify event ownership and defensively isolate recorded/replayed evidence.
4. Classify the root exports into stable SDK, advanced persistence, and
   implementation utility surfaces.
5. Replace broad determinism prose with a concise normative guarantee and its
   preconditions.

Runner deduplication can wait until after v1 unless a bug requires touching
both implementations.

## Longer-term architectural risks

- More event producers will magnify the current event-vocabulary dependency.
- Additional artifact versions will be difficult without compatibility and
  migration policy.
- Real adapters will pressure the synchronous interface; that should be
  handled in a separate integration layer rather than changing the core.
- More fleet features could blur the distinction between deterministic test
  orchestration and distributed robot control.
- A single very broad root entry point will make future API compatibility and
  non-Node use harder.

## Architecture verdict

The architecture is coherent and worth preserving. It is not yet ready to be
frozen as v1 because its serialized and event-ownership contracts are less
strict than its documentation implies. Address those boundaries; do not
restructure the core.
