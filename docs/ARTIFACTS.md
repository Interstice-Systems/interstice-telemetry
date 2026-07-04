# Experiment Artifacts

Artifacts preserve machine-readable evidence and human-readable reports from a
completed scenario or fleet run.

## Export

Use high-level exporters:

```ts
const written = exportScenarioRunArtifacts(result, {
  rootDir: "artifacts",
  experimentId: "overheat-regression",
});
```

or:

```ts
const written = exportFleetRunArtifacts(fleetResult, {
  rootDir: "artifacts",
});
```

Custom applications can package SDK and application evidence without creating
a scenario or fleet result:

```ts
const written = exportCustomEvidenceArtifacts({
  experimentId: "rover-0-mission",
  rootDir: "artifacts",
  metadata: {
    name: "Rover-0 deterministic mission",
    robotIds: ["rover-0"],
  },
  replayLog,
  replayValidation,
  twinTimeline,
  diagnostics,
  provenance,
  evidenceManifest,
  reports: {
    "mission-report.txt": renderMissionReport(mission),
    "metrics.json": { format: "json", content: mission.metrics },
  },
});
```

Writers refuse to replace an existing experiment directory by default. Set
`overwrite: true` only when replacement is intended.

## Scenario layout

```text
<experiment>/
  artifact-index.json
  metadata.json
  scenario.json
  replay-log.json
  validation.json
  telemetry-summary.json
  reports/
    scenario-report.txt
    telemetry-report.txt
    event-timeline.txt
    fault-report.txt
    replay-report.txt
```

Fleet artifacts add the fleet replay wrapper, aggregate reports, per-robot
evidence, and a derived timeline:

```text
<experiment>/
  artifact-index.json
  metadata.json
  fleet-scenario.json
  fleet-replay-log.json
  validation.json
  telemetry-summary.json
  reports/
  timeline/
    fleet-event-timeline.json
    fleet-timeline-report.txt
    fleet-timeline-summary.txt
  robots/<sanitized-robot-id>/
    replay-log.json
    validation.json
    reports/
```

## Custom mission layout

The custom exporter always writes the metadata and index. Other canonical
paths are included only when their input is supplied:

```text
<experiment>/
  artifact-index.json
  metadata.json
  replay-log.json
  replay-validation.json
  twin-timeline.json
  diagnostics.json
  provenance.json
  evidence/
    evidence-manifest.json
  reports/
    <application-defined files>
```

String report values are text. Structured report descriptors may select
`"json"` or `"txt"` and provide an optional description. Report names are
safe relative paths beneath `reports/` and are indexed in lexical order.
Inputs are not mutated.

## Index and versions

`artifact-index.json` is an `ExperimentArtifactBundle`. It identifies the
artifact format version, experiment, creation time, kind, metadata, and all
declared files.

Custom bundles use kind `custom`; existing scenario and fleet kinds and layouts
are unchanged.

`validateExperimentArtifactBundle` rejects unsupported versions, unsafe or
duplicate paths, unknown kinds/formats, and missing core metadata. Serialized
replay and timeline files carry their own independent format versions.

## Reading

```ts
const loaded = readExperimentArtifacts(written.experimentPath);

if (!loaded.validation.valid) {
  throw new Error(loaded.validation.errors.join("\n"));
}

for (const warning of loaded.warnings) {
  console.warn(warning);
}
```

If the index is absent, the reader can discover recognized legacy paths from
metadata. Index-based loading is preferred.

## Deterministic formatting

JSON uses two-space indentation and one trailing newline. Text also ends in a
newline. Equal structured inputs and metadata insertion order produce
byte-identical content.

Arbitrary object keys are not recursively sorted. Objects with equal key/value
pairs but different insertion order may serialize differently.

## Safety and limitations

- Persistence is synchronous and local-filesystem only.
- Paths are validated as safe relative paths.
- JSON is parsed as data and never evaluated.
- Loaded domain documents still need their domain validators.
- Replacement is not atomic.
- The manifest does not contain content digests.
- Concurrent writers to the same experiment path are unsupported.
- Filesystem timestamps and permissions are not deterministic evidence.

Use JSON files for automation and text reports for inspection.
