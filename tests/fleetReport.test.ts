import { describe, expect, it } from "vitest";

import {
  getBuiltInFleetScenario,
  renderFleetReplayReport,
  renderFleetScenarioReport,
  runFleetScenario,
} from "../src/index.js";

const result = () => {
  const profile = getBuiltInFleetScenario("mixed-fault-fleet");

  if (profile === undefined) {
    throw new Error("Missing mixed-fault-fleet.");
  }

  return runFleetScenario(profile);
};

describe("fleet reports", () => {
  it("renders fleet scenario totals, states, and per-robot events", () => {
    const fleetResult = result();
    const report = renderFleetScenarioReport(fleetResult);

    expect(report).toContain("Scenario: Mixed Fault Fleet");
    expect(report).toContain("Robots: 3");
    expect(report).toContain(
      `Total Events: ${fleetResult.summary.totalEvents}`,
    );
    expect(report).toContain(
      `Total Faults: ${fleetResult.summary.totalFaults}`,
    );
    expect(report).toContain("FINAL STATES");
    expect(report).toContain("robot-alpha: faulted");
    expect(report).toContain("EVENTS BY ROBOT");
    expect(report).toContain(
      `robot-beta: ${fleetResult.robotResults["robot-beta"]!.events.length}`,
    );
  });

  it("renders fleet replay identity, totals, and validation", () => {
    const fleetResult = result();
    const report = renderFleetReplayReport(fleetResult.fleetReplayLog);

    expect(report).toContain("Fleet: mixed-fault-fleet");
    expect(report).toContain("Robots: 3");
    expect(report).toContain(
      `Total Events: ${fleetResult.fleetReplayLog.eventCount}`,
    );
    expect(report).toContain("Validation: valid");
    expect(report).toContain("EVENTS BY ROBOT");
  });

  it("is deterministic for equal input", () => {
    const fleetResult = result();

    expect(renderFleetScenarioReport(fleetResult)).toBe(
      renderFleetScenarioReport(fleetResult),
    );
    expect(renderFleetReplayReport(fleetResult.fleetReplayLog)).toBe(
      renderFleetReplayReport(fleetResult.fleetReplayLog),
    );
  });
});
