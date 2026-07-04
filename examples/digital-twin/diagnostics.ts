import {
  runTwinDiagnostics,
  twinTimelineFixtureV1_1,
} from "../../src/digitalTwin/browser.js";

const report = runTwinDiagnostics(twinTimelineFixtureV1_1);
console.log(JSON.stringify(report.summary));
