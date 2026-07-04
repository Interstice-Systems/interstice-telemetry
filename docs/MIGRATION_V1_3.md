# Migrating to v1.3

Version 1.3 adds evidence provenance without removing or renaming existing
APIs. Existing replay and twin documents remain valid.

## Optional fields

`TelemetrySnapshot`, `TelemetryEvent`, `ReplayLog`, and `TwinTimeline` now
accept optional `provenance`. `TwinDiagnosticReport` includes it only when the
input timeline carries provenance.

No-provenance builders produce the same object shapes as v1.2. Replay format
version `0.3.0` and twin timeline schema version `1.0.0` are unchanged because
the new fields are optional and backward-compatible.

## Adoption

1. Create provenance at the earliest trusted application boundary.
2. Pass it on telemetry/events or through `ReplayRecorder` and bridge options.
3. Validate imported provenance with `validateEvidenceProvenance`.
4. Treat ownership and confidence as descriptions, not security decisions.

Metadata must be finite JSON data. Builders reject `undefined`, non-finite
numbers, class instances, functions, symbols, and circular references.
