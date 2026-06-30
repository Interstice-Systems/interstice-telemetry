import { describe, expect, it } from "vitest";

import {
  renderReplayReport,
  type ReplayLog,
  type TelemetryEvent,
} from "../src/index.js";

const events: TelemetryEvent[] = [
  {
    id: "robot-001:1",
    type: "stream.started",
    timestamp: 0,
    robotId: "robot-001",
    sequence: 1,
    payload: { status: "running" },
  },
  {
    id: "robot-001:2",
    type: "telemetry.snapshot",
    timestamp: 1_000,
    robotId: "robot-001",
    sequence: 2,
    payload: {},
  },
  {
    id: "robot-001:3",
    type: "stream.stopped",
    timestamp: 1_000,
    robotId: "robot-001",
    sequence: 3,
    payload: { status: "stopped" },
  },
];

const log: ReplayLog = {
  version: "0.3.0",
  robotId: "robot-001",
  createdAt: "1970-01-01T00:00:00.000Z",
  eventCount: events.length,
  events,
};

describe("renderReplayReport", () => {
  it("renders identity, validation, sequence range, and type counts", () => {
    const report = renderReplayReport(log);

    expect(report).toContain("Robot: robot-001");
    expect(report).toContain("Version: 0.3.0");
    expect(report).toContain("Events: 3");
    expect(report).toContain("Validation: valid");
    expect(report).toContain("First Sequence: 1");
    expect(report).toContain("Last Sequence: 3");
    expect(report).toContain("stream.started: 1");
    expect(report).toContain("telemetry.snapshot: 1");
    expect(report).toContain("stream.stopped: 1");
  });

  it("reports validation failures and empty sequence ranges", () => {
    const invalidLog: ReplayLog = {
      ...log,
      eventCount: 1,
      events: [],
    };
    const report = renderReplayReport(invalidLog);

    expect(report).toContain("Validation: invalid");
    expect(report).toContain("First Sequence: none");
    expect(report).toContain("Last Sequence: none");
  });

  it("is deterministic for the same replay log", () => {
    expect(renderReplayReport(log)).toBe(renderReplayReport(log));
  });
});
