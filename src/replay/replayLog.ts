import type { TelemetryEvent } from "../events/eventTypes.js";

export const REPLAY_LOG_VERSION = "0.3.0";

export interface ReplayLog {
  version: string;
  robotId: string;
  createdAt: string;
  seed?: number | string;
  eventCount: number;
  events: TelemetryEvent[];
  metadata?: Record<string, unknown>;
}

export const serializeReplayLog = (log: ReplayLog): string =>
  JSON.stringify(log);

export const deserializeReplayLog = (json: string): ReplayLog => {
  const parsed: unknown = JSON.parse(json);

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new TypeError("replay log JSON must contain an object");
  }

  return parsed as ReplayLog;
};
