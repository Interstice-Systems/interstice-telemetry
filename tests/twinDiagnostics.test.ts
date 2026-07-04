import { describe, expect, it } from "vitest";

import {
  robotStateFixtureV1_1,
  runTwinDiagnostics,
  twinTimelineFixtureV1_1,
  validateRobotState,
  validateTwinTimeline,
} from "../src/index.js";

describe("deterministic twin diagnostics", () => {
  it("accepts a valid state", () => {
    expect(validateRobotState(robotStateFixtureV1_1)).toMatchObject({
      valid: true,
      summary: { errors: 0 },
    });
  });

  it("detects invalid battery, pose, and operating mode", () => {
    const state = structuredClone(robotStateFixtureV1_1) as unknown as {
      batteryStatus: { charge: number };
      globalPose: { position: { x: number } };
      operatingMode: string;
    };
    state.batteryStatus.charge = 2;
    state.globalPose.position.x = Number.NaN;
    state.operatingMode = "teleporting";
    const report = validateRobotState(state);
    expect(report.diagnostics.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "state.battery.charge-out-of-range",
        "state.pose.invalid-number",
        "state.operating-mode.invalid",
      ]),
    );
  });

  it("detects non-monotonic, duplicate, mismatched, and scene records", () => {
    type MutableTimelineState = {
      timestamp: number;
      robotId: string;
      metadata: { sceneId: string };
    };
    const timeline = structuredClone(twinTimelineFixtureV1_1) as unknown as {
      states: MutableTimelineState[];
    };
    const second = structuredClone(timeline.states[0]!);
    second.timestamp = 500;
    second.robotId = "other";
    second.metadata.sceneId = "other-scene";
    timeline.states.push(second, structuredClone(second));
    const report = validateTwinTimeline(timeline);
    expect(report.diagnostics.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        "timeline.timestamp.non-monotonic",
        "timeline.timestamp.duplicate",
        "timeline.robot-id.mismatch",
        "timeline.scene-reference.mismatch",
      ]),
    );
  });

  it("sorts diagnostics deterministically and warns on empty timelines", () => {
    const timeline = structuredClone(twinTimelineFixtureV1_1) as unknown as {
      states: unknown[];
    };
    timeline.states = [];
    expect(runTwinDiagnostics(timeline)).toEqual(runTwinDiagnostics(timeline));
    expect(runTwinDiagnostics(timeline).diagnostics).toContainEqual(
      expect.objectContaining({ id: "timeline.empty", severity: "warning" }),
    );
  });
});
