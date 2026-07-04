// Installed consumers use:
// import { validateRobotStateSchema } from "interstice-telemetry/digital-twin";
import {
  robotStateFixtureV1_1,
  validateRobotStateSchema,
} from "../../src/digitalTwin/browser.js";

console.log(validateRobotStateSchema(robotStateFixtureV1_1).valid);
