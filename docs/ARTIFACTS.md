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

## Index and versions

`artifact-index.json` is an `ExperimentArtifactBundle`. It identifies the
artifact format version, experiment, creation time, kind, metadata, and all
declared files.

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
