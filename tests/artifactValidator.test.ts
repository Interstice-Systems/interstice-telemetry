import { describe, expect, it } from "vitest";

import {
  createExperimentArtifactBundle,
  validateExperimentArtifactBundle,
  type ExperimentArtifactBundle,
} from "../src/index.js";

const validBundle = (): ExperimentArtifactBundle =>
  createExperimentArtifactBundle({
    experimentId: "experiment-1",
    kind: "scenario",
    metadata: { name: "Experiment", robotIds: ["robot-1"] },
    files: [
      { path: "metadata.json", kind: "metadata", format: "json" },
    ],
  });

describe("validateExperimentArtifactBundle", () => {
  it("validates a complete bundle", () => {
    expect(validateExperimentArtifactBundle(validBundle())).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("rejects a missing experiment ID", () => {
    const bundle = validBundle();
    bundle.experimentId = "";

    expect(validateExperimentArtifactBundle(bundle).errors).toContain(
      "Experiment artifact bundle experimentId is required.",
    );
  });

  it("rejects empty robot IDs", () => {
    const bundle = validBundle();
    bundle.metadata.robotIds = [];

    expect(validateExperimentArtifactBundle(bundle).errors).toContain(
      "Experiment metadata robotIds must not be empty.",
    );
  });

  it("rejects absolute and traversing paths", () => {
    const bundle = validBundle();
    bundle.files[0]!.path = "/tmp/metadata.json";

    expect(validateExperimentArtifactBundle(bundle).valid).toBe(false);

    bundle.files[0]!.path = "../metadata.json";
    expect(validateExperimentArtifactBundle(bundle).valid).toBe(false);
  });

  it("rejects unknown file kinds", () => {
    const bundle = validBundle() as unknown as {
      files: { kind: string }[];
    };
    bundle.files[0]!.kind = "binary";

    expect(validateExperimentArtifactBundle(bundle).errors[0]).toContain(
      'unknown kind "binary"',
    );
  });

  it("rejects unknown formats", () => {
    const bundle = validBundle() as unknown as {
      files: { format: string }[];
    };
    bundle.files[0]!.format = "yaml";

    expect(validateExperimentArtifactBundle(bundle).errors[0]).toContain(
      'unknown format "yaml"',
    );
  });
});
