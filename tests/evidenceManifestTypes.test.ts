import { describe, expect, it } from "vitest";

import {
  EVIDENCE_KINDS,
  EVIDENCE_MANIFEST_VERSION,
  EVIDENCE_RELATIONSHIP_TYPES,
  createEvidenceManifestEntry,
  createEvidenceRelationship,
} from "../src/index.js";

describe("evidence manifest types", () => {
  it("publishes the canonical version and enumerations", () => {
    expect(EVIDENCE_MANIFEST_VERSION).toBe("1.0.0");
    expect(EVIDENCE_KINDS).toContain("twin-timeline");
    expect(EVIDENCE_RELATIONSHIP_TYPES).toContain("derived-from");
  });

  it("constructs immutable entries and relationships", () => {
    const entry = createEvidenceManifestEntry({
      kind: "replay-log",
      path: "replay.json",
      metadata: { producer: { name: "recorder" } },
    });
    const relationship = createEvidenceRelationship({
      fromEvidenceId: "source",
      toEvidenceId: entry.evidenceId,
      type: "produced",
    });
    expect(Object.isFrozen(entry)).toBe(true);
    expect(Object.isFrozen(entry.metadata?.producer)).toBe(true);
    expect(Object.isFrozen(relationship)).toBe(true);
  });
});
