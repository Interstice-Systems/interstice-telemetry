import {
  ReplayRecorder,
  createTelemetryProvenance,
  renderProvenanceReport,
  type TelemetryEvent,
} from "../../src/index.js";

const provenance = createTelemetryProvenance({
  sourceName: "HardwareTelemetry",
  robotId: "rover-1",
  timestamp: 1_000,
  confidence: "measured",
});
const event: TelemetryEvent = {
  id: "rover-1:1",
  type: "telemetry.snapshot",
  timestamp: 1_000,
  robotId: "rover-1",
  sequence: 1,
  payload: {},
  provenance,
};
const recorder = new ReplayRecorder({ createdAt: 1_000 });
recorder.start();
recorder.record(event);
const replay = recorder.toLog();

if (replay.provenance !== undefined) {
  console.log(renderProvenanceReport(replay.provenance));
}
