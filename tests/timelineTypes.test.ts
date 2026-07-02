import { describe, expect, it } from "vitest";

import {
  FLEET_EVENT_TIMELINE_VERSION,
  type FleetEventTimeline,
} from "../src/index.js";

describe("fleet timeline types", () => {
  it("stores fleet and robot sequence numbers", () => {
    const timeline: FleetEventTimeline = {
      version: FLEET_EVENT_TIMELINE_VERSION,
      fleetId: "fleet-1",
      createdAt: "1970-01-01T00:00:00.000Z",
      eventCount: 1,
      events: [
        {
          fleetSequence: 1,
          robotId: "robot-1",
          robotSequence: 7,
          timestamp: 100,
          type: "telemetry.snapshot",
          eventId: "event-7",
          payload: {},
        },
      ],
    };

    expect(timeline.events[0]).toMatchObject({
      fleetSequence: 1,
      robotSequence: 7,
    });
  });
});

