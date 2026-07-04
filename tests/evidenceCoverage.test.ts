import { describe, expect, it } from "vitest";

import {
  createEvidenceManifest,
  renderProvenanceCoverageReport,
  summarizeProvenanceCoverage,
} from "../src/index.js";

describe("evidence provenance coverage", () => {
  it("counts covered and uncovered evidence deterministically", () => {
    const manifest = createEvidenceManifest({
      experimentId: "experiment-1",
      evidence: [
        { evidenceId: "covered-b", kind: "event", provenanceId: "prov-1" },
        { evidenceId: "missing-b", kind: "artifact" },
        { evidenceId: "missing-a", kind: "telemetry" },
      ],
    });
    expect(summarizeProvenanceCoverage(manifest)).toEqual({
      totalEvidence: 3,
      evidenceWithProvenance: 1,
      evidenceWithoutProvenance: 2,
      coverageRatio: 1 / 3,
      missingProvenanceEvidenceIds: ["missing-a", "missing-b"],
    });
    expect(renderProvenanceCoverageReport(manifest)).toContain(
      "Coverage: 33.33%",
    );
  });
});
