# Twin Diagnostics

Twin diagnostics are deterministic evidence checks, not AI analysis.

- `validateRobotState` checks schema shape, robot identity, operating mode,
  battery range, and finite pose values.
- `validateTwinTimeline` checks schema shape, empty timelines, robot identity,
  monotonic and unique state timestamps, and scene references.
- `runTwinDiagnostics` accepts an optional expected scene and schema-check
  setting.
- `renderTwinDiagnosticReport` returns deterministic plain text for logs,
  reviews, and custom artifact reports.

Reports contain stable diagnostic identifiers, severity, category, location,
evidence, and deterministic ordering. A report is invalid only when it has an
error; warnings such as an empty timeline remain visible without changing the
meaning of `valid`.

Diagnostics inspect supplied evidence. They do not estimate physical
plausibility, repair records, or infer missing state.

```ts
import {
  renderTwinDiagnosticReport,
  runTwinDiagnostics,
} from "interstice-telemetry";

const report = runTwinDiagnostics(timeline);
const text = renderTwinDiagnosticReport(report);
```

The renderer includes validity, severity counts, and each diagnostic's
severity, category, identity, robot, timestamp, message, and canonical evidence
summary when present. It sorts a defensive copy and always returns a trailing
newline. It does not write to the console.
