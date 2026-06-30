import { describe, expect, it } from "vitest";

import {
  renderEventTimeline,
  type TelemetryEvent,
} from "../src/index.js";

const events: TelemetryEvent[] = [
  {
    id: "robot-001:3",
    type: "telemetry.snapshot",
    timestamp: 1_000,
    robotId: "robot-001",
    sequence: 3,
    payload: { snapshot: { state: "active" } },
  },
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
    type: "fault.injected",
    timestamp: 500,
    robotId: "robot-001",
    sequence: 2,
    payload: { fault: { type: "motor_overheating" } },
  },
];

describe("renderEventTimeline", () => {
  it("preserves input event order", () => {
    const report = renderEventTimeline(events);

    expect(report.indexOf("#3")).toBeLessThan(report.indexOf("#1"));
    expect(report.indexOf("#1")).toBeLessThan(report.indexOf("#2"));
  });

  it("respects the limit option", () => {
    const report = renderEventTimeline(events, { limit: 2 });

    expect(report).toContain("#3");
    expect(report).toContain("#1");
    expect(report).not.toContain("#2");
  });

  it("can add compact payload summaries", () => {
    const report = renderEventTimeline(events, {
      includePayloadSummary: true,
    });

    expect(report).toContain("state=active");
    expect(report).toContain("status=running");
    expect(report).toContain("fault=motor overheating");
  });

  it("renders empty and zero-limit timelines consistently", () => {
    expect(renderEventTimeline([])).toBe(
      "EVENT TIMELINE\n(no events)",
    );
    expect(renderEventTimeline(events, { limit: 0 })).toBe(
      "EVENT TIMELINE\n(no events)",
    );
  });

  it("is deterministic for the same events and options", () => {
    const options = { limit: 2, includePayloadSummary: true };
    expect(renderEventTimeline(events, options)).toBe(
      renderEventTimeline(events, options),
    );
  });
});
