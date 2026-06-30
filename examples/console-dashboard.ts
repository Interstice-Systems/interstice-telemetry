import {
  BUILT_IN_SCENARIO_IDS,
  getBuiltInScenario,
  renderEventTimeline,
  renderFaultReport,
  renderReplayReport,
  renderScenarioReport,
  renderTelemetrySnapshot,
  runScenario,
} from "../src/index.js";

console.log("AVAILABLE BUILT-IN SCENARIOS");
for (const scenarioId of BUILT_IN_SCENARIO_IDS) {
  console.log(`- ${scenarioId}`);
}

const scenario = getBuiltInScenario("motor-overheat");

if (scenario === undefined) {
  throw new Error("Built-in motor-overheat scenario was not found.");
}

const result = runScenario(scenario);
const reports = [
  renderScenarioReport(result),
  renderTelemetrySnapshot(result.finalSnapshot),
  renderEventTimeline(result.events, {
    limit: 12,
    includePayloadSummary: true,
  }),
  renderFaultReport(result.events),
  renderReplayReport(result.replayLog),
];

console.log(`\n${reports.join("\n\n")}`);
