import {
  BUILT_IN_FLEET_SCENARIO_IDS,
  getBuiltInFleetScenario,
  renderFleetReplayReport,
  renderFleetScenarioReport,
  runFleetScenario,
} from "../src/index.js";

console.log(
  `built-in fleet scenarios: ${BUILT_IN_FLEET_SCENARIO_IDS.join(", ")}`,
);

const scenario = getBuiltInFleetScenario("mixed-fault-fleet");

if (scenario === undefined) {
  throw new Error("Built-in mixed-fault-fleet scenario was not found.");
}

const result = runFleetScenario(scenario);

console.log("");
console.log(renderFleetScenarioReport(result));
console.log("");
console.log(renderFleetReplayReport(result.fleetReplayLog));
console.log("");
console.log("ROBOT RESULTS");

for (const [robotId, robotResult] of Object.entries(result.robotResults)) {
  console.log(
    `${robotId}: final state=${robotResult.summary.finalState}, events=${robotResult.summary.eventCount}`,
  );
}
