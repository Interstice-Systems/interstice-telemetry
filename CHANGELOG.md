# Changelog

All notable changes to Interstice Telemetry are documented here. The project
uses [Semantic Versioning](https://semver.org/) for npm releases. Serialized
replay, fleet replay, artifact, and timeline formats have independent version
fields.

## Unreleased

### Added

- Generic custom experiment bundle creation, structured validation, custom
  JSON and text report export, deterministic derived evidence manifests, and
  a custom experiment summary renderer.
- Custom experiment documentation, example, and release-candidate regression
  coverage.

### Changed

- Custom artifact validation now permits an empty robot list for generic
  experiments while preserving scenario and fleet requirements.
- The earlier `exportCustomEvidenceArtifacts` API remains available unchanged.

## 1.0.0-rc.1 — 2026-07-04

The v1.1–v1.5 entries below describe unpublished internal engineering
milestones. `1.0.0-rc.1` is the first npm release candidate.

### Added

- Generic deterministic custom-mission evidence artifact export with indexed
  JSON/text reports and explicit overwrite control.
- Pure deterministic twin diagnostic text rendering.

### Changed

- Clarified canonical `RobotState`, telemetry `RobotOperatingMode`,
  same-timestamp replay bridge behavior, and provenance seeding.
- Classified command/custom adapter events, runtime adapter state transitions,
  and richer bridge helpers as post-v1 work.
- Standardized GitHub package metadata, updated v1 RC security support, and
  added local GitHub/npm governance setup and CI package-dry-run gates.

## 1.5.0 — 2026-07-03

### Added

- v1 API freeze classification and an exact generated-declaration baseline.
- CI declaration compatibility and packed Node/TypeScript/browser consumer
  gates.
- Seven serialized compatibility fixtures with validation and deterministic
  round-trip tests.
- Release checklist, v1 release plan, and conservative RC readiness review.
- Focused scenario/fleet runner failure-cleanup regression tests.

### Changed

- Scenario and fleet runners now stop recorders, stop streams, and unsubscribe
  internal handlers when execution fails.
- Package metadata now declares repository, homepage, issue tracker, and
  release-oriented keywords.

## 1.4.0 — 2026-07-03

### Added

- Immutable canonical evidence manifest entries and relationships.
- Deterministic manifest builders, validation, serialization, and reports.
- Cycle-safe lineage traversal and evidence lookup queries.
- Provenance coverage summaries and text reports.
- Evidence manifest, manifest report, and provenance coverage files in
  scenario and fleet artifact exports.
- Evidence examples, tests, documentation, and migration guidance.

### Changed

- Added three artifact file kinds without changing artifact bundle version
  `0.8.0` or existing replay, twin, provenance, and artifact structures.

## 1.3.0 — 2026-07-03

### Added

- Immutable canonical evidence provenance and descriptive ownership contracts.
- Deterministic provenance builders, validation, identifiers, and text reports.
- Optional provenance propagation through telemetry events, replay recording,
  twin timeline bridges, and twin diagnostic reports.
- Browser-safe provenance exports, examples, tests, and migration guidance.

### Changed

- Added optional provenance fields without changing replay or twin format
  versions; values without provenance retain their prior serialized shapes.

## 1.2.0 — 2026-07-03

### Added

- Draft 2020-12 schemas, isolated Ajv validation, and stable v1.1 fixtures for
  robot state, scene, and twin timeline contracts.
- Explicit deterministic telemetry snapshot and replay-event state bridges.
- Rule-based robot-state and timeline diagnostic reports.
- Deterministic multi-robot twin views and point-in-time state queries.
- Browser-safe `interstice-telemetry/digital-twin` package exports.
- Serializable twin replay cursor state.

### Changed

- Added optional canonical `RobotState.operatingMode`; existing serialized
  state and root exports remain compatible.

## 1.1.0 — 2026-07-02

### Added

- Immutable robot, link, joint, frame, sensor, actuator, attachment, and robot
  metadata contracts.
- Complete canonical `RobotState` snapshots with serialization and equality.
- Deterministic twin timeline reconstruction, replay cursor, and event markers.
- Scene metadata and future renderer, physics, simulation, robotics-platform,
  and fleet-visualization interfaces.
- Architecture guides, migration notes, and robot, scene, and timeline JSON
  examples.

### Changed

- Renamed the previous lifecycle status type export from `RobotState` to
  `RobotOperatingMode`; runtime telemetry and artifact formats are unchanged.

## 0.15.0 — 2026-07-01

### Added

- Getting-started, examples, replay, artifact, fleet timeline, and hardware
  adapter guides.

### Changed

- Reorganized the README, architecture, and roadmap around the deterministic
  evidence pipeline and v1 release gates.
- Included the documentation and changelog in the npm package.

## 0.14.0 — 2026-07-01

### Added

- MIT license and open-source contribution, conduct, and security policies.
- GitHub Actions CI for Node.js 20, 22, and 24.
- Issue and pull request templates.
- Release checklist and expanded npm package metadata.

## 0.13.0 — 2026-07-01

### Added

- Normative determinism contract.
- Mutation-isolation and deterministic evidence tests.
- Supported-version and canonical timeline validation.

### Changed

- Stream subscribers, replay recording, and replay playback now receive
  independent event copies.
- Replay, fleet replay, timeline, and artifact validators reject unsupported
  format versions.

## 0.12.0 — 2026-07-01

### Added

- Public API reference and stability classifications.
- Source-level public entry-point documentation.

### Changed

- No exports were removed or renamed.

## 0.11.0 — 2026-07-01

- Added the derived global fleet event timeline, deterministic cross-robot
  ordering, queries, validation, reporting, and artifact export.

## 0.10.0 — 2026-07-01

- Added simulation, logical, replay, and fleet clocks with validation and
  optional runner/stream integration.

## 0.9.0 — 2026-06-30

- Added deterministic adapter telemetry streams and shared replay/report
  integration.

## 0.8.0 — 2026-06-30

- Added experiment artifact bundles, local persistence, validation, readback,
  and scenario/fleet exporters.
- The repository history contains the v0.8.0 commit but no local `v0.8.0` tag.

## 0.7.0 — 2026-06-30

- Added deterministic fleet scenarios, per-robot replay, validation, and
  reports.

## 0.6.0 — 2026-06-30

- Added synchronous hardware adapter contracts and deterministic virtual
  adapters.

## 0.5.0 — 2026-06-30

- Added pure terminal-first telemetry, event, fault, replay, and scenario
  reports.

## 0.4.0 — 2026-06-30

- Added reusable deterministic scenario profiles and built-in scenarios.

## 0.3.0 — 2026-06-30

- Added replay recording, validation, serialization, and synchronous playback.

## 0.2.0 — 2026-06-30

- Added manually stepped telemetry event streams.

## 0.1.0 — 2026-06-30

- Initial deterministic robot telemetry simulator.
