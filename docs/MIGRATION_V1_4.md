# Migrating to v1.4

Version 1.4 adds canonical evidence manifests and cross-artifact lineage
without removing or renaming existing APIs.

## Artifact exports

New scenario and fleet exports contain three additional files under
`evidence/`. Code that asserts an exact artifact file count must account for
these files. Code that reads declared artifact files through
`readExperimentArtifacts` requires no workflow change.

The artifact bundle version remains `0.8.0`; replay, twin, and provenance
versions are unchanged. The artifact file-kind enumeration now recognizes:

- `evidence-manifest`
- `evidence-manifest-report`
- `provenance-coverage-report`

## Adoption

Use `createEvidenceManifest` for application-owned graphs or
`buildEvidenceManifestFromArtifactBundle` for existing bundles. Validate
loaded JSON with `validateEvidenceManifest`, then use lineage and coverage
helpers for inspection.

A manifest describes evidence. It does not authenticate evidence. Do not use
manifest membership, ownership labels, provenance coverage, or relationships
as authorization or authenticity decisions.
