import { describe, expect, it } from "vitest";

import {
  validateFleetEventTimeline,
  type FleetEventTimeline,
} from "../src/index.js";

const validTimeline = (): FleetEventTimeline => ({
  version: "0.11.0",
  fleetId: "fleet-1",
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
      robotSequence: 1,
      timestamp: 0,
      type: "stream.started",
      eventId: "b-1",
      payload: {},
    },
  ],
});

describe("validateFleetEventTimeline", () => {
  it("passes a valid timeline", () => {
    expect(validateFleetEventTimeline(validTimeline())).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("rejects an event count mismatch", () => {
    const timeline = validTimeline();
    timeline.eventCount = 3;

    expect(validateFleetEventTimeline(timeline).valid).toBe(false);
  });

  it("rejects unsupported versions and invalid creation times", () => {
    const timeline = validTimeline();
    timeline.version = "99.0.0";
    timeline.createdAt = "not-a-date";

    const result = validateFleetEventTimeline(timeline);
    expect(result.errors).toContain(
      'Unsupported fleet event timeline version "99.0.0"; expected "0.11.0".',
    );
    expect(result.errors).toContain(
      "Fleet event timeline createdAt must be a valid date string.",
    );
  });

  it("rejects non-increasing fleet sequences", () => {
    const timeline = validTimeline();
    timeline.events[1]!.fleetSequence = 1;

    expect(validateFleetEventTimeline(timeline).errors).toContain(
      "Timeline event at index 1 fleetSequence must be strictly increasing.",
    );
  });

  it("rejects a fleet sequence that does not start at one", () => {
    const timeline = validTimeline();
    timeline.events[0]!.fleetSequence = 2;
    timeline.events[1]!.fleetSequence = 3;

    expect(validateFleetEventTimeline(timeline).errors).toContain(
      "Fleet event timeline fleetSequence must start at 1.",
    );
  });

  it("rejects missing robot IDs", () => {
    const timeline = validTimeline();
    timeline.events[0]!.robotId = "";

    expect(validateFleetEventTimeline(timeline).errors).toContain(
      "Timeline event at index 0 robotId is required.",
    );
  });

  it("rejects unknown event types", () => {
    const timeline = validTimeline() as unknown as {
      events: { type: string }[];
    };
    timeline.events[0]!.type = "unknown.event";

    expect(validateFleetEventTimeline(timeline).errors).toContain(
      'Timeline event at index 0 has unknown type "unknown.event".',
    );
  });

  it("warns for empty timelines and rejects backward timestamps", () => {
    const empty = validTimeline();
    empty.eventCount = 0;
    empty.events = [];
    const backward = validTimeline();
    backward.events[0]!.timestamp = 10;

    expect(validateFleetEventTimeline(empty).warnings).toContain(
      "Fleet event timeline contains no events.",
    );
    expect(validateFleetEventTimeline(backward).errors).toContain(
      "Timeline event at index 1 timestamp must not move backward.",
    );
  });

  it("rejects sequence gaps, duplicate IDs, and non-canonical ties", () => {
    const timeline = validTimeline();
    timeline.events[1]!.fleetSequence = 3;
    timeline.events[1]!.eventId = "a-1";
    timeline.events[1]!.robotId = "robot-0";

    const errors = validateFleetEventTimeline(timeline).errors;
    expect(errors).toContain(
      "Timeline event at index 1 fleetSequence must equal 2.",
    );
    expect(errors).toContain(
      'Timeline event at index 1 has duplicate eventId "a-1".',
    );
    expect(errors).toContain(
      "Timeline event at index 1 is not in canonical timeline order.",
    );
  });
});
