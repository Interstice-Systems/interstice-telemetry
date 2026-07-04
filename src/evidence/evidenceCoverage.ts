import { toImmutableProvenanceValue } from "../provenance/provenanceHelpers.js";
import type {
  EvidenceManifest,
  ProvenanceCoverageSummary,
} from "./evidenceManifestTypes.js";

export const summarizeProvenanceCoverage = (
  manifest: EvidenceManifest,
): ProvenanceCoverageSummary => {
  const missingProvenanceEvidenceIds = manifest.evidence
    .filter(({ provenanceId }) => provenanceId === undefined)
    .map(({ evidenceId }) => evidenceId)
    .sort();
  const totalEvidence = manifest.evidence.length;
  const evidenceWithoutProvenance = missingProvenanceEvidenceIds.length;
  const evidenceWithProvenance = totalEvidence - evidenceWithoutProvenance;
  return toImmutableProvenanceValue(
    {
      totalEvidence,
      evidenceWithProvenance,
      evidenceWithoutProvenance,
      coverageRatio:
        totalEvidence === 0 ? 0 : evidenceWithProvenance / totalEvidence,
      missingProvenanceEvidenceIds,
    },
    "provenanceCoverageSummary",
  );
};

export const renderProvenanceCoverageReport = (
  manifest: EvidenceManifest,
): string => {
  const summary = summarizeProvenanceCoverage(manifest);
  return [
    "INTERSTICE ROBOTICS — PROVENANCE COVERAGE",
    `Experiment: ${manifest.experimentId}`,
    `Covered: ${summary.evidenceWithProvenance} / ${summary.totalEvidence}`,
    `Missing: ${summary.evidenceWithoutProvenance}`,
    `Coverage: ${(summary.coverageRatio * 100).toFixed(2)}%`,
    "",
    "MISSING PROVENANCE",
    ...(summary.missingProvenanceEvidenceIds.length === 0
      ? ["None"]
      : summary.missingProvenanceEvidenceIds),
  ].join("\n");
};
