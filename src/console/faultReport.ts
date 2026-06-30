import type { TelemetryEvent } from "../events/eventTypes.js";
import type { ConsoleReport } from "./consoleTypes.js";

const getFaultType = (payload: unknown): string => {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("fault" in payload) ||
    typeof payload.fault !== "object" ||
    payload.fault === null ||
    !("type" in payload.fault) ||
    typeof payload.fault.type !== "string"
  ) {
    return "unknown fault";
  }

  return payload.fault.type.replaceAll("_", " ");
};

export const renderFaultReport = (
  events: TelemetryEvent[],
): ConsoleReport => {
  const faultEvents = events.filter(
    (event) => event.type === "fault.injected",
  );

  if (faultEvents.length === 0) {
    return ["FAULT SUMMARY", "Total Fault Events: 0", "No faults recorded."].join(
      "\n",
    );
  }

  return [
    "FAULT SUMMARY",
    `Total Fault Events: ${faultEvents.length}`,
    ...faultEvents.map(
      (event) =>
        `- ${getFaultType(event.payload)} at sequence #${event.sequence}, timestamp ${event.timestamp}`,
    ),
  ].join("\n");
};
