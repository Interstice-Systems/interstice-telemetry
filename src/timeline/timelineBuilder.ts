import type { FleetReplayLog } from "../fleet/fleetTypes.js";
import {
  FLEET_EVENT_TIMELINE_VERSION,
  type FleetEventTimeline,
  type FleetTimelineBuildOptions,
  type GlobalFleetEvent,
} from "./timelineTypes.js";

const compareStrings = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

export const buildFleetEventTimeline = (
  fleetReplayLog: FleetReplayLog,
  options: FleetTimelineBuildOptions = {},
): FleetEventTimeline => {
  const events = Object.values(fleetReplayLog.robotLogs)
    .flatMap((log) =>
      log.events.map(
        (event): Omit<GlobalFleetEvent, "fleetSequence"> => ({
          robotId: event.robotId,
          robotSequence: event.sequence,
          timestamp: event.timestamp,
          type: event.type,
          eventId: event.id,
          payload: structuredClone(event.payload),
        }),
      ),
    )
    .sort(
      (left, right) =>
        left.timestamp - right.timestamp ||
        compareStrings(left.robotId, right.robotId) ||
        left.robotSequence - right.robotSequence ||
        compareStrings(left.eventId, right.eventId),
    )
    .map((event, index): GlobalFleetEvent => ({
      fleetSequence: index + 1,
      ...event,
    }));

  return {
    version: FLEET_EVENT_TIMELINE_VERSION,
    fleetId: options.fleetId ?? fleetReplayLog.fleetId,
    createdAt: options.createdAt ?? fleetReplayLog.createdAt,
    ...(options.clockKind === undefined
      ? {}
      : { clockKind: options.clockKind }),
    eventCount: events.length,
    events,
    ...(options.metadata === undefined
      ? {}
      : { metadata: structuredClone(options.metadata) }),
  };
};
