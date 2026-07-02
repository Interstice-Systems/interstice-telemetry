import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  buildFleetEventTimeline,
  exportFleetRunArtifacts,
  filterTimelineByEventType,
  filterTimelineByRobot,
  filterTimelineByTimeRange,
  getBuiltInFleetScenario,
  getTimelineEventByFleetSequence,
  renderFleetTimelineReport,
  runFleetScenario,
  validateFleetEventTimeline,
} from "../src/index.js";

const scenario = getBuiltInFleetScenario("mixed-fault-fleet");

if (scenario === undefined) {
  throw new Error("Built-in mixed-fault-fleet scenario was not found.");
}

const result = runFleetScenario(scenario);
const timeline = buildFleetEventTimeline(result.fleetReplayLog, {
  clockKind: "fleet",
  metadata: { scenarioId: scenario.id },
});
const validation = validateFleetEventTimeline(timeline);

if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}

console.log(renderFleetTimelineReport(timeline));
console.log("");
console.log("QUERY EXAMPLES");
console.log(
  `robot-alpha events: ${filterTimelineByRobot(timeline, "robot-alpha").length}`,
);
console.log(
  `fault events: ${filterTimelineByEventType(timeline, "fault.injected").length}`,
);
console.log(
  `events from 4000 through 6000 ms: ${filterTimelineByTimeRange(timeline, 4_000, 6_000).length}`,
);
console.log(
  `fleet sequence 1: ${getTimelineEventByFleetSequence(timeline, 1)?.eventId ?? "not found"}`,
);

const rootDir = mkdtempSync(join(tmpdir(), "interstice-timeline-example-"));
const written = exportFleetRunArtifacts(result, { rootDir });
const timelineFiles = written.files.filter((path) =>
  path.startsWith("timeline/"),
);

console.log("");
console.log(`artifact path: ${written.experimentPath}`);
console.log(`timeline files: ${timelineFiles.join(", ")}`);

