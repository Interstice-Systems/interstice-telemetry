import { describe, expect, it } from "vitest";

import {
  createMultiRobotTwinView,
  createRobotState,
  createTwinTimeline,
  getRobotTwinTimeline,
  getTwinStatesAtTime,
  summarizeMultiRobotTwinView,
  validateMultiRobotTwinView,
} from "../src/index.js";
import { stateInput } from "./fixtures/digitalTwin.js";

const timeline = (robotId: string, timestamps: readonly number[]) =>
  createTwinTimeline({
    robotId,
    states: timestamps.map((timestamp) =>
      createRobotState({ ...stateInput(timestamp), robotId }),
    ),
  });

describe("multi-robot twin view", () => {
  it("preserves timelines in deterministic robot order with a correct summary", () => {
    const beta = timeline("beta", [2_000, 4_000]);
    const alpha = timeline("alpha", [1_000, 3_000]);
    const view = createMultiRobotTwinView([beta, alpha]);
    expect(view.robotIds).toEqual(["alpha", "beta"]);
    expect(view.timelines.alpha).toEqual(alpha);
    expect(getRobotTwinTimeline(view, "beta")).toEqual(beta);
    expect(summarizeMultiRobotTwinView(view)).toEqual({
      robotCount: 2,
      firstTimestamp: 1_000,
      lastTimestamp: 4_000,
      totalRecords: 4,
    });
  });

  it("queries the latest state at or before a timestamp", () => {
    const view = createMultiRobotTwinView([
      timeline("alpha", [1_000, 3_000]),
      timeline("beta", [2_000, 4_000]),
    ]);
    const states = getTwinStatesAtTime(view, 2_500);
    expect(states.alpha?.timestamp).toBe(1_000);
    expect(states.beta?.timestamp).toBe(2_000);
  });

  it("rejects duplicate timelines and validates missing entries", () => {
    const alpha = timeline("alpha", [1_000]);
    expect(() => createMultiRobotTwinView([alpha, alpha])).toThrow(/one timeline/);
    const view = createMultiRobotTwinView([alpha]);
    const invalid = structuredClone(view) as unknown as {
      timelines: Record<string, unknown>;
    };
    delete invalid.timelines.alpha;
    expect(validateMultiRobotTwinView(invalid).valid).toBe(false);
  });

  it("supports an empty view with a warning", () => {
    const view = createMultiRobotTwinView([]);
    expect(view.summary.firstTimestamp).toBeNull();
    expect(validateMultiRobotTwinView(view).summary.warnings).toBe(1);
  });
});
