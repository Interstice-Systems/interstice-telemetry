import { describe, expect, it } from "vitest";

import {
  getBuiltInFleetScenario,
  getBuiltInScenario,
  runFleetScenario,
  type FleetScenarioProfile,
} from "../src/index.js";

const mixedFleet = (): FleetScenarioProfile => {
  const profile = getBuiltInFleetScenario("mixed-fault-fleet");

  if (profile === undefined) {
    throw new Error("Missing mixed-fault-fleet.");
  }

  return profile;
};

describe("FleetScenarioRunner", () => {
  it("produces deterministic results for equal profiles", () => {
    expect(runFleetScenario(mixedFleet())).toEqual(
      runFleetScenario(mixedFleet()),
    );
  });

  it("orders robot results by robotId regardless of profile order", () => {
    const profile = mixedFleet();
    profile.robots.reverse();

    const result = runFleetScenario(profile);

    expect(Object.keys(result.robotResults)).toEqual([
      "robot-alpha",
      "robot-beta",
      "robot-gamma",
    ]);
    expect(Object.keys(result.fleetReplayLog.robotLogs)).toEqual([
      "robot-alpha",
      "robot-beta",
      "robot-gamma",
    ]);
  });

  it("injects every scheduled fault exactly once per robot", () => {
    const result = runFleetScenario(mixedFleet());

    for (const robot of result.scenario.robots) {
      const events = result.robotResults[robot.robotId]!.events;
      expect(events.filter(({ type }) => type === "fault.injected")).toHaveLength(
        robot.scenario.faults?.length ?? 0,
      );
    }
  });

  it("produces internally consistent fleet summary counts", () => {
    const result = runFleetScenario(mixedFleet());
    const robotResults = Object.values(result.robotResults);

    expect(result.summary.robotCount).toBe(result.scenario.robots.length);
    expect(result.summary.totalEvents).toBe(
      robotResults.reduce(
        (total, robot) => total + robot.summary.eventCount,
        0,
      ),
    );
    expect(result.summary.totalFaults).toBe(
      robotResults.reduce(
        (total, robot) => total + robot.summary.faultCount,
        0,
      ),
    );
    expect(result.summary.stepCount).toBe(12);
  });

  it("uses fleet timing and wrapper robot IDs without mutating the input", () => {
    const scenario = getBuiltInScenario("basic-patrol");
    if (scenario === undefined) {
      throw new Error("Missing basic-patrol.");
    }
    const profile: FleetScenarioProfile = {
      id: "override-test",
      name: "Override Test",
      description: "Fleet clock and robot identity overrides.",
      durationMs: 2_500,
      stepMs: 1_000,
      robots: [{ robotId: "fleet-robot", scenario }],
    };
    const original = structuredClone(profile);

    const result = runFleetScenario(profile);
    const robotResult = result.robotResults["fleet-robot"]!;

    expect(profile).toEqual(original);
    expect(robotResult.scenario.robotId).toBe("fleet-robot");
    expect(robotResult.scenario.durationMs).toBe(2_500);
    expect(robotResult.scenario.stepMs).toBe(1_000);
    expect(robotResult.summary.stepCount).toBe(3);
  });
});
