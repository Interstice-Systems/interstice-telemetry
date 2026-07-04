# Roadmap

Interstice Telemetry `1.0.0-rc.1` is the first public v1 release candidate.
The v1.1–v1.5 labels below are unpublished internal engineering milestones.

## Completed stabilization milestones

- v0.12: classified and documented the public API surface.
- v0.13: published the determinism contract, isolated event ownership, and
  hardened format/canonical validation.
- v0.14: added licensing, governance, CI, changelog, package metadata, and a
  release checklist.
- v0.15: reorganized onboarding around the evidence pipeline.
- v1.1: added immutable robot, scene, state, event, and timeline contracts.
- v1.2: added JSON Schemas, compatibility fixtures, telemetry bridges,
  diagnostics, multi-robot views, and browser-safe exports.
- v1.3: added immutable provenance, descriptive ownership, validation,
  reporting, and replay/twin/diagnostic propagation.
- v1.4: added canonical evidence manifests, cycle-safe lineage queries,
  provenance coverage, and artifact exporter integration.
- v1.5: froze candidate APIs, automated declaration and packed-consumer gates,
  expanded serialized fixtures, and hardened runner cleanup.
- Pre-v1 dogfood patch: added custom-mission artifact export, deterministic
  diagnostic text rendering, and clarified state/bridge/provenance usage.

Historical feature releases are recorded in `CHANGELOG.md`.

## Required before v1.0

- Add a generated public declaration compatibility gate.
- Keep the packed-tarball browser-entry consumer gate in release verification.
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

- Extend golden compatibility fixtures to older non-twin serialized formats.
- Add single/fleet runner conformance tests.
- Add risk-based coverage reporting.
- Smoke-run examples in CI.
- Validate loaded documents through explicit safe parse APIs.
- Gather design-partner feedback from robotics platform and QA engineers.

## Post-v1 candidates

- Atomic artifact replacement and optional integrity digests.
- Command/custom adapter events and explicit adapter operating-state
  transitions.
- Richer replay/adapter bridge ergonomics beyond the documented mapper
  pattern.
- Internal scenario/fleet runtime deduplication when justified by maintenance.
- Generated schema compatibility and declaration reports.
- Mapper conformance and bounded large-timeline indexing.
- External integration packages for transports, middleware, or devices.

## Remaining release-candidate work

Confirm repository ownership, support/private security channels, npm
two-factor and provenance controls, and complete a release-candidate period
against the exact packed artifact.

## Recommended first post-v1 milestone

Focus v1.1 on reliability and compatibility ergonomics: validate-on-load APIs,
atomic artifact replacement, broader negative compatibility fixtures, and
generated human-readable API/format change reports. Do not expand into
rendering, middleware, networking, or cloud infrastructure.

The current digital-twin priorities and constraints are maintained in
[Future Roadmap](FutureRoadmap.md).

The core will remain synchronous, manually stepped, and transport-independent.
Cloud services, networking, ROS, real hardware drivers, timers, and interactive
visualization are not planned as core SDK responsibilities.
