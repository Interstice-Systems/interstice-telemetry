import { describe, expect, it } from "vitest";

import {
  createEvidenceManifest,
  renderEvidenceManifestReport,
} from "../src/index.js";

describe("evidence manifest report", () => {
  it("renders deterministic kind counts and coverage", () => {
    const manifest = createEvidenceManifest({
      manifestId: "manifest-experiment-1",
      experimentId: "experiment-1",
      evidence: [
        { evidenceId: "replay", kind: "replay-log", provenanceId: "prov-1" },
        { evidenceId: "telemetry", kind: "telemetry" },
      ],
      relationships: [{
        fromEvidenceId: "telemetry",
        toEvidenceId: "replay",
        type: "produced",
      }],
    });
    expect(renderEvidenceManifestReport(manifest)).toBe(
      [
        "INTERSTICE ROBOTICS — EVIDENCE MANIFEST",
        "Experiment: experiment-1",
        "Manifest: manifest-experiment-1",
        "Evidence Items: 2",
        "Relationships: 1",
        "",
        "EVIDENCE BY KIND",
        "replay-log: 1",
        "telemetry: 1",
        "",
        "PROVENANCE COVERAGE",
        "Covered: 1 / 2",
        "Missing: 1",
        "Coverage: 50.00%",
      ].join("\n"),
    );
  });
});
