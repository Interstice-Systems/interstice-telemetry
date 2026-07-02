import {
  TELEMETRY_EVENT_TYPES,
} from "../events/eventTypes.js";
import type { FleetTimelineValidationResult } from "./timelineTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const validateFleetEventTimeline = (
  timeline: unknown,
): FleetTimelineValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(timeline)) {
    return {
      valid: false,
      errors: ["Fleet event timeline must be an object."],
      warnings,
    };
  }

  if (!isNonEmptyString(timeline.version)) {
    errors.push("Fleet event timeline version is required.");
  }

  if (!isNonEmptyString(timeline.fleetId)) {
    errors.push("Fleet event timeline fleetId is required.");
  }

  if (!Array.isArray(timeline.events)) {
    errors.push("Fleet event timeline events must be an array.");
    return { valid: false, errors, warnings };
  }

  if (
    !Number.isInteger(timeline.eventCount) ||
    timeline.eventCount !== timeline.events.length
  ) {
    errors.push(
      `Fleet event timeline eventCount must equal events.length (${timeline.events.length}).`,
    );
  }

  if (timeline.events.length === 0) {
    warnings.push("Fleet event timeline contains no events.");
  }

  let previousFleetSequence: number | undefined;
  let previousTimestamp: number | undefined;

  timeline.events.forEach((event, index) => {
    const label = `Timeline event at index ${index}`;

    if (!isRecord(event)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    if (
      !Number.isInteger(event.fleetSequence) ||
      (event.fleetSequence as number) < 1
    ) {
      errors.push(`${label} fleetSequence must be a positive integer.`);
    } else {
      const fleetSequence = event.fleetSequence as number;

      if (index === 0 && fleetSequence !== 1) {
        errors.push("Fleet event timeline fleetSequence must start at 1.");
      }
      if (
        previousFleetSequence !== undefined &&
        fleetSequence <= previousFleetSequence
      ) {
        errors.push(
          `${label} fleetSequence must be strictly increasing.`,
        );
      }
      previousFleetSequence = fleetSequence;
    }

    if (!isNonEmptyString(event.robotId)) {
      errors.push(`${label} robotId is required.`);
    }

    if (
      !Number.isInteger(event.robotSequence) ||
      (event.robotSequence as number) < 1
    ) {
      errors.push(`${label} robotSequence must be a positive integer.`);
    }

    if (
      typeof event.timestamp !== "number" ||
      !Number.isFinite(event.timestamp) ||
      event.timestamp < 0
    ) {
      errors.push(`${label} timestamp must be finite and non-negative.`);
    } else {
      if (
        previousTimestamp !== undefined &&
        event.timestamp < previousTimestamp
      ) {
        warnings.push(`${label} timestamp moves backward.`);
      }
      previousTimestamp = event.timestamp;
    }

    if (
      typeof event.type !== "string" ||
      !(TELEMETRY_EVENT_TYPES as readonly string[]).includes(event.type)
    ) {
      errors.push(`${label} has unknown type "${String(event.type)}".`);
    }

    if (!isNonEmptyString(event.eventId)) {
      errors.push(`${label} eventId is required.`);
    }
  });

  return { valid: errors.length === 0, errors, warnings };
};

