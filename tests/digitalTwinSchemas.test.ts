import { describe, expect, it } from "vitest";

import {
  robotStateFixtureV1_1,
  robotStateSchema,
  sceneModelFixtureV1_1,
  twinTimelineFixtureV1_1,
  validateRobotStateSchema,
  validateSceneModelSchema,
  validateTwinTimelineSchema,
} from "../src/index.js";

describe("digital twin JSON schemas", () => {
  it("validates each published compatibility contract", () => {
    expect(validateRobotStateSchema(robotStateFixtureV1_1).valid).toBe(true);
    expect(validateSceneModelSchema(sceneModelFixtureV1_1).valid).toBe(true);
    expect(validateTwinTimelineSchema(twinTimelineFixtureV1_1).valid).toBe(true);
  });

  it("rejects invalid state data with deterministic issues", () => {
    const invalid = structuredClone(robotStateFixtureV1_1) as Record<string, unknown>;
    invalid.robotId = "";
    const first = validateRobotStateSchema(invalid);
    const second = validateRobotStateSchema(invalid);

    expect(first.valid).toBe(false);
    expect(first).toEqual(second);
    expect(first.issues.some(({ instancePath }) => instancePath === "/robotId")).toBe(true);
  });

  it("publishes draft 2020-12 schemas with version expectations", () => {
    const schema = robotStateSchema as Record<string, unknown>;
    expect(schema.$schema).toBe("https://json-schema.org/draft/2020-12/schema");
    expect(JSON.stringify(schema)).toContain('"const":"1.0.0"');
  });
});
