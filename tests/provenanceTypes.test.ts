import { describe, expect, it } from "vitest";

import {
  EVIDENCE_PROVENANCE_VERSION,
  PROVENANCE_CONFIDENCE_LEVELS,
  PROVENANCE_SOURCE_TYPES,
  createSimulationProvenance,
} from "../src/index.js";

describe("provenance types", () => {
  it("publishes the canonical version and enumerations", () => {
    expect(EVIDENCE_PROVENANCE_VERSION).toBe("1.0.0");
    expect(PROVENANCE_SOURCE_TYPES).toEqual([
      "simulation",
      "telemetry",
      "replay",
      "adapter",
      "importer",
      "manual",
      "derived",
    ]);
    expect(PROVENANCE_CONFIDENCE_LEVELS).toEqual([
      "exact",
      "measured",
      "estimated",
      "derived",
    ]);
  });

  it("creates recursively immutable records", () => {
    const provenance = createSimulationProvenance({
      sourceName: "ScenarioRunner",
      robotId: "rover-1",
      timestamp: 1_000,
      metadata: { scenario: { id: "warehouse" } },
    });
    expect(Object.isFrozen(provenance)).toBe(true);
    expect(Object.isFrozen(provenance.ownership)).toBe(true);
    expect(Object.isFrozen(provenance.metadata?.scenario)).toBe(true);
  });
});
