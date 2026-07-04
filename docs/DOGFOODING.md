# Dogfooding

The Rover-0 application exercised the public SDK as a custom, adapter-backed
mission rather than a built-in scenario. It produced deterministic replay,
canonical state, twin timeline, diagnostics, provenance, and evidence-manifest
output through package-root imports.

The final pre-v1 response is intentionally narrow:

- `createCustomExperimentBundle`, `validateCustomExperimentBundle`, and
  `exportCustomExperimentBundle` package custom application evidence in the
  existing indexed local artifact format.
- Safe custom JSON and text reports remove application-owned path/index glue.
- A conservative derived manifest covers declared canonical evidence while
  preserving any caller-provided manifest.
- `renderTwinDiagnosticReport` provides deterministic reviewable text.
- State naming, same-timestamp replay mapping, and provenance seeding are
  documented explicitly.

Rover-0 found no SDK correctness or serialized-compatibility defect.
Command/custom adapter events, runtime adapter operating-state transitions,
and richer bridge helpers remain post-v1 design work. A custom mapper should
fold same-timestamp events in sequence and integrate elapsed time only once.

Dogfood applications should retain their own domain result model. They should
not manufacture SDK scenario/fleet result objects solely for persistence.
Rover-0 remains unmigrated for this release-candidate patch; migration should
be a separate consumer change validated against byte-level expectations.
