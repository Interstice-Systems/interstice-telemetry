# Browser-Safe Exports

Browser and client projects can import the pure digital-twin surface:

```ts
import {
  createMultiRobotTwinView,
  validateRobotStateSchema,
} from "interstice-telemetry/digital-twin";
```

This entry exposes immutable models, canonical JSON helpers, schemas,
compatibility fixtures, bridge utilities, diagnostics, timelines, replay
markers, and multi-robot views. It does not import filesystem-backed artifact
readers, writers, exporters, terminal reports, timers, or other Node-only
modules.

The root `interstice-telemetry` entry remains compatible and still exposes the
full SDK. Browser applications should use the subpath when they need a
dependency boundary that excludes Node persistence.
