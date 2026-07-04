import { describe, expect, it } from "vitest";

import {
  appendTransformation,
  createSimulationProvenance,
  validateEvidenceProvenance,
} from "../src/index.js";

describe("provenance validator", () => {
  it("accepts valid transformed provenance", () => {
    const provenance = appendTransformation(
      createSimulationProvenance({
        sourceName: "ScenarioRunner",
        timestamp: 1_000,
      }),
      { name: "Replay Recorder", timestamp: 2_000 },
    );
    expect(validateEvidenceProvenance(provenance)).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("reports invalid fields and transformation ordering", () => {
    const result = validateEvidenceProvenance({
      version: "9",
      provenanceId: "",
      sourceType: "network",
      sourceName: "",
      timestamp: -1,
      createdAt: "not-a-date",
      confidence: "maybe",
      ownership: { ownerType: "person", visibility: "secret" },
      transformationHistory: [
        {
          transformationId: "step-2",
          name: "Second",
          timestamp: 2,
          inputProvenanceIds: ["source"],
        },
        {
          transformationId: "step-1",
          name: "First",
          timestamp: 1,
          inputProvenanceIds: [""],
        },
      ],
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("move backward"))).toBe(true);
    expect(result.errors.some((error) => error.includes("invalid provenance reference"))).toBe(true);
  });

  it("rejects duplicate transformation ids", () => {
    const origin = createSimulationProvenance({
      sourceName: "ScenarioRunner",
      timestamp: 1,
    });
    const step = {
      transformationId: "duplicate",
      name: "Transform",
      timestamp: 2,
      inputProvenanceIds: [origin.provenanceId],
    };
    const result = validateEvidenceProvenance({
      ...origin,
      provenanceId: "final",
      transformationHistory: [step, { ...step, timestamp: 3 }],
    });
    expect(result.errors.some((error) => error.includes("duplicate transformationId"))).toBe(true);
  });
});
