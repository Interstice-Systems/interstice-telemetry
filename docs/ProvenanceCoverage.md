# Provenance Coverage

Provenance coverage measures how many evidence entries declare a
`provenanceId`.

```ts
type ProvenanceCoverageSummary = {
  totalEvidence: number;
  evidenceWithProvenance: number;
  evidenceWithoutProvenance: number;
  coverageRatio: number;
  missingProvenanceEvidenceIds: string[];
};
```

`summarizeProvenanceCoverage` returns an immutable summary with sorted missing
IDs. Empty manifests have a ratio of `0`. `renderProvenanceCoverageReport`
provides a deterministic text view.

Coverage is completeness metadata, not a trust score. A linked provenance
record may still be incorrect, incomplete, or unavailable. Conversely,
evidence without provenance is not automatically invalid; it is explicitly
identified for follow-up.
