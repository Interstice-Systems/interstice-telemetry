import { describe, expect, it } from "vitest";

import {
  createRobotState,
  deserializeRobotState,
  ROBOT_STATE_VERSION,
  robotStatesEqual,
  serializeRobotState,
} from "../src/index.js";
import { stateInput } from "./fixtures/digitalTwin.js";

describe("RobotState", () => {
  it("round trips through canonical JSON and remains equal", () => {
    const state = createRobotState(stateInput());
    const restored = deserializeRobotState(serializeRobotState(state));

    expect(state.schemaVersion).toBe(ROBOT_STATE_VERSION);
    expect(restored).toEqual(state);
    expect(robotStatesEqual(restored, state)).toBe(true);
    expect(Object.isFrozen(restored.sensorValues.imu)).toBe(true);
  });

  it("has deterministic equality independent of map insertion order", () => {
    const left = createRobotState(stateInput());
    const right = createRobotState({
      ...stateInput(),
      actuatorOutputs: { left_motor: 0.5, right_motor: 0.5 },
      jointStates: {
        left_wheel: { position: 2, velocity: 1 },
        right_wheel: { position: 2, velocity: 1 },
      },
    });

    expect(robotStatesEqual(left, right)).toBe(true);
    expect(serializeRobotState(left)).toBe(serializeRobotState(right));
  });

  it("rejects unstable or invalid values", () => {
    expect(() =>
      createRobotState({ ...stateInput(), timestamp: 1.5 }),
    ).toThrow(/timestamp/);
    expect(() => createRobotState(stateInput(1_000, 1.1))).toThrow(/charge/);
    expect(() =>
      createRobotState({
        ...stateInput(),
        metadata: { invalid: Number.NaN },
      }),
    ).toThrow(/finite/);
  });
});
