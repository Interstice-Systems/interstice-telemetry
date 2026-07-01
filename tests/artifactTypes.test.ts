import { describe, expect, it } from "vitest";

import {
  EXPERIMENT_ARTIFACT_FILE_KINDS,
  EXPERIMENT_ARTIFACT_FORMATS,
  EXPERIMENT_ARTIFACT_KINDS,
  EXPERIMENT_ARTIFACT_VERSION,
} from "../src/index.js";

describe("experiment artifact types", () => {
  it("exposes stable v0.8 artifact constants", () => {
    expect(EXPERIMENT_ARTIFACT_VERSION).toBe("0.8.0");
    expect(EXPERIMENT_ARTIFACT_KINDS).toEqual(["scenario", "fleet"]);
    expect(EXPERIMENT_ARTIFACT_FORMATS).toEqual(["json", "txt"]);
    expect(EXPERIMENT_ARTIFACT_FILE_KINDS).toContain("telemetry-summary");
  });
});
