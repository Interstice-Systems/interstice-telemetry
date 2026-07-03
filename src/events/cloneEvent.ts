import type { TelemetryEvent } from "./eventTypes.js";

/**
 * Creates an ownership boundary around replayable evidence.
 *
 * Events are plain structured data by contract. Each subscriber or storage
 * boundary receives its own copy so handler order and later caller mutation
 * cannot change evidence retained elsewhere.
 */
export const cloneTelemetryEvent = (
  event: TelemetryEvent,
): TelemetryEvent => structuredClone(event);
