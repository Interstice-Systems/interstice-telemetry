import type { TelemetryEventType } from "../events/eventTypes.js";
import type { ReplayLog } from "../replay/replayLog.js";
import { validateReplayLog } from "../replay/replayValidator.js";
import type { ConsoleReport } from "./consoleTypes.js";

const EVENT_TYPE_ORDER: readonly TelemetryEventType[] = [
  "stream.started",
  "telemetry.snapshot",
  "fault.injected",
  "state.changed",
  "stream.stopped",
  "adapter.stream.started",
  "adapter.status.changed",
  "adapter.reading.changed",
  "adapter.telemetry.snapshot",
  "adapter.stream.stopped",
];

export const renderReplayReport = (log: ReplayLog): ConsoleReport => {
  const validation = validateReplayLog(log);
  const counts = new Map<TelemetryEventType, number>();

  for (const event of log.events) {
    counts.set(event.type, (counts.get(event.type) ?? 0) + 1);
  }

  const firstSequence = log.events[0]?.sequence;
  const lastSequence = log.events.at(-1)?.sequence;

  return [
    "REPLAY REPORT",
    `Robot: ${log.robotId}`,
    `Version: ${log.version}`,
    `Events: ${log.eventCount}`,
    `Validation: ${validation.valid ? "valid" : "invalid"}`,
    `First Sequence: ${firstSequence ?? "none"}`,
    `Last Sequence: ${lastSequence ?? "none"}`,
    "Event Types:",
    ...EVENT_TYPE_ORDER.filter((type) => counts.has(type)).map(
      (type) => `  ${type}: ${counts.get(type)}`,
    ),
  ].join("\n");
};
