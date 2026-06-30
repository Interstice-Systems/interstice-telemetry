import { describe, expect, it } from "vitest";

import {
  BUILT_IN_SCENARIO_IDS,
  BUILT_IN_SCENARIOS,
  getBuiltInScenario,
  validateScenarioProfile,
} from "../src/index.js";

const expectedIds = [
  "basic-patrol",
  "battery-drain",
  "motor-overheat",
  "signal-loss",
  "sensor-noise",
  "stalled-motor",
];

describe("built-in scenarios", () => {
  it("provides every stable built-in scenario id", () => {
    expect(BUILT_IN_SCENARIO_IDS).toEqual(expectedIds);
    expect(BUILT_IN_SCENARIOS.map(({ id }) => id)).toEqual(expectedIds);
  });

  it("provides valid profiles", () => {
    for (const scenario of BUILT_IN_SCENARIOS) {
      expect(validateScenarioProfile(scenario), scenario.id).toEqual({
        valid: true,
        errors: [],
        warnings: [],
      });
    }
  });

  it("returns an independent copy by id", () => {
    const first = getBuiltInScenario("motor-overheat");
    const second = getBuiltInScenario("motor-overheat");

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    expect(getBuiltInScenario("unknown")).toBeUndefined();
  });
});
