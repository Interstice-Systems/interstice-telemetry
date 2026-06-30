import { describe, expect, it } from "vitest";

import {
  validateScenarioProfile,
  type ScenarioProfile,
} from "../src/index.js";

const validProfile = (): ScenarioProfile => ({
  id: "validator-test",
  name: "Validator Test",
  description: "A valid baseline profile.",
  durationMs: 2_000,
  stepMs: 500,
});

describe("validateScenarioProfile", () => {
  it("accepts a valid profile", () => {
    expect(validateScenarioProfile(validProfile())).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("rejects a non-positive duration", () => {
    const result = validateScenarioProfile({
      ...validProfile(),
      durationMs: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Scenario durationMs must be a positive number.",
    );
  });

  it("rejects a step greater than the duration", () => {
    const result = validateScenarioProfile({
      ...validProfile(),
      stepMs: 3_000,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Scenario stepMs must not be greater than durationMs.",
    );
  });

  it("rejects a fault scheduled after the duration", () => {
    const result = validateScenarioProfile({
      ...validProfile(),
      faults: [{ atMs: 2_001, fault: { type: "signal_loss" } }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Scheduled fault at index 0 must not occur after durationMs.",
    );
  });

  it("rejects missing identity, empty robot ids, and negative fault times", () => {
    const result = validateScenarioProfile({
      ...validProfile(),
      id: "",
      name: " ",
      robotId: "",
      faults: [{ atMs: -1, fault: { type: "signal_loss" } }],
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "Scenario id is required.",
        "Scenario name is required.",
        "Scenario robotId must not be empty.",
        "Scheduled fault at index 0 atMs must be a non-negative number.",
      ]),
    );
  });
});
