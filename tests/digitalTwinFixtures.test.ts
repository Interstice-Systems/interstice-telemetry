import { describe, expect, it } from "vitest";

import {
  deserializeRobotState,
  deserializeScene,
  deserializeTwinTimeline,
  DIGITAL_TWIN_FIXTURE_VERSION_V1_1,
  robotStateFixtureV1_1,
  sceneModelFixtureV1_1,
  twinTimelineFixtureV1_1,
} from "../src/index.js";

describe("v1.1 digital twin compatibility fixtures", () => {
  it("remain consumable by the public deserializers", () => {
    expect(DIGITAL_TWIN_FIXTURE_VERSION_V1_1).toBe("v1_1");
    expect(deserializeRobotState(JSON.stringify(robotStateFixtureV1_1)).robotId).toBe("rover-1");
    expect(deserializeScene(JSON.stringify(sceneModelFixtureV1_1)).id).toBe("robotics-lab-1");
    expect(deserializeTwinTimeline(JSON.stringify(twinTimelineFixtureV1_1)).states).toHaveLength(1);
  });

  it("are recursively immutable", () => {
    expect(Object.isFrozen(robotStateFixtureV1_1)).toBe(true);
    expect(() => {
      (robotStateFixtureV1_1 as { robotId: string }).robotId = "changed";
    }).toThrow(TypeError);
  });
});
