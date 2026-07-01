import type { TelemetryEvent } from "../events/eventTypes.js";
import type {
  ConsoleReport,
  EventTimelineOptions,
} from "./consoleTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const summarizePayload = (event: TelemetryEvent): string | undefined => {
  if (!isRecord(event.payload)) {
    return undefined;
  }

  if (event.type === "fault.injected" && isRecord(event.payload.fault)) {
    const type = event.payload.fault.type;
    return typeof type === "string"
      ? `fault=${type.replaceAll("_", " ")}`
      : undefined;
  }

  if (event.type === "state.changed") {
    const previous = event.payload.previousState;
    const current = event.payload.currentState;
    return typeof previous === "string" && typeof current === "string"
      ? `${previous} -> ${current}`
      : undefined;
  }

  if (
    (event.type === "telemetry.snapshot" ||
      event.type === "adapter.telemetry.snapshot") &&
    isRecord(event.payload.snapshot) &&
    typeof event.payload.snapshot.state === "string"
  ) {
    return `state=${event.payload.snapshot.state}`;
  }

  if (event.type === "adapter.status.changed") {
    const adapter = event.payload.adapter;
    const adapterId = event.payload.adapterId;
    const previous = event.payload.previousStatus;
    const current = event.payload.currentStatus;
    const id =
      typeof adapterId === "string"
        ? adapterId
        : isRecord(adapter) && typeof adapter.id === "string"
          ? adapter.id
          : undefined;
    return id !== undefined &&
      typeof previous === "string" &&
      typeof current === "string"
      ? `${id}: ${previous} -> ${current}`
      : undefined;
  }

  if (event.type === "adapter.reading.changed") {
    const adapter = event.payload.adapter;
    const adapterId = event.payload.adapterId;
    const id =
      typeof adapterId === "string"
        ? adapterId
        : isRecord(adapter) && typeof adapter.id === "string"
          ? adapter.id
          : undefined;
    return id === undefined ? undefined : `adapter=${id}`;
  }

  const status = event.payload.status;
  return typeof status === "string" ? `status=${status}` : undefined;
};

const validateLimit = (limit: number | undefined): number | undefined => {
  if (limit === undefined) {
    return undefined;
  }

  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError("event timeline limit must be a non-negative integer");
  }

  return limit;
};

export const renderEventTimeline = (
  events: TelemetryEvent[],
  options: EventTimelineOptions = {},
): ConsoleReport => {
  const limit = validateLimit(options.limit);
  const visibleEvents =
    limit === undefined ? events : events.slice(0, limit);
  const lines = visibleEvents.map((event) => {
    const sequence = `#${event.sequence}`.padEnd(5);
    const type = event.type.padEnd(28);
    const timestamp = `t=${event.timestamp}`.padEnd(18);
    const base = `${sequence}${type}${timestamp}robot=${event.robotId}`;
    const summary = options.includePayloadSummary
      ? summarizePayload(event)
      : undefined;
    return summary === undefined ? base : `${base}  ${summary}`;
  });

  return [
    "EVENT TIMELINE",
    ...(lines.length === 0 ? ["(no events)"] : lines),
  ].join("\n");
};
