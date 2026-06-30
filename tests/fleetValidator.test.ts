import { describe, expect, it } from "vitest";

import {
  getBuiltInScenario,
  type FleetScenarioProfile,
  validateFleetScenario,
} from "../src/index.js";

const validProfile = (): FleetScenarioProfile => {
  const scenario = getBuiltInScenario("basic-patrol");

  if (scenario === undefined) {
    throw new Error("Missing built-in scenario.");
  }

  return {
    id: "validation-test",
    name: "Validation Test",
    description: "Fleet validator fixture.",
    durationMs: 10_000,
    stepMs: 1_000,
    robots: [
      { robotId: "alpha", scenario },
      { robotId: "beta", scenario: structuredClone(scenario) },
    ],
  };
};

describe("validateFleetScenario", () => {
  it("rejects duplicate robot ids", () => {
    const profile = validProfile();
    profile.robots[1]!.robotId = "alpha";

    expect(validateFleetScenario(profile).errors).toContain(
      'Fleet robotId "alpha" must be unique.',
    );
  });

  it("rejects an empty robot list", () => {
    const profile = validProfile();
    profile.robots = [];

    expect(validateFleetScenario(profile).errors).toContain(
      "Fleet scenario robots must be a non-empty array.",
    );
  });

  it("rejects a non-positive duration", () => {
    const profile = { ...validProfile(), durationMs: 0 };

    expect(validateFleetScenario(profile).errors).toContain(
      "Fleet scenario durationMs must be a positive number.",
    );
  });

  it("rejects a step greater than the duration", () => {
    const profile = {
      ...validProfile(),
      durationMs: 500,
      stepMs: 1_000,
    };

    expect(validateFleetScenario(profile).errors).toContain(
      "Fleet scenario stepMs must not be greater than durationMs.",
    );
  });

  it("validates each embedded scenario after overriding robotId", () => {
    const profile = validProfile();
    profile.robots[0]!.scenario.robotId = "";

    expect(validateFleetScenario(profile).valid).toBe(true);
  });
});
