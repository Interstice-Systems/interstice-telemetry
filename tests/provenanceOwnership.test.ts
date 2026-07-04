import { describe, expect, it } from "vitest";

import {
  createEvidenceOwnership,
  createSimulationProvenance,
  validateEvidenceProvenance,
} from "../src/index.js";

describe("evidence ownership", () => {
  it("defaults to local private descriptive ownership", () => {
    const provenance = createSimulationProvenance({
      sourceName: "Simulator",
      timestamp: 0,
    });
    expect(provenance.ownership).toEqual({
      ownerType: "local",
      visibility: "private",
    });
  });

  it("supports organization ownership without enforcing access", () => {
    const ownership = createEvidenceOwnership({
      ownerType: "organization",
      ownerId: "interstice-lab",
      visibility: "organization",
    });
    const provenance = createSimulationProvenance({
      sourceName: "Simulator",
      timestamp: 0,
      ownership,
    });
    expect(validateEvidenceProvenance(provenance).valid).toBe(true);
    expect(provenance.ownership.ownerId).toBe("interstice-lab");
  });
});
