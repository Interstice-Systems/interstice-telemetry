# Roadmap

Interstice Telemetry v1.1 provides the stable digital-twin foundation in
addition to the original telemetry evidence pipeline.

## Completed stabilization milestones

- v0.12: classified and documented the public API surface.
- v0.13: published the determinism contract, isolated event ownership, and
  hardened format/canonical validation.
- v0.14: added licensing, governance, CI, changelog, package metadata, and a
  release checklist.
- v0.15: reorganized onboarding around the evidence pipeline.

Historical feature releases are recorded in `CHANGELOG.md`.

## Required before v1.0

- Add a generated public declaration compatibility gate.
- Add a packed-tarball consumer test from a clean Node.js ESM project.
- Decide the final status of experimental adapter-stream and fleet-timeline
  contracts.
- Decide whether internal-candidate root exports stay, move, or receive a
  prerelease deprecation.
- Make runner cleanup exception-safe or explicitly accept the current
  fail-fast lifecycle risk.
- Configure authoritative repository, issue, security contact, and maintainer
  metadata.
- Run a release-candidate period against the exact packed artifact.

## Strongly recommended

- Add golden compatibility fixtures for every serialized format.
- Add single/fleet runner conformance tests.
- Add risk-based coverage reporting.
- Smoke-run examples in CI.
- Validate loaded documents through explicit safe parse APIs.
- Gather design-partner feedback from robotics platform and QA engineers.

## Post-v1 candidates

- Atomic artifact replacement and optional integrity digests.
- Internal scenario/fleet runtime deduplication when justified by maintenance.
- Package subpaths if pure/browser consumers emerge.
- Diagnostics over existing replay/timeline/artifact evidence.
- External integration packages for transports, middleware, or devices.

The current digital-twin priorities and constraints are maintained in
[Future Roadmap](FutureRoadmap.md).

The core will remain synchronous, manually stepped, and transport-independent.
Cloud services, networking, ROS, real hardware drivers, timers, and interactive
visualization are not planned as core SDK responsibilities.
