import { describe, expect, it } from "vitest";

import {
  getBuiltInScenario,
  renderScenarioReport,
  runScenario,
} from "../src/index.js";

describe("renderScenarioReport", () => {
  it("summarizes a scenario result", () => {
    const scenario = getBuiltInScenario("motor-overheat");
    expect(scenario).toBeDefined();

    const result = runScenario(scenario!);
    const report = renderScenarioReport(result);

    expect(report).toContain("Scenario: Motor Overheat");
    expect(report).toContain(`Events: ${result.events.length}`);
    expect(report).toContain("Faults: 1");
    expect(report).toContain("Final State: faulted");
    expect(report).toContain("Replay Valid: yes");
  });

  it("is deterministic for the same result", () => {
    const scenario = getBuiltInScenario("motor-overheat");
    expect(scenario).toBeDefined();
    const result = runScenario(scenario!);

    expect(renderScenarioReport(result)).toBe(renderScenarioReport(result));
  });
});
