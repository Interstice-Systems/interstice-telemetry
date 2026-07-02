import { describe, expect, it } from "vitest";

import {
  buildFleetEventTimeline,
  type FleetReplayLog,
  type ReplayLog,
  type TelemetryEvent,
} from "../src/index.js";

const event = (
  robotId: string,
  sequence: number,
  timestamp: number,
  id: string,
): TelemetryEvent => ({
  id,
  type: "telemetry.snapshot",
  timestamp,
  robotId,
  sequence,
  payload: { id },
});

const replay = (
  robotId: string,
  events: TelemetryEvent[],
): ReplayLog => ({
  version: "0.3.0",
  robotId,
  createdAt: "2026-01-01T00:00:00.000Z",
  eventCount: events.length,
  events,
});

const fleetLog = (): FleetReplayLog => ({
  version: "0.7.0",
  fleetId: "fleet-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  robotLogs: {
    "robot-z": replay("robot-z", [
      event("robot-z", 2, 20, "z-2"),
      event("robot-z", 1, 10, "z-1"),
    ]),
    "robot-a": replay("robot-a", [
      event("robot-a", 2, 10, "a-z"),
      event("robot-a", 2, 10, "a-a"),
      event("robot-a", 1, 10, "a-1"),
    ]),
  },
  eventCount: 5,
});

describe("buildFleetEventTimeline", () => {
  it("flattens logs and sorts by timestamp, robot, sequence, and ID", () => {
    const timeline = buildFleetEventTimeline(fleetLog());

    expect(timeline.eventCount).toBe(5);
    expect(timeline.events.map((item) => item.eventId)).toEqual([
      "a-1",
      "a-a",
      "a-z",
      "z-1",
      "z-2",
    ]);
    expect(timeline.events.map((item) => item.fleetSequence)).toEqual([
      1, 2, 3, 4, 5,
    ]);
    expect(timeline.events[0]).toMatchObject({
      robotId: "robot-a",
      robotSequence: 1,
      timestamp: 10,
    });
  });

  it("does not mutate the source fleet replay log", () => {
    const log = fleetLog();
    const before = structuredClone(log);
    const timeline = buildFleetEventTimeline(log, {
      metadata: { purpose: "test" },
    });

    (timeline.events[0]!.payload as { id: string }).id = "changed";
    timeline.metadata!.purpose = "changed";

    expect(log).toEqual(before);
  });
});

