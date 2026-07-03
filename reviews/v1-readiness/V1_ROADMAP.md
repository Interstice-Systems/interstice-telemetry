# Prioritized Roadmap for v1.0

## Roadmap principles

- Freeze and explain the existing coherent product; do not add platform
  features to qualify v1.
- Treat exported TypeScript declarations and serialized evidence formats as
  separate compatibility contracts.
- Add tests before changing boundary behavior.
- Keep synchronous stepping, transport independence, and plain data intact.
- Release only the tarball that CI tested.

## P0 — Required before v1.0

### 1. Decide and freeze the v1 public API

Technical work:

- Classify every root export as stable, advanced, moved, or removed.
- Resolve event payload typing, timeline `clockKind`, clock injection, and
  deserializer naming/behavior decisions.
- Add a generated declaration snapshot or API compatibility check.

Acceptance criteria:

- A reviewed public API inventory exists.
- Any prerelease breaking changes have migration notes.
- CI fails on unapproved declaration changes.

### 2. Specify and harden evidence formats

Technical work:

- Write normative invariants for `ReplayLog`, `FleetReplayLog`,
  `FleetEventTimeline`, and `ExperimentArtifactBundle`.
- Enforce supported versions at validation and load boundaries.
- Enforce canonical sequence, timestamp, event ID, ordering, and payload rules
  selected by the specification.
- Add valid, malformed, unsupported-version, and compatibility fixtures.

Acceptance criteria:

- No unchecked external JSON is presented as validated domain data.
- Builders produce values accepted by validators.
- Mutated canonical fixtures fail for the expected reason.
- Version compatibility behavior is documented.

### 3. Make event evidence mutation-safe and cleanup exception-safe

Technical work:

- Define event/payload ownership.
- Prevent handler or replay subscriber mutations from changing stored
  evidence.
- Ensure runners clean up streams, recorders, and subscriptions with
  `try/finally`.
- Add adversarial subscriber and object-identity tests.

Acceptance criteria:

- Handler order cannot alter a replay log.
- Replay handlers cannot alter subsequent replay output or the source log.
- Observer exceptions leave lifecycle state documented and clean.

### 4. Complete legal and package metadata

Repository work:

- Choose and add a `LICENSE`.
- Add package `license`, repository, bugs, homepage, maintainer, and keyword
  metadata.
- Confirm ESM-only and Node >=20 support policy.
- Decide whether generated `artifacts/` belongs in `.gitignore`.

Acceptance criteria:

- License choice is owner-approved.
- `npm pack --dry-run` contains the expected legal and runtime files only.
- Package metadata links resolve to the intended public repository.

### 5. Establish CI and a reproducible release gate

Release work:

- Run test, typecheck, lint, build, and diff checks in CI.
- Pack the module and install it in a clean temporary ESM consumer.
- Compile representative public imports and execute a short deterministic
  workflow from the tarball.
- Add a release checklist covering version, changelog, tag, package contents,
  provenance, and rollback/deprecation policy.

Acceptance criteria:

- A clean checkout passes on every supported Node major.
- The exact tested tarball is the release candidate.
- Publication cannot bypass the required gates.

### 6. Rewrite onboarding and contract documentation

Documentation work:

- Reframe the README around "Deterministic robotics observability
  infrastructure" with immediate qualification.
- Add install instructions, a five-minute evidence pipeline, capability
  boundaries, examples index, and troubleshooting.
- Add normative determinism, units/ranges, timestamps, sequences, ownership,
  validation, clock, and format compatibility sections.
- Move completed milestone history into `CHANGELOG.md`.

Acceptance criteria:

- A new user can install the package and create, replay, and inspect evidence
  without reading source.
- Every public workflow links to its lifecycle and failure semantics.
- Claims match tested behavior and non-goals.

## P1 — Strongly recommended before v1.0

### Architecture and technical work

- Move shared event taxonomy below simulator and adapter streams without
  renaming stable event strings.
- Add single/fleet runner conformance tests for equal robot profiles, partial
  final steps, equal-time faults, and clock starts.
- Define validator conventions and align nested-malformation behavior.
- Add range/semantic checks for high-value telemetry and adapter fields where
  the contract can be stated confidently.
- Document artifact non-atomicity; implement atomic replacement if artifacts
  are expected to be release-critical evidence.

### Test and example work

- Add coverage reporting with risk-based targets.
- Smoke-run all examples in isolated temporary directories.
- Add golden replay/timeline/artifact fixtures from the last prerelease.
- Test Node error paths and interrupted/missing artifact content.

### Repository work

- Add `CONTRIBUTING.md` with local commands and change categories.
- Add `SECURITY.md` with supported versions and private reporting path.
- Add a concise `CHANGELOG.md`, including the missing local v0.8 tag history.
- Add pull request and high-signal issue templates.

### Positioning work

- Interview 5–10 robotics platform, simulation, and QA engineers.
- Test whether their primary pain is reproducible failures, hardware scarcity,
  CI evidence, or fleet timeline inspection.
- Choose one primary initial workflow and show it first in documentation.

Acceptance criterion:

- At least three design partners can describe when they would use the SDK and
  successfully run the golden path without author assistance.

## P2 — Nice to have before v1.0

- Add `CODE_OF_CONDUCT.md`.
- Add dependency update automation with a defined review cadence.
- Publish compact architecture, clock ownership, and artifact-layout diagrams.
- Add README CI/version/license badges after the corresponding systems exist.
- Add an examples index with expected output and side effects.
- Add benchmark baselines for large replay/timeline/artifact operations so
  defensive cloning costs are visible.
- Improve report snapshot stability documentation if consumers parse text.
- Add a release-candidate period with named design-partner feedback.

These items should not delay v1 if P0 is complete and P1 risks are explicitly
accepted.

## Post-v1.0

Technical:

- Extract shared scenario/fleet runtime logic only when a concrete change
  needs both paths.
- Consider atomic artifact replacement and manifest digests in a versioned
  artifact format.
- Consider package subpaths if users require pure/browser-compatible modules.
- Evaluate anomaly/diagnostic reports against real user evidence.
- Keep async scheduling, transport, ROS, and real hardware in integration
  layers or separate packages.

Product/business:

- Explore hosted artifact retention, comparison, CI history, and fleet
  inspection only after the open-source workflow shows repeated use.
- Develop vendor/device adapters with partners rather than expanding the core
  interface speculatively.
- Measure activation (first successful replay/artifact), repeat experiment
  runs, retained artifacts, and design-partner adoption.

## Suggested release sequence

1. `0.12.0` or next prerelease: reviewed API changes and strict format/event
   contracts.
2. Release candidate: docs, legal/repository hygiene, CI, tarball and
   compatibility gates complete.
3. Design-partner validation period with only blocker fixes.
4. `1.0.0`: exact RC contract, changelog, tag, package, and release notes.

The version number of the hardening prerelease is a maintainer decision; do
not preserve the existing diagnostics milestone if it distracts from contract
work.
