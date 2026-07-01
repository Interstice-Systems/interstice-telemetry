import { describe, expect, it } from "vitest";

import {
  ADAPTER_EVENT_TYPES,
  TELEMETRY_EVENT_TYPES,
  validateReplayLog,
  type AdapterTelemetryEvent,
  type ReplayLog,
} from "../src/index.js";

describe("adapter event types", () => {
  it("defines the stable adapter event vocabulary", () => {
    expect(ADAPTER_EVENT_TYPES).toEqual([
      "adapter.stream.started",
      "adapter.stream.stopped",
      "adapter.telemetry.snapshot",
      "adapter.status.changed",
      "adapter.reading.changed",
    ]);
  });

  it("registers every adapter event with the shared telemetry contract", () => {
    expect(
      ADAPTER_EVENT_TYPES.every((type) =>
        (TELEMETRY_EVENT_TYPES as readonly string[]).includes(type),
      ),
    ).toBe(true);
  });

  it("is accepted by replay validation", () => {
    const event: AdapterTelemetryEvent = {
      id: "adapter-rover:1",
      type: "adapter.stream.started",
      timestamp: 0,
      robotId: "adapter-rover",
      sequence: 1,
      payload: { status: "running" },
    };
    const log: ReplayLog = {
      version: "0.3.0",
      robotId: "adapter-rover",
      createdAt: "1970-01-01T00:00:00.000Z",
      eventCount: 1,
      events: [event],
    };

    expect(validateReplayLog(log)).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });
});
