import { describe, expect, it } from "vitest";

import {
  createEvidenceManifest,
  validateEvidenceManifest,
} from "../src/index.js";

const validManifest = () =>
  createEvidenceManifest({
    experimentId: "experiment-1",
    evidence: [
      {
        evidenceId: "source",
        kind: "telemetry",
        path: "telemetry/source.json",
        provenanceId: "prov-source",
      },
      {
        evidenceId: "replay",
        kind: "replay-log",
        path: "replay.json",
        provenanceId: "prov-replay",
      },
    ],
    relationships: [{
      relationshipId: "source-to-replay",
      fromEvidenceId: "source",
      toEvidenceId: "replay",
      type: "produced",
    }],
  });

describe("evidence manifest validator", () => {
  it("accepts a valid manifest", () => {
    expect(validateEvidenceManifest(validManifest())).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("rejects duplicate evidence and relationship ids", () => {
    const manifest = validManifest();
    const result = validateEvidenceManifest({
      ...manifest,
      evidence: [manifest.evidence[0], manifest.evidence[0]],
      relationships: [
        manifest.relationships[0],
        manifest.relationships[0],
      ],
    });
    expect(result.errors.some((error) => error.includes("duplicate evidenceId"))).toBe(true);
    expect(result.errors.some((error) => error.includes("duplicate relationshipId"))).toBe(true);
  });

  it("rejects missing endpoints, unknown kinds, and absolute paths", () => {
    const manifest = validManifest();
    const result = validateEvidenceManifest({
      ...manifest,
      evidence: [{
        evidenceId: "bad",
        kind: "binary",
        path: "/tmp/evidence.json",
      }],
      relationships: [{
        relationshipId: "missing",
        fromEvidenceId: "bad",
        toEvidenceId: "absent",
        type: "contains",
      }],
    });
    expect(result.errors.some((error) => error.includes('unknown kind "binary"'))).toBe(true);
    expect(result.errors.some((error) => error.includes("safe relative path"))).toBe(true);
    expect(result.errors.some((error) => error.includes('"absent"'))).toBe(true);
  });

  it("warns for missing provenance, relationships, and evidence", () => {
    const missingProvenance = validateEvidenceManifest(
      createEvidenceManifest({
        experimentId: "experiment-1",
        evidence: [{ evidenceId: "source", kind: "telemetry" }],
      }),
    );
    expect(missingProvenance.warnings).toContain(
      'Evidence "source" has no provenance.',
    );
    expect(missingProvenance.warnings).toContain(
      "Evidence manifest contains no relationships.",
    );
    const empty = validateEvidenceManifest(
      createEvidenceManifest({ experimentId: "experiment-1" }),
    );
    expect(empty.warnings).toContain("Evidence manifest contains no evidence.");
  });
});
