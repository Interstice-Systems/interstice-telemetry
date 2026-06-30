import {
  BUILT_IN_SCENARIO_IDS,
  getBuiltInScenario,
  runScenario,
} from "../src/index.js";

console.log(`built-in scenarios: ${BUILT_IN_SCENARIO_IDS.join(", ")}`);

const scenario = getBuiltInScenario("motor-overheat");

if (scenario === undefined) {
  throw new Error("Built-in motor-overheat scenario was not found.");
}

const result = runScenario(scenario);

console.log(`scenario: ${result.scenario.name}`);
console.log(`steps: ${result.summary.stepCount}`);
console.log(`events: ${result.summary.eventCount}`);
console.log(`faults: ${result.summary.faultCount}`);
console.log(`final state: ${result.summary.finalState}`);
console.log(`valid replay log: ${result.replayValidation.valid}`);
console.log(
  `sample events: ${result.events
    .slice(0, 5)
    .map((event) => `${event.sequence}:${event.type}`)
    .join(", ")}`,
);
