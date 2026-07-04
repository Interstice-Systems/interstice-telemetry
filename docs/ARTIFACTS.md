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

Custom applications can build, validate, and package SDK and application
evidence without creating a scenario or fleet result:

```ts
const bundle = createCustomExperimentBundle({
  experimentId: "rover-0-mission",
  metadata: {
    name: "Rover-0 deterministic mission",
    robotIds: ["rover-0"],
  },
  evidence: {
    replayLog,
    replayValidation,
    twinTimeline,
    diagnostics,
    provenance,
  },
  customJson: { metrics: mission.metrics },
  reports: {
    "mission-report": renderMissionReport(mission),
  },
});

const validation = validateCustomExperimentBundle(bundle);
const written = exportCustomExperimentBundle(bundle, {
  rootDir: "artifacts",
});
```

Writers refuse to replace an existing experiment directory by default. Set
`overwrite: true` only when replacement is intended.

`exportCustomEvidenceArtifacts` remains available for compatibility with the
earlier flat custom-evidence input.

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

## Custom experiment layout

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
  custom/
    <application-defined JSON>.json
  reports/
    <application-defined text>.txt
```

Custom JSON and report keys are safe portable file names rather than paths.
Extensions are added when omitted. Entries are indexed in lexical order and
inputs are not mutated. A deterministic minimal manifest is derived by default
when evidence exists and the caller does not supply one. Set
`deriveEvidenceManifest: false` to opt out.

See [Custom Experiments](CUSTOM_EXPERIMENTS.md) for the complete API,
validation, manifest behavior, and limitations.

## Index and versions

`artifact-index.json` is an `ExperimentArtifactBundle`. It identifies the
artifact format version, experiment, creation time, kind, metadata, and all
declared files.

Custom bundles use kind `custom`; existing scenario and fleet kinds and layouts
are unchanged.

`validateExperimentArtifactBundle` rejects unsupported versions, unsafe or
duplicate paths, unknown kinds/formats, and missing core metadata. Custom
artifact metadata permits an empty `robotIds` array; scenario and fleet
metadata still require at least one robot. Serialized replay and timeline
files carry their own independent format versions.

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
