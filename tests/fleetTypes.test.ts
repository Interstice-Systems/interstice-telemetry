import { describe, expect, it } from "vitest";

import type { FleetScenarioProfile } from "../src/index.js";

describe("fleet scenario types", () => {
  it("accepts multiple robots that reuse scenario profiles", () => {
    const scenario: FleetScenarioProfile = {
      id: "type-test",
      name: "Type Test",
      description: "Multiple robot profile test.",
      durationMs: 2_000,
      stepMs: 1_000,
      robots: ["alpha", "beta"].map((robotId, index) => ({
        robotId,
        scenario: {
          id: `scenario-${index}`,
          name: `Scenario ${index}`,
          description: "Reusable single-robot scenario.",
          seed: index + 1,
          durationMs: 2_000,
          stepMs: 1_000,
        },
      })),
    };

    expect(scenario.robots).toHaveLength(2);
    expect(scenario.robots.map(({ robotId }) => robotId)).toEqual([
      "alpha",
      "beta",
    ]);
  });
});
