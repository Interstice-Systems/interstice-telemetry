import type { ReplayLog } from "../replay/replayLog.js";
import { validateReplayLog } from "../replay/replayValidator.js";
import type {
  FleetReplayLog,
  FleetReplayValidationResult,
} from "./fleetTypes.js";

export const FLEET_REPLAY_LOG_VERSION = "0.7.0";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toIsoString = (value: Date | string | number): string => {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("createdAt must be a valid date");
  }

  return date.toISOString();
};

export const createFleetReplayLog = (
  fleetId: string,
  robotLogs: Record<string, ReplayLog>,
  metadata?: Record<string, unknown>,
  createdAt?: Date | string | number,
): FleetReplayLog => {
  const orderedLogs = Object.fromEntries(
    Object.entries(robotLogs)
      .sort(([left], [right]) =>
        left < right ? -1 : left > right ? 1 : 0,
      )
      .map(([robotId, log]) => [robotId, structuredClone(log)]),
  );
  const firstLog = Object.values(orderedLogs)[0];

  return {
    version: FLEET_REPLAY_LOG_VERSION,
    fleetId,
    createdAt: toIsoString(createdAt ?? firstLog?.createdAt ?? 0),
    robotLogs: orderedLogs,
    eventCount: Object.values(orderedLogs).reduce(
      (total, log) => total + log.eventCount,
      0,
    ),
    ...(metadata === undefined
      ? {}
      : { metadata: structuredClone(metadata) }),
  };
};

export const validateFleetReplayLog = (
  log: unknown,
): FleetReplayValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(log)) {
    return {
      valid: false,
      errors: ["Fleet replay log must be an object."],
      warnings,
    };
  }

  if (typeof log.version !== "string" || log.version.trim().length === 0) {
    errors.push("Fleet replay log version is required.");
  } else if (log.version !== FLEET_REPLAY_LOG_VERSION) {
    errors.push(
      `Unsupported fleet replay log version "${log.version}"; expected "${FLEET_REPLAY_LOG_VERSION}".`,
    );
  }

  if (typeof log.fleetId !== "string" || log.fleetId.trim().length === 0) {
    errors.push("Fleet replay log fleetId is required.");
  }

  if (
    typeof log.createdAt !== "string" ||
    !Number.isFinite(Date.parse(log.createdAt))
  ) {
    errors.push("Fleet replay log createdAt must be a valid date string.");
  }

  if (!isRecord(log.robotLogs)) {
    errors.push("Fleet replay log robotLogs must be an object.");
    return { valid: false, errors, warnings };
  }

  if (Object.keys(log.robotLogs).length === 0) {
    errors.push("Fleet replay log robotLogs must not be empty.");
  }

  let summedEventCount = 0;

  for (const [robotId, robotLog] of Object.entries(log.robotLogs)) {
    const validation = validateReplayLog(robotLog);

    if (isRecord(robotLog) && typeof robotLog.eventCount === "number") {
      summedEventCount += robotLog.eventCount;
    }

    if (isRecord(robotLog) && robotLog.robotId !== robotId) {
      errors.push(
        `Fleet replay robot log key "${robotId}" must match its robotId.`,
      );
    }

    for (const error of validation.errors) {
      errors.push(`Robot log "${robotId}": ${error}`);
    }
    for (const warning of validation.warnings) {
      warnings.push(`Robot log "${robotId}": ${warning}`);
    }
  }

  if (
    typeof log.eventCount !== "number" ||
    !Number.isInteger(log.eventCount) ||
    log.eventCount !== summedEventCount
  ) {
    errors.push(
      `Fleet replay log eventCount must equal summed robot event counts (${summedEventCount}).`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export const serializeFleetReplayLog = (log: FleetReplayLog): string =>
  JSON.stringify(log);

export const deserializeFleetReplayLog = (json: string): FleetReplayLog => {
  const parsed: unknown = JSON.parse(json);

  if (!isRecord(parsed)) {
    throw new TypeError("fleet replay log JSON must contain an object");
  }

  return parsed as unknown as FleetReplayLog;
};
