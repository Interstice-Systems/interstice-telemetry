import { describe, expect, it } from "vitest";

import {
  createEvidenceManifest,
  findEvidenceByKind,
  findEvidenceByProvenance,
  findEvidenceByRobot,
  traceEvidenceAncestors,
  traceEvidenceDescendants,
} from "../src/index.js";

const manifest = (cycle = false) =>
  createEvidenceManifest({
    experimentId: "experiment-1",
    evidence: [
      {
        evidenceId: "source",
        kind: "telemetry",
        robotId: "rover-1",
        provenanceId: "prov-1",
      },
      {
        evidenceId: "replay",
        kind: "replay-log",
        robotId: "rover-1",
        provenanceId: "prov-1",
      },
      { evidenceId: "report", kind: "diagnostic-report" },
    ],
    relationships: [
      {
        fromEvidenceId: "source",
        toEvidenceId: "replay",
        type: "produced",
      },
      {
        fromEvidenceId: "replay",
        toEvidenceId: "report",
        type: "reported-by",
      },
      ...(cycle
        ? [{
            fromEvidenceId: "source",
            toEvidenceId: "report",
            type: "derived-from" as const,
          }]
        : []),
    ],
  });

describe("evidence lineage", () => {
  it("traces ancestor and descendant chains", () => {
    expect(
      traceEvidenceAncestors(manifest(), "report").map(({ evidenceId }) => evidenceId),
    ).toEqual(["replay", "source"]);
    expect(
      traceEvidenceDescendants(manifest(), "source").map(({ evidenceId }) => evidenceId),
    ).toEqual(["replay", "report"]);
  });

  it("handles missing ids and cycles safely", () => {
    expect(traceEvidenceAncestors(manifest(), "missing")).toEqual([]);
    expect(
      traceEvidenceDescendants(manifest(true), "source").map(({ evidenceId }) => evidenceId),
    ).toEqual(["replay", "report"]);
  });

  it("finds evidence by kind, robot, and provenance", () => {
    expect(findEvidenceByKind(manifest(), "replay-log")).toHaveLength(1);
    expect(findEvidenceByRobot(manifest(), "rover-1")).toHaveLength(2);
    expect(findEvidenceByProvenance(manifest(), "prov-1")).toHaveLength(2);
  });
});
