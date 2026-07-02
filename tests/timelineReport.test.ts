import { describe, expect, it } from "vitest";

import {
  renderFleetTimelineReport,
  renderFleetTimelineSummary,
  type FleetEventTimeline,
} from "../src/index.js";

const timeline: FleetEventTimeline = {
  version: "0.11.0",
  fleetId: "report-fleet",
  createdAt: "2026-01-01T00:00:00.000Z",
  eventCount: 2,
  events: [
    {
      fleetSequence: 1,
      robotId: "robot-a",
      robotSequence: 1,
      timestamp: 0,
      type: "stream.started",
      eventId: "a-1",
      payload: {},
    },
    {
      fleetSequence: 2,
      robotId: "robot-b",
      robotSequence: 4,
      timestamp: 50,
      type: "fault.injected",
      eventId: "b-4",
      payload: {},
    },
  ],
};

describe("fleet timeline reports", () => {
  it("renders fleet identity, counts, and sample events", () => {
    const report = renderFleetTimelineReport(timeline);

    expect(report).toContain("Fleet: report-fleet");
    expect(report).toContain("Events: 2");
    expect(report).toContain("robot-a: 1");
    expect(report).toContain("fault.injected: 1");
    expect(report).toContain(
      "#2 t=50 ms robot-b fault.injected robotSeq=4",
    );
  });

  it("renders a deterministic compact summary", () => {
    const first = renderFleetTimelineSummary(timeline);

    expect(renderFleetTimelineSummary(timeline)).toBe(first);
    expect(first).not.toContain("TIMELINE SAMPLE");
  });
});

