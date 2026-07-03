import { describe, expect, it } from "vitest";

import {
  createRobot,
  DIGITAL_TWIN_MODEL_VERSION,
  deterministicStringify,
  type RobotInput,
} from "../src/index.js";

const identity = {
  translation: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
} as const;

const input: RobotInput = {
  id: "rover-1",
  rootFrameId: "base",
  metadata: { name: "Differential Rover", tags: ["example"] },
  frames: [
    { id: "base", name: "Base", transformToParent: identity },
  ],
  links: [{ id: "chassis", name: "Chassis", frameId: "base" }],
  joints: [],
  sensors: [
    { id: "imu", name: "IMU", type: "imu", frameId: "base" },
  ],
  actuators: [],
  attachments: [],
};

describe("digital twin robot model", () => {
  it("creates a deeply immutable structural model", () => {
    const robot = createRobot(input);

    expect(robot.schemaVersion).toBe(DIGITAL_TWIN_MODEL_VERSION);
    expect(Object.isFrozen(robot)).toBe(true);
    expect(Object.isFrozen(robot.frames)).toBe(true);
    expect(Object.isFrozen(robot.frames[0]?.transformToParent.translation)).toBe(
      true,
    );
    expect(() => {
      (robot.metadata as { name: string }).name = "mutated";
    }).toThrow(TypeError);
  });

  it("does not retain caller-owned mutable data", () => {
    const mutable = structuredClone(input) as RobotInput;
    const robot = createRobot(mutable);
    (mutable.frames as unknown as { id: string }[])[0]!.id = "changed";

    expect(robot.frames[0]?.id).toBe("base");
  });

  it("rejects duplicate and missing structural identifiers", () => {
    expect(() =>
      createRobot({ ...input, frames: [...input.frames, input.frames[0]!] }),
    ).toThrow(/duplicate id/);
    expect(() => createRobot({ ...input, rootFrameId: "missing" })).toThrow(
      /rootFrameId/,
    );
    expect(() =>
      createRobot({
        ...input,
        sensors: [
          { id: "camera", name: "Camera", type: "camera", frameId: "missing" },
        ],
      }),
    ).toThrow(/unknown id/);
  });

  it("canonicalizes arbitrary metadata object keys", () => {
    const left = createRobot({
      ...input,
      metadata: { name: "Rover", properties: { z: 1, a: 2 } },
    });
    const right = createRobot({
      ...input,
      metadata: { name: "Rover", properties: { a: 2, z: 1 } },
    });

    expect(deterministicStringify(left)).toBe(deterministicStringify(right));
  });
});
