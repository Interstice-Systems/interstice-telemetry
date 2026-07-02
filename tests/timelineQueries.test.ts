import { describe, expect, it } from "vitest";

import {
  filterTimelineByEventType,
  filterTimelineByRobot,
  filterTimelineByTimeRange,
  getTimelineEventByFleetSequence,
  summarizeTimelineByEventType,
  summarizeTimelineByRobot,
  type FleetEventTimeline,
} from "../src/index.js";

const timeline = (): FleetEventTimeline => ({
  version: "0.11.0",
  fleetId: "fleet-1",
  createdAt: "2026-01-01T00:00:00.000Z",
  eventCount: 3,
  events: [
    {
      fleetSequence: 1,
      robotId: "robot-b",
      robotSequence: 1,
      timestamp: 0,
      type: "stream.started",
      eventId: "b-1",
      payload: {},
    },
    {
      fleetSequence: 2,
      robotId: "robot-a",
      robotSequence: 1,
      timestamp: 10,
      type: "stream.started",
      eventId: "a-1",
      payload: {},
    },
    {
      fleetSequence: 3,
      robotId: "robot-a",
      robotSequence: 2,
      timestamp: 20,
      type: "fault.injected",
      eventId: "a-2",
      payload: {},
    },
  ],
});

describe("fleet timeline queries", () => {
  it("filters by robot without mutating the timeline", () => {
    const source = timeline();
    const result = filterTimelineByRobot(source, "robot-a");

    expect(result.map((event) => event.fleetSequence)).toEqual([2, 3]);
    expect(filterTimelineByRobot(source, "missing")).toEqual([]);
    expect(source.eventCount).toBe(3);
  });

  it("filters by event type", () => {
    expect(
      filterTimelineByEventType(timeline(), "fault.injected").map(
        (event) => event.fleetSequence,
      ),
    ).toEqual([3]);
  });

  it("filters by an inclusive time range", () => {
    expect(
      filterTimelineByTimeRange(timeline(), 0, 10).map(
        (event) => event.timestamp,
      ),
    ).toEqual([0, 10]);
  });

  it("looks up an event by fleet sequence", () => {
    expect(
      getTimelineEventByFleetSequence(timeline(), 2)?.eventId,
    ).toBe("a-1");
    expect(getTimelineEventByFleetSequence(timeline(), 99)).toBeUndefined();
  });

  it("summarizes robots and event types with sorted keys", () => {
    expect(summarizeTimelineByRobot(timeline())).toEqual({
      "robot-a": 2,
      "robot-b": 1,
    });
    expect(Object.keys(summarizeTimelineByEventType(timeline()))).toEqual([
      "fault.injected",
      "stream.started",
    ]);
    expect(summarizeTimelineByEventType(timeline())).toEqual({
      "fault.injected": 1,
      "stream.started": 2,
    });
  });
});

