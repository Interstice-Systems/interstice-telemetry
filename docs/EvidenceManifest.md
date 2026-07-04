# Evidence Manifest

An `EvidenceManifest` is a deterministic inventory and relationship graph for
one experiment package. It records what evidence exists, where file-backed
evidence is stored, what kind of evidence it is, and whether it links to
provenance.

A manifest describes evidence. It does not authenticate evidence.

## Model

A manifest contains:

- a manifest contract version, deterministic manifest ID, experiment ID, and
  creation time;
- sorted `EvidenceManifestEntry` records for files, records, or derived values;
- sorted `EvidenceRelationship` records connecting entries;
- optional finite JSON metadata.

Entry kinds cover telemetry, events, replay, fleet and twin timelines,
artifacts, states, diagnostics, provenance, scenes, and manifests. Paths are
optional safe relative paths. `provenanceId` links an entry to provenance
without embedding a provenance record.

Builders canonicalize object keys, recursively freeze records, generate stable
non-cryptographic IDs, sort output, and do not mutate inputs. Call
`validateEvidenceManifest` after deserializing external JSON.

## Artifact integration

Scenario and fleet exporters add:

```text
evidence/
  evidence-manifest.json
  evidence-manifest-report.txt
  provenance-coverage-report.txt
```

These files are additive entries in the existing artifact index. Artifact
bundle version `0.8.0` is unchanged. Existing replay, twin, provenance, and
artifact document structures are not rewritten.

The exported manifest inventories the final declared artifact bundle,
including the three evidence files. A package-level `artifact` entry has a
`contains` relationship to every declared file.

## Limitations

Manifest IDs and entry IDs are stable local identifiers, not cryptographic
digests. The SDK does not verify file contents, resolve external registries,
authenticate producers, enforce ownership, or prove that a described file is
genuine.
