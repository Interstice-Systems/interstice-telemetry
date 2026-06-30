import { describe, expect, it } from "vitest";

import {
  validateReplayLog,
  type ReplayLog,
  type TelemetryEvent,
} from "../src/index.js";

const createEvent = (sequence: number): TelemetryEvent => ({
  id: `validator-rover:${sequence}`,
  type: "telemetry.snapshot",
  timestamp: sequence * 1_000,
  robotId: "validator-rover",
  sequence,
  payload: { sequence },
});

const createLog = (): ReplayLog => ({
  version: "0.3.0",
  robotId: "validator-rover",
  createdAt: "1970-01-01T00:00:00.000Z",
  eventCount: 2,
  events: [createEvent(1), createEvent(2)],
});

describe("validateReplayLog", () => {
  it("passes a valid log", () => {
    expect(validateReplayLog(createLog())).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("fails when eventCount does not match events length", () => {
    const log = createLog();
    log.eventCount = 3;

    const result = validateReplayLog(log);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Replay log eventCount must equal events.length (2).",
    );
  });

  it("fails for non-increasing event sequences", () => {
    const log = createLog();
    log.events[1] = createEvent(1);

    const result = validateReplayLog(log);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("must be greater"))).toBe(
      true,
    );
  });

  it("fails for unknown event types", () => {
    const log = createLog() as unknown as {
      events: Array<Record<string, unknown>>;
    };
    log.events[0]!.type = "telemetry.unknown";

    const result = validateReplayLog(log);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((error) => error.includes("unknown type")),
    ).toBe(true);
  });

  it("fails when an event belongs to another robot", () => {
    const log = createLog();
    log.events[1] = { ...log.events[1]!, robotId: "another-rover" };

    const result = validateReplayLog(log);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((error) => error.includes("does not match")),
    ).toBe(true);
  });

  it("fails when createdAt is not a valid date", () => {
    const log = createLog();
    log.createdAt = "not-a-date";

    const result = validateReplayLog(log);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Replay log createdAt must be a valid date string.",
    );
  });

  it("reports missing required event fields", () => {
    const log = createLog() as unknown as {
      events: Array<Record<string, unknown>>;
      eventCount: number;
      robotId: string;
      version: string;
    };
    log.events = [{ type: "stream.started" }];
    log.eventCount = 1;

    const result = validateReplayLog(log);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(5);
  });
});
