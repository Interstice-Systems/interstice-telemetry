# Rover-0 Pre-v1 Dogfood Review

Source reviewed: `../interstice-rover-0/DOGFOOD_NOTES.md`.

## Must fix before public v1

- Generic custom-mission artifact packaging. Custom applications need a
  supported high-level path that preserves the SDK artifact index and
  formatting without constructing scenario/fleet results.

## Should fix before public v1

- Deterministic `TwinDiagnosticReport` text rendering.
- Clear documentation and JSDoc separating canonical `RobotState` from the
  status-only `RobotOperatingMode`.
- Explicit same-timestamp replay bridge semantics and a safe elapsed-time
  integration pattern.
- Prominent provenance seeding through `ReplayRecorder` for adapter streams.

## Post-v1

- Adapter command/custom events.
- Mutable adapter-stream operating-state transitions.
- Richer bridge/coalescing helpers.
- Further adapter payload narrowing ergonomics.

These require event semantics and lifecycle design beyond a conservative
release-candidate patch.

## Rejected for now

- A command bus or general custom-event architecture.
- A major telemetry bridge rewrite.
- Making virtual adapters into a robotics runtime.
- Renaming or removing public state APIs.

## Correctness conclusion

Rover-0 found no SDK correctness bug. The observed friction was packaging,
presentation, naming, and application-owned integration policy.
