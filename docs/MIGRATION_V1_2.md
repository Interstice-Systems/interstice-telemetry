# Migrating to v1.2

Version 1.2 is additive. Existing v1.1 robot, scene, state, replay-event, and
twin-timeline JSON remains valid, and no root export was removed or renamed.

New consumers may:

1. validate external JSON with the published schema functions;
2. replace ad hoc reconstruction with a `TelemetryToStateMapper`;
3. run deterministic diagnostics before accepting a timeline;
4. combine independent timelines in a `MultiRobotTwinView`; and
5. use `interstice-telemetry/digital-twin` in browser builds.

`RobotState.operatingMode` is an optional typed field. Existing metadata-based
mode conventions remain readable; applications can populate the new field
when mapping telemetry.

Ajv is now a runtime dependency isolated behind schema validation. No existing
artifact or replay format changed.

The default bridge mapper is a baseline, not odometry. Applications requiring
physical fidelity must supply a mapper that owns frame, unit, calibration, and
event semantics.
