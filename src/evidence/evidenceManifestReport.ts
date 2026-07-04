import { summarizeProvenanceCoverage } from "./evidenceCoverage.js";
import type { EvidenceManifest } from "./evidenceManifestTypes.js";

export const renderEvidenceManifestReport = (
  manifest: EvidenceManifest,
): string => {
  const counts = new Map<string, number>();
  for (const entry of manifest.evidence) {
    counts.set(entry.kind, (counts.get(entry.kind) ?? 0) + 1);
  }
  const coverage = summarizeProvenanceCoverage(manifest);
  return [
    "INTERSTICE ROBOTICS — EVIDENCE MANIFEST",
    `Experiment: ${manifest.experimentId}`,
    `Manifest: ${manifest.manifestId}`,
    `Evidence Items: ${manifest.evidence.length}`,
    `Relationships: ${manifest.relationships.length}`,
    "",
    "EVIDENCE BY KIND",
    ...(counts.size === 0
      ? ["None"]
      : [...counts.entries()]
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([kind, count]) => `${kind}: ${count}`)),
    "",
    "PROVENANCE COVERAGE",
    `Covered: ${coverage.evidenceWithProvenance} / ${coverage.totalEvidence}`,
    `Missing: ${coverage.evidenceWithoutProvenance}`,
    `Coverage: ${(coverage.coverageRatio * 100).toFixed(2)}%`,
  ].join("\n");
};
