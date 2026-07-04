import { TELEMETRY_EVENT_TYPES } from "../events/eventTypes.js";
import { REPLAY_LOG_VERSION } from "./replayLog.js";
import { validateEvidenceProvenance } from "../provenance/provenanceValidator.js";

export interface ReplayValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasNonEmptyString = (
  value: Record<string, unknown>,
  field: string,
): boolean =>
  typeof value[field] === "string" && value[field].length > 0;

const isKnownEventType = (value: unknown): boolean =>
  typeof value === "string" &&
  (TELEMETRY_EVENT_TYPES as readonly string[]).includes(value);

export const validateReplayLog = (
  log: unknown,
): ReplayValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(log)) {
    return {
      valid: false,
      errors: ["Replay log must be an object."],
      warnings,
    };
  }

  if (!hasNonEmptyString(log, "version")) {
    errors.push("Replay log version is required.");
  } else if (log.version !== REPLAY_LOG_VERSION) {
    errors.push(
      `Unsupported replay log version "${log.version}"; expected "${REPLAY_LOG_VERSION}".`,
    );
  }

  if (!hasNonEmptyString(log, "robotId")) {
    errors.push("Replay log robotId is required.");
  }

  if (
    typeof log.createdAt !== "string" ||
    !Number.isFinite(Date.parse(log.createdAt))
  ) {
    errors.push("Replay log createdAt must be a valid date string.");
  }

  if (log.provenance !== undefined) {
    const result = validateEvidenceProvenance(log.provenance);
    errors.push(...result.errors.map((error) => `Replay provenance: ${error}`));
    warnings.push(
      ...result.warnings.map((warning) => `Replay provenance: ${warning}`),
    );
  }

  if (!Array.isArray(log.events)) {
    errors.push("Replay log events must be an array.");
    return { valid: false, errors, warnings };
  }

  if (
    typeof log.eventCount !== "number" ||
    !Number.isInteger(log.eventCount) ||
    log.eventCount !== log.events.length
  ) {
    errors.push(
      `Replay log eventCount must equal events.length (${log.events.length}).`,
    );
  }

  let previousSequence: number | undefined;
  let previousTimestamp: number | undefined;
  const eventIds = new Set<string>();

  log.events.forEach((event: unknown, index: number) => {
    const label = `Event at index ${index}`;

    if (!isRecord(event)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    if (!hasNonEmptyString(event, "id")) {
      errors.push(`${label} must have a non-empty id.`);
    } else if (eventIds.has(event.id as string)) {
      errors.push(`${label} has duplicate id "${String(event.id)}".`);
    } else {
      eventIds.add(event.id as string);
    }

    if (!hasNonEmptyString(event, "type")) {
      errors.push(`${label} must have a non-empty type.`);
    } else if (!isKnownEventType(event.type)) {
      errors.push(`${label} has unknown type "${String(event.type)}".`);
    }

    if (
      typeof event.timestamp !== "number" ||
      !Number.isFinite(event.timestamp) ||
      event.timestamp < 0
    ) {
      errors.push(`${label} must have a non-negative finite timestamp.`);
    } else {
      if (
        previousTimestamp !== undefined &&
        event.timestamp < previousTimestamp
      ) {
        errors.push(`${label} timestamp must not move backward.`);
      }
      previousTimestamp = event.timestamp;
    }

    if (!hasNonEmptyString(event, "robotId")) {
      errors.push(`${label} must have a non-empty robotId.`);
    } else if (
      typeof log.robotId === "string" &&
      event.robotId !== log.robotId
    ) {
      errors.push(
        `${label} robotId "${event.robotId}" does not match log robotId "${log.robotId}".`,
      );
    }

    if (
      typeof event.sequence !== "number" ||
      !Number.isInteger(event.sequence) ||
      event.sequence < 1
    ) {
      errors.push(`${label} must have a positive integer sequence.`);
    } else {
      if (
        previousSequence !== undefined &&
        event.sequence <= previousSequence
      ) {
        errors.push(
          `${label} sequence ${event.sequence} must be greater than ${previousSequence}.`,
        );
      }
      previousSequence = event.sequence;
    }

    if (!Object.hasOwn(event, "payload")) {
      errors.push(`${label} must have a payload field.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};
