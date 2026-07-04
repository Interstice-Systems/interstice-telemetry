import {
  appendTransformation,
  createSimulationProvenance,
  renderProvenanceReport,
} from "../../src/index.js";

const origin = createSimulationProvenance({
  sourceName: "ScenarioRunner",
  robotId: "rover-1",
  timestamp: 1_735_689_600_000,
  metadata: { scenarioId: "warehouse-inspection" },
});

const provenance = appendTransformation(origin, {
  name: "Telemetry Snapshot",
  timestamp: 1_735_689_601_000,
});

console.log(renderProvenanceReport(provenance));
