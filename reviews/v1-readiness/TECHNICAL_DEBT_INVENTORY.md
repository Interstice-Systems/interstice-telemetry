# Technical Debt Inventory

This inventory records v1-relevant debt found in the current repository. It
does not treat deliberate non-goals such as ROS integration, cloud storage, or
real-time scheduling as debt.

## TD-001 — Public API surface is not classified

- Severity: high
- Category: API design
- Description: The root entry point exports primary workflows, extension
  contracts, low-level formatters, path helpers, serializers, constants, raw
  built-in arrays, and bundle construction utilities without stability tiers.
- Why it matters: Publishing v1 implicitly commits to all exported names and
  behaviors, making future cleanup breaking.
- Suggested action: Define the supported root surface, advanced subpaths if
  needed, and a compatibility policy; add an API declaration snapshot.
- Breaking change risk: high

## TD-002 — Recorded and replayed events are mutable by reference

- Severity: high
- Category: timeline/fleet/replay integration
- Description: Streams deliver one event object to all handlers, the recorder
  retains that reference, logs shallow-copy event arrays, and the player emits
  stored event objects directly.
- Why it matters: A subscriber or caller can alter recorded evidence and make
  replay results depend on handler order.
- Suggested action: Establish ownership semantics and defensively clone or
  freeze events at stream, recorder, log, and player boundaries; add mutation
  tests.
- Breaking change risk: medium

## TD-003 — Serialized format versions are not enforced

- Severity: high
- Category: artifacts/persistence
- Description: Replay, fleet replay, artifact, and timeline validators require
  a non-empty version but accept any value.
- Why it matters: Unsupported future or malformed formats can be reported as
  valid, undermining compatibility promises.
- Suggested action: Define supported versions and reject or explicitly warn on
  unsupported versions at every validation/load boundary.
- Breaking change risk: medium

## TD-004 — Replay and timeline validators do not enforce canonical invariants

- Severity: high
- Category: timeline/fleet/replay integration
- Description: Replay validation does not require positive/contiguous
  sequences, non-negative/nondecreasing timestamps, unique event IDs, or
  event-specific payloads. Timeline validation permits sequence gaps, warns
  rather than fails on backward time, and does not verify full canonical
  ordering or `createdAt`.
- Why it matters: Data can pass validation while violating builder guarantees
  and deterministic evidence assumptions.
- Suggested action: Write normative schemas/invariants, then align builders,
  validators, and negative tests.
- Breaking change risk: medium

## TD-005 — Deserializers return unchecked domain casts

- Severity: medium
- Category: artifacts/persistence
- Description: JSON deserializers verify only that the root is an object and
  then cast to `ReplayLog`, `FleetReplayLog`, or `FleetEventTimeline`.
- Why it matters: TypeScript callers may treat malformed external data as
  trusted domain values.
- Suggested action: Add validated parse/load paths and make unchecked behavior
  explicit in naming or return types.
- Breaking change risk: medium

## TD-006 — Core events depend on hardware event definitions

- Severity: medium
- Category: architecture
- Description: `events/eventTypes.ts` imports `ADAPTER_EVENT_TYPES` from the
  hardware layer to build the shared vocabulary.
- Why it matters: New producers increase upward coupling and risk a real
  circular dependency.
- Suggested action: Move the authoritative event taxonomy to a lower shared
  module and let both streams depend on it.
- Breaking change risk: low

## TD-007 — Scenario orchestration is duplicated

- Severity: medium
- Category: architecture
- Description: Single-scenario and fleet runners separately implement runtime
  construction, sorting faults, stepping, recording, cleanup, and result
  construction.
- Why it matters: Partial-step, fault timing, clock, or cleanup fixes can land
  in one path but not the other.
- Suggested action: First add cross-runner conformance tests; extract a small
  internal robot runtime only when both paths need modification.
- Breaking change risk: low

## TD-008 — Clock ownership and zero-step rules are inconsistent

- Severity: medium
- Category: clock integration
- Description: Common clocks accept zero-duration steps, streams reject them,
  streams may advance supplied clocks, fleet advances its clock separately,
  and replay uses a specialized navigation method.
- Why it matters: Reusing or sharing clocks incorrectly can create timestamps
  that look valid but do not correspond to execution.
- Suggested action: Specify component ownership, allowed reuse, reset behavior,
  and zero-step semantics; add integration tests.
- Breaking change risk: medium

## TD-009 — Subscriber exceptions can interrupt deterministic pipelines

- Severity: medium
- Category: architecture
- Description: Handler errors propagate during synchronous iteration. In a
  runner this can prevent later handlers and normal stop/unsubscribe cleanup.
- Why it matters: A reporting or observer callback can corrupt run lifecycle
  and recorded evidence.
- Suggested action: Define fail-fast versus isolated-subscriber policy and use
  `try/finally` for runner cleanup regardless of that policy.
- Breaking change risk: medium

## TD-010 — Artifact writes are non-atomic

- Severity: medium
- Category: artifacts/persistence
- Description: With overwrite enabled, the existing experiment directory is
  removed and new files are written directly to the final path.
- Why it matters: Interruption can leave no valid old bundle and an incomplete
  new bundle.
- Suggested action: Write and validate a sibling temporary directory, then
  rename it into place with documented platform limitations.
- Breaking change risk: low

## TD-011 — Artifact integrity is only structural

- Severity: medium
- Category: artifacts/persistence
- Description: The index lists files but has no size or content digest, and
  loaded file content is not uniformly validated against domain schemas.
