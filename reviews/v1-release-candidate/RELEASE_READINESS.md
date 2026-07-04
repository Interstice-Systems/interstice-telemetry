# Release Readiness

## Decision

**READY_WITH_WARNINGS**

No known code-level blocker remains for an RC. Successful-run behavior and
serialized version constants remain compatible. Failure cleanup is stronger.
Scenario and fleet runners expose no mapper callback; telemetry bridge mappers
are pure and allocate no runner resources, so mapper exceptions require no
lifecycle cleanup.

## Required before publication

1. Verify the declared GitHub organization/repository URLs.
2. Confirm maintainer ownership and npm two-factor/provenance controls.
3. Enable and test a private vulnerability reporting channel.
4. Run CI on the exact clean candidate commit and inspect its tarball.
5. Complete an RC/design-partner validation period.
6. Use the resolved public sequence: `1.0.0-rc.1`, then `1.0.0` after the RC
   period. The v1.1–v1.5 labels are unpublished internal milestones.

## APIs still experimental

Adapter event streams, global fleet timelines, platform extension interfaces,
and application-defined metadata semantics remain experimental.

## Recommended v1.1

Add reliability-focused validate-on-load APIs, atomic artifact replacement,
negative compatibility fixtures, and generated API/format change reports.
