# Twin Diagnostics

Twin diagnostics are deterministic evidence checks, not AI analysis.

- `validateRobotState` checks schema shape, robot identity, operating mode,
  battery range, and finite pose values.
- `validateTwinTimeline` checks schema shape, empty timelines, robot identity,
  monotonic and unique state timestamps, and scene references.
- `runTwinDiagnostics` accepts an optional expected scene and schema-check
  setting.

Reports contain stable diagnostic identifiers, severity, category, location,
evidence, and deterministic ordering. A report is invalid only when it has an
error; warnings such as an empty timeline remain visible without changing the
meaning of `valid`.

Diagnostics inspect supplied evidence. They do not estimate physical
plausibility, repair records, or infer missing state.
