# Changelog

All notable changes to Interstice Telemetry are documented here. The project
uses [Semantic Versioning](https://semver.org/) for npm releases. Serialized
replay, fleet replay, artifact, and timeline formats have independent version
fields.

## Unreleased

- No unreleased changes.

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
