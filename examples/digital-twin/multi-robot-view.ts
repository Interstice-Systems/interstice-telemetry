import {
  createMultiRobotTwinView,
  deserializeTwinTimeline,
  getTwinStatesAtTime,
  twinTimelineFixtureV1_1,
} from "../../src/digitalTwin/browser.js";

const rover = deserializeTwinTimeline(JSON.stringify(twinTimelineFixtureV1_1));
const view = createMultiRobotTwinView([rover], {
  viewId: "lab-robots",
  createdAt: "2026-01-01T00:00:00.000Z",
});
console.log(view.summary);
console.log(getTwinStatesAtTime(view, 1_000));
