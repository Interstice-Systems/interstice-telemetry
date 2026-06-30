import { describe, expect, it } from "vitest";

import {
  renderFaultReport,
  type TelemetryEvent,
} from "../src/index.js";

const faultEvent: TelemetryEvent = {
  id: "robot-001:12",
  type: "fault.injected",
  timestamp: 10_000,
  robotId: "robot-001",
  sequence: 12,
  payload: { fault: { type: "motor_overheating", severity: 0.8 } },
};

describe("renderFaultReport", () => {
  it("shows a no-fault message when no fault events exist", () => {
    expect(renderFaultReport([])).toContain("No faults recorded.");
    expect(renderFaultReport([])).toContain("Total Fault Events: 0");
  });

  it("includes injected fault type, sequence, and timestamp", () => {
    const report = renderFaultReport([faultEvent]);

    expect(report).toContain("Total Fault Events: 1");
    expect(report).toContain(
      "motor overheating at sequence #12, timestamp 10000",
    );
  });

  it("is deterministic for the same event list", () => {
    expect(renderFaultReport([faultEvent])).toBe(
      renderFaultReport([faultEvent]),
    );
  });
});
