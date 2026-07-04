# Evidence Provenance

Evidence provenance is immutable metadata describing where robotics evidence
originated and which deterministic SDK stages transformed it.

Provenance describes evidence. It does not prove authenticity. It records how
evidence moved through the SDK.

## Lifecycle

```text
Simulation or telemetry
  -> Replay Recorder
  -> Twin Timeline Builder
  -> Diagnostics
```

The origin remains in `sourceType` and `sourceName`. Each later stage appends a
small `ProvenanceStep`; payloads are not copied into the history.

An `EvidenceProvenance` record contains:

- a provenance contract version and deterministic identifier;
- origin type, producer name, robot identity, and integer timestamp;
- an ISO creation time and confidence classification;
- ordered transformation steps and their input provenance references;
- descriptive ownership and optional JSON metadata.

## Confidence

- `exact`: deterministically generated or copied without measurement error.
- `measured`: observed by telemetry or hardware.
- `estimated`: inferred through a documented non-exact process.
- `derived`: produced by transforming prior evidence.

Confidence is descriptive. It is not a probability, verification result, or
security claim. `deriveProvenance` defaults transformed evidence to `derived`.

## Deterministic guarantees

Builders canonicalize object keys, reject non-JSON metadata, recursively freeze
their results, derive IDs from canonical content, and never read wall-clock
time. Callers must provide the evidence timestamp; `createdAt` defaults to the
ISO representation of that timestamp.

Transformation order is insertion order. Validators require nondecreasing
timestamps, unique transformation IDs, valid ownership values, and
syntactically valid non-self references.

## Propagation

Provenance is optional and additive:

- `TelemetrySnapshot` and `TelemetryEvent` may carry provenance.
- `TelemetryStream` appends `Telemetry Stream` when a source snapshot has it.
- `ReplayRecorder` appends `Replay Recorder`.
- telemetry/replay twin bridges append `Twin Timeline Builder`.
- twin diagnostics append `Diagnostics` to their report.

When input provenance is absent, these APIs omit the field and preserve legacy
serialized shapes.

## Limitations

The model has no authentication, signatures, permission enforcement, storage,
networking, or external identity resolution. References are validated within
the information in one record; the SDK does not fetch referenced evidence or
establish that it exists. Deterministic IDs are stable content identifiers, not
cryptographic digests.
