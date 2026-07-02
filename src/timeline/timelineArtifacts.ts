import type { FleetEventTimeline } from "./timelineTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const serializeFleetEventTimeline = (
  timeline: FleetEventTimeline,
): string => JSON.stringify(timeline);

export const deserializeFleetEventTimeline = (
  json: string,
): FleetEventTimeline => {
  const parsed: unknown = JSON.parse(json);

  if (!isRecord(parsed)) {
    throw new TypeError("fleet event timeline JSON must contain an object");
  }

  return parsed as unknown as FleetEventTimeline;
};
