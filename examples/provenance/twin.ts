import {
  buildTwinTimelineFromReplay,
  createReplayProvenance,
  renderProvenanceReport,
  runTwinDiagnostics,
  type ReplayLog,
} from "../../src/index.js";

const replay: ReplayLog = {
  version: "0.3.0",
  robotId: "rover-1",
  createdAt: "1970-01-01T00:00:01.000Z",
  eventCount: 1,
  events: [{
    id: "rover-1:1",
    type: "telemetry.snapshot",
    timestamp: 1_000,
    robotId: "rover-1",
    sequence: 1,
    payload: {},
  }],
  provenance: createReplayProvenance({
    sourceName: "Imported Replay",
    robotId: "rover-1",
    timestamp: 1_000,
  }),
};
const report = runTwinDiagnostics(buildTwinTimelineFromReplay(replay));

if (report.provenance !== undefined) {
  console.log(renderProvenanceReport(report.provenance));
}
