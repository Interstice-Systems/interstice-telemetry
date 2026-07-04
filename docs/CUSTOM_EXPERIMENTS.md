# Custom Experiments

External applications often produce SDK evidence without running an SDK
scenario or fleet profile. The custom experiment API packages that evidence
without requiring the application to invent a scenario result or manually
coordinate file paths, indexes, and manifests.

Rover-0 motivated this API after dogfooding replay, twin, diagnostics,
provenance, and manifest APIs through public package imports. Rover-0 is not
migrated by this patch; its current artifacts remain an external compatibility
target.

## Create, validate, and export

```ts
import {
  createCustomExperimentBundle,
  exportCustomExperimentBundle,
  validateCustomExperimentBundle,
} from "interstice-telemetry";

const bundle = createCustomExperimentBundle({
  experimentId: "rover-0-square-patrol",
  createdAt: 0,
  metadata: {
    name: "Rover-0 square patrol",
    robotIds: ["rover-0"],
    tags: ["dogfood"],
    applicationVersion: 1,
  },
  evidence: {
    replayLog,
    replayValidation,
    twinTimeline,
    diagnostics,
    provenance,
    telemetrySummary,
  },
  customJson: {
    "mission-profile": missionProfile,
    metrics,
  },
  reports: {
    "mission-summary": missionSummaryText,
    "operator-notes.txt": operatorNotesText,
  },
});

const validation = validateCustomExperimentBundle(bundle);
if (!validation.valid) throw new Error(validation.errors.join("\n"));

const written = exportCustomExperimentBundle(bundle, {
  rootDir: "artifacts",
});
console.log(written.experimentPath, written.files);
```

`createCustomExperimentBundle` clones its inputs, normalizes `createdAt` to an
ISO string, sorts custom file keys, and derives a manifest by default.
`exportCustomExperimentBundle` also accepts the input shape directly. The
exporter is synchronous, Node-only, and local-filesystem only.

## Layout

Only supplied values are written, except for the index, metadata document, and
an enabled derived manifest:

```text
artifacts/<experiment-id>/
  artifact-index.json
  metadata.json
  replay-log.json
  replay-validation.json
  twin-timeline.json
  diagnostics.json
  provenance.json
  telemetry-summary.json
  evidence/
    evidence-manifest.json
  custom/
    <name>.json
  reports/
    <name>.txt
```

Keys are portable file names, not paths. A missing `.json` or `.txt` extension
is added. Absolute names, path separators, traversal segments, and unsafe
characters are rejected. Existing experiment directories are not replaced
unless `overwrite: true` is explicit.

The index remains the existing `ExperimentArtifactBundle` format with kind
`custom`. Custom JSON uses the existing JSON report file kind, so this API adds
no serialized format or file-kind version.

## Validation

`validateCustomExperimentBundle` returns `{ valid, errors, warnings }`. It
checks required experiment and metadata identity, optional robot IDs, safe and
non-colliding file names, JSON serializability, report text, replay logs, and
evidence manifests. A manifest must match the bundle experiment ID.

Missing provenance is a warning rather than an error. Metadata may contain
application-defined fields. `robotIds` is optional for custom experiments; if
omitted, the artifact metadata document uses an empty array to retain the
existing artifact metadata shape.

## Derived evidence manifest

When evidence is present and no manifest is supplied, creation derives a
minimal deterministic manifest by default. It includes entries only for the
canonical evidence files. It adds two relationships when their endpoints
exist:

- replay `validated-by` replay validation;
- twin timeline `derived-from` replay.

It does not infer provenance links, diagnostic causality, or relationships for
custom JSON and reports. Set `deriveEvidenceManifest: false` to opt out. The
choice survives a create-then-export flow. A caller-provided manifest is
cloned and exported unchanged.

Use `renderCustomExperimentSummary` for a compact deterministic text summary.
Existing `renderEvidenceManifestReport` and
`renderProvenanceCoverageReport` helpers cover the canonical manifest reports.

## Difference from scenario and fleet export

Scenario and fleet exporters understand runner result types and generate their
standard reports and aggregate structures. The custom exporter does not run,
interpret, or compare an application mission. It packages caller-owned
evidence at stable paths. Application-specific semantics remain in custom JSON
and plain-text reports.

This API does not add commands, custom runtime events, ROS, drivers,
networking, databases, cloud storage, visualization, physics, rendering, AI
analysis, or racing logic.
