import { describe, expect, it } from "vitest";

import {
  BUILT_IN_FLEET_SCENARIO_IDS,
  BUILT_IN_FLEET_SCENARIOS,
  getBuiltInFleetScenario,
  validateFleetScenario,
} from "../src/index.js";

const expectedIds = [
  "two-robot-patrol",
  "mixed-fault-fleet",
  "signal-loss-fleet",
  "overheat-and-battery-fleet",
];

describe("built-in fleet scenarios", () => {
  it("provides every stable fleet scenario id", () => {
    expect(BUILT_IN_FLEET_SCENARIO_IDS).toEqual(expectedIds);
    expect(BUILT_IN_FLEET_SCENARIOS.map(({ id }) => id)).toEqual(expectedIds);
  });

  it("provides valid profiles with at least two robots", () => {
    for (const scenario of BUILT_IN_FLEET_SCENARIOS) {
      expect(validateFleetScenario(scenario), scenario.id).toEqual({
        valid: true,
        errors: [],
        warnings: [],
      });
      expect(scenario.robots.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("returns independent copies by id", () => {
    const first = getBuiltInFleetScenario("mixed-fault-fleet");
    const second = getBuiltInFleetScenario("mixed-fault-fleet");

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(first?.robots).not.toBe(second?.robots);
    expect(getBuiltInFleetScenario("unknown")).toBeUndefined();
  });
});
