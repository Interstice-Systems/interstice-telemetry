import { describe, expect, it } from "vitest";

import {
  createExperimentArtifactBundle,
  validateExperimentArtifactBundle,
} from "../src/index.js";

describe("createExperimentArtifactBundle", () => {
  it("creates a deterministic, valid bundle without mutating input", () => {
    const metadata = { name: "Patrol", robotIds: ["rover-1"] };
    const files = [
      {
        path: "metadata.json",
        kind: "metadata" as const,
        format: "json" as const,
      },
    ];
    const bundle = createExperimentArtifactBundle({
      experimentId: "patrol-run",
      kind: "scenario",
      metadata,
      files,
    });

    metadata.name = "Changed";
    files[0]!.path = "changed.json";

    expect(bundle.createdAt).toBe("1970-01-01T00:00:00.000Z");
    expect(bundle.metadata.name).toBe("Patrol");
    expect(bundle.files[0]!.path).toBe("metadata.json");
    expect(validateExperimentArtifactBundle(bundle).valid).toBe(true);
  });
});
