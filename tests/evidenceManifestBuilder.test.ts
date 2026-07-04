import { describe, expect, it } from "vitest";

import {
  addEvidenceEntry,
  addEvidenceRelationship,
  createEvidenceManifest,
  deserializeEvidenceManifest,
  serializeEvidenceManifest,
} from "../src/index.js";

describe("evidence manifest builders", () => {
  it("orders output deterministically and does not mutate inputs", () => {
    const evidence = [
      { evidenceId: "z", kind: "artifact" as const },
      { evidenceId: "a", kind: "telemetry" as const },
    ];
    const before = structuredClone(evidence);
    const manifest = createEvidenceManifest({
      experimentId: "experiment-1",
      createdAt: 0,
      evidence,
    });
    expect(manifest.evidence.map(({ evidenceId }) => evidenceId)).toEqual([
      "a",
      "z",
    ]);
    expect(evidence).toEqual(before);
    expect(createEvidenceManifest({
      experimentId: "experiment-1",
      createdAt: 0,
      evidence: [...evidence].reverse(),
    })).toEqual(manifest);
  });

  it("adds entries and relationships immutably", () => {
    const initial = createEvidenceManifest({
      experimentId: "experiment-1",
      evidence: [{ evidenceId: "source", kind: "telemetry" }],
    });
    const withReplay = addEvidenceEntry(initial, {
      evidenceId: "replay",
      kind: "replay-log",
    });
    const linked = addEvidenceRelationship(withReplay, {
      fromEvidenceId: "source",
      toEvidenceId: "replay",
      type: "produced",
    });
    expect(initial.evidence).toHaveLength(1);
    expect(withReplay.relationships).toHaveLength(0);
    expect(linked.relationships).toHaveLength(1);
  });

  it("round-trips canonical manifest JSON", () => {
    const manifest = createEvidenceManifest({
      experimentId: "experiment-1",
      evidence: [{ evidenceId: "source", kind: "telemetry" }],
    });
    expect(
      deserializeEvidenceManifest(serializeEvidenceManifest(manifest)),
    ).toEqual(manifest);
  });
});
