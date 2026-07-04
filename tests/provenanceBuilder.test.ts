import { describe, expect, it } from "vitest";

import {
  appendTransformation,
  createImporterProvenance,
  createSimulationProvenance,
  deriveProvenance,
} from "../src/index.js";

describe("provenance builders", () => {
  it("constructs stable deterministic provenance", () => {
    const input = {
      sourceName: "ScenarioRunner",
      robotId: "rover-1",
      timestamp: 1_000,
      metadata: { z: 1, a: 2 },
    } as const;
    expect(createSimulationProvenance(input)).toEqual(
      createSimulationProvenance(input),
    );
  });

  it("appends transformations without mutating prior evidence", () => {
    const origin = createSimulationProvenance({
      sourceName: "ScenarioRunner",
      timestamp: 1_000,
    });
    const replay = appendTransformation(origin, {
      name: "Replay Recorder",
      timestamp: 2_000,
    });
    expect(origin.transformationHistory).toEqual([]);
    expect(replay.transformationHistory.map(({ name }) => name)).toEqual([
      "Replay Recorder",
    ]);
    expect(replay.provenanceId).not.toBe(origin.provenanceId);
  });

  it("derives confidence while preserving origin and ordered history", () => {
    const origin = createImporterProvenance({
      sourceName: "CSV Importer",
      timestamp: 1_000,
      confidence: "measured",
    });
    const twin = deriveProvenance(
      appendTransformation(origin, {
        name: "Replay Recorder",
        timestamp: 2_000,
      }),
      { name: "Twin Timeline Builder", timestamp: 3_000 },
    );
    expect(twin.sourceType).toBe("importer");
    expect(twin.confidence).toBe("derived");
    expect(twin.transformationHistory.map(({ name }) => name)).toEqual([
      "Replay Recorder",
      "Twin Timeline Builder",
    ]);
  });
});
