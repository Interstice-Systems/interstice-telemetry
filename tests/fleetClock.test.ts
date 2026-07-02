import { describe, expect, it } from "vitest";

import {
  FleetClock,
  runFleetScenario,
  type FleetScenarioProfile,
} from "../src/index.js";

describe("FleetClock", () => {
  it("advances global fleet time and resets deterministically", () => {
    const clock = new FleetClock({ startTimeMs: 1_000 });

    expect(clock.step(500)).toBe(1_500);
    expect(clock.getInfo().stepCount).toBe(1);
    clock.reset();

    expect(clock.getInfo()).toMatchObject({
      kind: "fleet",
      currentTimeMs: 1_000,
      stepCount: 0,
    });
  });

  it("advances once per global fleet runner step", () => {
    const profile: FleetScenarioProfile = {
      id: "clocked-fleet",
      name: "Clocked fleet",
      description: "Global fleet clock integration.",
      durationMs: 250,
      stepMs: 100,
      robots: [
        {
          robotId: "alpha",
          scenario: {
            id: "alpha-scenario",
            name: "Alpha",
            description: "Alpha scenario.",
            durationMs: 1,
            stepMs: 1,
          },
        },
        {
          robotId: "beta",
          scenario: {
            id: "beta-scenario",
            name: "Beta",
            description: "Beta scenario.",
            durationMs: 1,
            stepMs: 1,
          },
        },
      ],
    };
    const clock = new FleetClock();

    const result = runFleetScenario(profile, clock);

    expect(clock.now()).toBe(250);
    expect(clock.getInfo().stepCount).toBe(3);
    expect(result.summary.stepCount).toBe(3);
  });
});
