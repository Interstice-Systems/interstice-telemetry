import type { TelemetryEventType } from "../events/eventTypes.js";
import type {
  FleetEventTimeline,
  GlobalFleetEvent,
} from "./timelineTypes.js";

export const filterTimelineByRobot = (
  timeline: FleetEventTimeline,
  robotId: string,
): GlobalFleetEvent[] =>
  timeline.events.filter((event) => event.robotId === robotId);

export const filterTimelineByEventType = (
  timeline: FleetEventTimeline,
  type: TelemetryEventType,
): GlobalFleetEvent[] =>
  timeline.events.filter((event) => event.type === type);

export const filterTimelineByTimeRange = (
  timeline: FleetEventTimeline,
  startMs: number,
  endMs: number,
): GlobalFleetEvent[] =>
  timeline.events.filter(
    (event) => event.timestamp >= startMs && event.timestamp <= endMs,
  );

export const getTimelineEventByFleetSequence = (
  timeline: FleetEventTimeline,
  sequence: number,
): GlobalFleetEvent | undefined =>
  timeline.events.find((event) => event.fleetSequence === sequence);

const summarize = (
  values: readonly string[],
): Record<string, number> => {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Object.fromEntries(
    [...counts].sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    ),
  );
};

export const summarizeTimelineByRobot = (
  timeline: FleetEventTimeline,
): Record<string, number> =>
  summarize(timeline.events.map((event) => event.robotId));

export const summarizeTimelineByEventType = (
  timeline: FleetEventTimeline,
): Record<string, number> =>
  summarize(timeline.events.map((event) => event.type));

