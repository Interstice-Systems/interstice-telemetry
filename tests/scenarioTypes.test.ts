import { describe, expect, it } from "vitest";

import type {
  ScenarioProfile,
  ScheduledFault,
} from "../src/index.js";

describe("scenario profile types", () => {
  it("represent reusable profiles and scheduled faults", () => {
    const fault: ScheduledFault = {
      atMs: 1_000,
      fault: { type: "signal_loss", severity: 0.5 },
    };
    const profile: ScenarioProfile = {
      id: "typed-scenario",
      name: "Typed Scenario",
      description: "Exercises the public scenario data model.",
      seed: "stable-seed",
      robotId: "typed-rover",
      initialState: "active",
      durationMs: 2_000,
      stepMs: 500,
      faults: [fault],
      metadata: { suite: "types" },
    };

    expect(profile.faults).toEqual([fault]);
    expect(profile.seed).toBe("stable-seed");
  });
});
