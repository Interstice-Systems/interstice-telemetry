# Migrating to v1.1

Existing telemetry, replay, fleet timeline, and experiment artifact formats
are unchanged.

The only source-level rename reserves `RobotState` for the new complete
digital-twin state. The previous simulator lifecycle string union is exported
as `RobotOperatingMode`:

```ts
// Before
import type { RobotState } from "interstice-telemetry";
const mode: RobotState = "active";

// v1.1
import type { RobotOperatingMode } from "interstice-telemetry";
const mode: RobotOperatingMode = "active";
```

Runtime methods such as `RobotSimulator.setState("active")` and all serialized
telemetry values retain their previous behavior. Code that did not import the
old type name requires no migration.

Digital-twin artifacts are additive and use independent schema version
`1.0.0`. Existing `ReplayLog` values should not be relabeled as twin timelines;
reconstruct a `TwinTimeline` explicitly when complete state inspection is
needed.
