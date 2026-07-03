# Documentation Review

## Executive assessment

The existing documentation is technically detailed and unusually honest about
non-goals. It explains how each milestone works and includes runnable examples.
However, it reads as a release-history narrative rather than product
documentation for a new user. The preferred positioning, "Deterministic
robotics observability infrastructure," is broader and more accurate than the
README's opening description of a telemetry simulator, but the docs do not yet
organize the project around that positioning.

## README

### What is clear

- The first simulator example is short and runnable.
- Deterministic execution and the absence of timers are repeatedly stated.
- Replay, scenarios, fleets, clocks, adapters, artifacts, timelines, and
  reports each have examples.
- Limitations explicitly reject real-device control, ROS, networking,
  distributed synchronization, and web UI claims.
- Every example has a corresponding npm script.

### What is confusing

- The README is organized by version (`v0.2`, `v0.3`, and so on), forcing a
  first-time reader to reconstruct the current architecture chronologically.
- The opening calls the package a "telemetry simulator," while the mission and
  current feature set support the stronger observability-infrastructure
  framing.
- Clocks and the fleet timeline appear before the older foundational sections,
  then the document resumes chronological order.
- "Deterministic" is used broadly without one normative statement of inputs,
  runtime assumptions, mutable-event caveats, and extension boundaries.
- Replay can be mistaken for time-paced playback, despite being synchronous
  event-order playback.
- Artifact code writes to local disk, but the quick start does not highlight
  that side effect.

### What is missing

- Installation from the package registry and a minimal consumer project.
- A five-minute workflow connecting simulation to stream, replay, and report.
- A capability/non-goal table.
- An API stability and semantic-versioning policy.
- Supported Node and module-system statement beyond `Node.js 20`.
- Units and ranges for snapshot fields and hardware readings.
- Error, validation, mutation, and event-delivery semantics.
- Serialized format compatibility policy.
- Links to API reference, contribution, security, changelog, and license
  documents (those files do not yet exist).
- A troubleshooting section.

### Recommended rewrite

Reorganize the README:

1. Positioning and one-paragraph problem statement.
2. Capabilities and explicit non-goals.
3. Install and five-minute end-to-end example.
4. Core concepts: snapshot, stream, replay, scenario, fleet, timeline,
   artifact.
5. Hardware adapters and clocks as extension points.
6. Examples table with command and outcome.
7. Determinism contract.
8. Compatibility/support links.

Move milestone history to the changelog.

## `docs/Architecture.md`

### What is clear

- The layered descriptions closely match implementation.
- Data flow diagrams are simple and useful.
- Each layer states non-goals and determinism behavior.
- Artifact, fleet, and timeline authority boundaries are explained well.
- The distinction between virtual adapters and real hardware is explicit.

### What should improve

- Add one top-level dependency diagram and a table of allowed dependency
  directions.
- Identify `TelemetrySnapshot`, `TelemetryEvent`, `ReplayLog`,
  `FleetReplayLog`, `FleetEventTimeline`, and
  `ExperimentArtifactBundle` as the canonical evidence chain.
- Separate normative contracts from descriptive implementation details.
- Document event ownership, subscriber exception behavior, and clock
  ownership.
- Explain version boundaries and migration policy for each serialized format.
- State that the package is Node/ESM and artifact persistence is synchronous.
- Resolve or explicitly acknowledge the core-events-to-hardware dependency.
- Add architecture decision records only for decisions expected to constrain
  future work; do not create process overhead for every implementation detail.

## `docs/Roadmap.md`

The roadmap is a clean milestone list, but it is not a v1 readiness plan.
It currently schedules diagnostics in v0.12 and includes diagnostics in the
v1 definition even though the requested audit is not a feature milestone.

Before release, decide whether diagnostics are truly required for v1. The
stronger recommendation is to define v1 around the existing coherent system,
prioritize contract/release hardening, and move new diagnostic capability
after the stable release unless user evidence proves it is essential.

Completed milestone history belongs in `CHANGELOG.md`; the roadmap should show
remaining outcomes, owners or acceptance criteria, and release gates.

## Examples

Strengths:

- Eleven examples cover every major capability.
- They are compact and use only the public root entry point.
- The examples are included in typecheck.
- They progress from basic simulation to fleet artifacts.

Gaps:

- No automated smoke test executes all examples.
- There is no single end-to-end "golden path" example.
- The artifact example writes to a default relative `artifacts` directory and
  can fail on a second run unless cleaned or overwritten.
- Examples assume a source checkout and `tsx`; there is no test of consuming
  the built package exactly as published.
- Failure examples do not demonstrate how to handle validator errors before
  playback or loading.

Recommended additions are documentation/test work, not new SDK features:

- A concise `examples/README.md` table.
- One end-to-end example from scenario through artifact readback.
- A smoke script that runs examples in temporary directories.
- A packaged-consumer example compiled against the tarball.

## Package scripts

The scripts are clear and map one-to-one to examples. Missing documentation
and release scripts include coverage, packaged-consumer verification, API
compatibility checking, and a prepublish gate. These should be added only as
release tooling, not runtime features.

## Coverage of the product concepts

| Concept | Current clarity | Main gap |
|---|---|---|
| Simulation | Strong | Model fidelity and units |
| Streams | Strong | Subscriber errors and ownership |
| Replay | Strong | Validation/version and non-paced semantics |
| Scenarios | Strong | Boundary/fault scheduling contract |
| Fleet runs | Strong | Clock ownership and single-runner parity |
| Clocks | Moderate | Which component advances which clock |
| Adapters | Strong on non-goals | Real implementation requirements and units |
| Artifacts | Strong | Compatibility, atomicity, integrity |
| Timelines | Strong | Canonical validation and timestamp meaning |
| Reports | Strong | Stability expectations for text formats |

## Diagrams that would help

- One evidence pipeline:
  `profile -> events -> replay -> fleet timeline -> artifact -> report`.
- One clock ownership sequence for stream, scenario, fleet, and replay.
- One artifact directory diagram for scenario and fleet bundles.
- One extension-boundary diagram showing simulator versus adapter-backed
  telemetry converging on `TelemetrySnapshot`.

## Positioning assessment

"Deterministic robotics observability infrastructure" is defensible if
"infrastructure" is immediately qualified as a software SDK for simulation,
replayable evidence, experiment artifacts, and terminal inspection. It should
not imply production telemetry transport, storage services, distributed
tracing, real-time monitoring, or device control.

A precise supporting line would be:

> A transport-independent TypeScript SDK for generating, recording,
> replaying, validating, and inspecting repeatable robot telemetry
> experiments.

## Documentation verdict

The docs prove technical substance but are not yet optimized for onboarding or
API commitment. Rewrite navigation and contract sections before public v1;
preserve the accurate layer descriptions and non-goal discipline.
