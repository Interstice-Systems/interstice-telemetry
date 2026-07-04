import {
  robotStateFixtureV1_1,
  validateRobotStateSchema,
} from "../../src/digitalTwin/browser.js";

const result = validateRobotStateSchema(robotStateFixtureV1_1);
console.log(`robot-state fixture valid: ${result.valid}`);