- Why it matters: Corruption or accidental edits may remain undetected while
  an experiment appears complete.
- Suggested action: At minimum validate every recognized loaded document and
  report missing/unreadable files as an invalid load; consider manifest
  digests in a future format version.
- Breaking change risk: medium

## TD-012 — Event payload typing is not discriminated

- Severity: medium
- Category: TypeScript strictness
- Description: `TelemetryEvent.type` is a union but `payload` is `unknown`.
  Separate payload interfaces do not narrow from the type.
- Why it matters: Consumers must perform runtime checks or unsafe casts for
  routine event handling.
- Suggested action: Decide before v1 whether to introduce a discriminated
  event union or a compatible event-type-to-payload mapping.
- Breaking change risk: high

## TD-013 — Telemetry units and ranges are implicit

- Severity: medium
- Category: naming
- Description: Names imply percentages, volts, RPM, Celsius, dBm, and vector
  values, but contracts do not state units, valid ranges, coordinate frame, or
  timestamp basis.
- Why it matters: Adapter implementers can produce type-correct but
  semantically incompatible snapshots.
- Suggested action: Document a telemetry data dictionary and validate
  high-value range constraints where appropriate.
- Breaking change risk: medium

## TD-014 — Determinism contract omits ownership and extension preconditions

- Severity: high
- Category: docs
- Description: Documentation repeatedly promises equal outputs for equal
  inputs but does not centralize runtime, mutation, custom adapter/clock, and
  handler preconditions.
- Why it matters: Users may treat deterministic simulation as a stronger
  distributed or tamper-proof guarantee.
- Suggested action: Publish one normative determinism contract and link to it
  from every workflow.
- Breaking change risk: none

## TD-015 — Documentation is milestone-oriented rather than user-oriented

- Severity: high
- Category: docs
- Description: The README is a long sequence of version additions and the
  roadmap mixes history with future scope.
- Why it matters: New users cannot quickly identify the current golden path,
  support boundary, or stable API.
- Suggested action: Rewrite the README around workflows and move release
  history to a changelog.
- Breaking change risk: none

## TD-016 — Examples are not runtime-smoke-tested

- Severity: medium
- Category: examples
- Description: Examples are typechecked but there is no automated suite that
  executes them. Artifact examples write to a persistent default path.
- Why it matters: Examples can compile yet fail at runtime or on repeated use.
- Suggested action: Execute examples in CI with isolated temporary output and
  add a built-package consumer example.
- Breaking change risk: none

## TD-017 — No coverage or compatibility release gates

- Severity: medium
- Category: tests
- Description: There is no coverage threshold, declaration/API diff, mutation
  test, golden artifact compatibility test, or packaged-consumer test.
- Why it matters: Unit tests can remain green while public declarations,
  package contents, or serialized contracts break.
- Suggested action: Add targeted release gates, prioritizing API declaration,
  tarball import, and golden format tests over a vanity coverage percentage.
- Breaking change risk: none

## TD-018 — Package and legal metadata are incomplete

- Severity: high
- Category: package/release process
- Description: The package lacks a license file and `license`, repository,
  bugs, homepage, author/maintainer, and keyword metadata.
- Why it matters: Public use has no clear legal permission and npm/GitHub
  presentation is incomplete.
- Suggested action: Choose a license deliberately and complete package
  metadata before publication.
- Breaking change risk: none

## TD-019 — No continuous integration or release process

- Severity: high
- Category: package/release process
- Description: No workflow runs quality gates, inspects a tarball, tests
  supported Node versions, or records a reproducible release procedure.
- Why it matters: Local success cannot establish that the published artifact
  is reproducible or usable.
- Suggested action: Add CI, a release checklist, tarball smoke test, provenance
  policy, and release-note process.
- Breaking change risk: none

## TD-020 — Release history is incomplete

- Severity: medium
- Category: package/release process
- Description: There is no changelog, and the local tag sequence skips v0.8.0
  even though package history documents that milestone.
- Why it matters: Users cannot evaluate compatibility or trace artifact format
  introductions.
- Suggested action: Reconstruct a concise changelog from tags/commits and
  explain or repair the tag gap according to repository policy.
- Breaking change risk: none

## TD-021 — Validation behavior is inconsistent across domains

- Severity: low
- Category: API design
- Description: Validators differ in punctuation, whitespace handling,
  warning use, date checks, and whether malformed nested content returns
  errors or can later throw.
- Why it matters: Consumers cannot apply one predictable validation pattern.
- Suggested action: Define validator conventions and shared private guards;
  preserve public result shapes.
- Breaking change risk: low

## TD-022 — Root package is implicitly Node-only

- Severity: low
- Category: package/release process
- Description: Artifact modules import `node:fs`, `node:path`, and `node:util`
  and are re-exported from the single root entry point.
- Why it matters: Browser/bundler users may assume pure simulation modules are
  portable even though the package is not presented that way.
- Suggested action: Explicitly declare Node/ESM scope for v1; consider pure and
  Node persistence subpaths only if a real portability requirement emerges.
- Breaking change risk: medium

## Priority summary

P0 debt: TD-001, TD-002, TD-003, TD-004, TD-014, TD-018, TD-019.

P1 debt: TD-005, TD-006, TD-008, TD-009, TD-012, TD-013, TD-015,
TD-016, TD-017, TD-020.

P2 or post-v1 debt: TD-007, TD-010, TD-011, TD-021, TD-022.
