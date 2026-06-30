import { describe, expect, it } from "vitest";

import {
  getBuiltInScenario,
  runScenario,
  ScenarioRunner,
  type ScenarioProfile,
} from "../src/index.js";

const testProfile = (): ScenarioProfile => ({
  id: "runner-test",
  name: "Runner Test",
  description: "A deterministic scenario runner test.",
  seed: "runner-seed",
  robotId: "runner-rover",
  initialState: "active",
  durationMs: 2_500,
  stepMs: 1_000,
  faults: [
    { atMs: 0, fault: { type: "sensor_noise", severity: 0.4 } },
    { atMs: 1_500, fault: { type: "stalled_motor", severity: 0.8 } },
  ],
  metadata: { owner: "test" },
});

describe("ScenarioRunner", () => {
  it("produces deterministic results for equal scenarios", () => {
    expect(runScenario(testProfile())).toEqual(runScenario(testProfile()));
  });

  it("injects each scheduled fault exactly once", () => {
    const result = new ScenarioRunner(testProfile()).run();
    const faultEvents = result.events.filter(
      ({ type }) => type === "fault.injected",
    );

    expect(faultEvents).toHaveLength(2);
    expect(faultEvents.map(({ payload }) => payload)).toEqual([
      { fault: { type: "sensor_noise", severity: 0.4 } },
      { fault: { type: "stalled_motor", severity: 0.8 } },
    ]);
    expect(result.summary.faultCount).toBe(2);
  });

  it("creates a valid replay log with internally consistent counts", () => {
    const result = runScenario(testProfile());

    expect(result.replayValidation.valid).toBe(true);
    expect(result.replayLog.events).toEqual(result.events);
    expect(result.summary.eventCount).toBe(result.events.length);
    expect(result.summary.faultCount).toBe(
      result.events.filter(({ type }) => type === "fault.injected").length,
    );
    expect(result.summary.stepCount).toBe(3);
    expect(result.summary.durationMs).toBe(2_500);
  });

  it("does not mutate the original profile", () => {
    const profile = testProfile();
    const original = structuredClone(profile);

    const result = new ScenarioRunner(profile).run();

    expect(profile).toEqual(original);
    expect(result.scenario).toEqual(original);
  });

  it("runs a built-in fault scenario through to a faulted final state", () => {
    const profile = getBuiltInScenario("motor-overheat");

    expect(profile).toBeDefined();
    const result = runScenario(profile!);

    expect(result.finalSnapshot.state).toBe("faulted");
    expect(result.summary.finalState).toBe("faulted");
    expect(result.replayValidation.valid).toBe(true);
  });

  it("rejects invalid profiles before running", () => {
    const profile = { ...testProfile(), durationMs: 0 };

    expect(() => runScenario(profile)).toThrow("Invalid scenario profile");
  });
});
