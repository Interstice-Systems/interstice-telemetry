import {
  summarizeTimelineByEventType,
  summarizeTimelineByRobot,
} from "./timelineQueries.js";
import type {
  FleetEventTimeline,
  GlobalFleetEvent,
} from "./timelineTypes.js";

const renderCounts = (counts: Record<string, number>): string =>
  Object.entries(counts)
    .map(([key, count]) => `${key}: ${count}`)
    .join("\n");

const renderSampleEvent = (event: GlobalFleetEvent): string =>
  `#${event.fleetSequence} t=${event.timestamp} ms ${event.robotId} ${event.type} robotSeq=${event.robotSequence}`;

export const renderFleetTimelineSummary = (
  timeline: FleetEventTimeline,
): string => {
  const byRobot = summarizeTimelineByRobot(timeline);
  const byType = summarizeTimelineByEventType(timeline);
  const firstTimestamp = timeline.events[0]?.timestamp;
  const lastTimestamp = timeline.events.at(-1)?.timestamp;

  return [
    "INTERSTICE TELEMETRY — GLOBAL FLEET TIMELINE SUMMARY",
    `Fleet: ${timeline.fleetId}`,
    `Events: ${timeline.eventCount}`,
    `Robots: ${Object.keys(byRobot).length}`,
    `First Timestamp: ${firstTimestamp === undefined ? "n/a" : `${firstTimestamp} ms`}`,
    `Last Timestamp: ${lastTimestamp === undefined ? "n/a" : `${lastTimestamp} ms`}`,
    "",
    "EVENTS BY ROBOT",
    renderCounts(byRobot) || "(none)",
    "",
    "EVENTS BY TYPE",
    renderCounts(byType) || "(none)",
  ].join("\n");
};

export const renderFleetTimelineReport = (
  timeline: FleetEventTimeline,
): string =>
  [
    renderFleetTimelineSummary(timeline).replace(
      "INTERSTICE TELEMETRY — GLOBAL FLEET TIMELINE SUMMARY",
      "INTERSTICE TELEMETRY — GLOBAL FLEET TIMELINE",
    ),
    "",
    "TIMELINE SAMPLE",
    timeline.events.slice(0, 10).map(renderSampleEvent).join("\n") ||
      "(none)",
  ].join("\n");

