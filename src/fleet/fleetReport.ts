import type { ConsoleReport } from "../console/consoleTypes.js";
import { formatTimestampMs } from "../console/formatters.js";
import type {
  FleetReplayLog,
  FleetScenarioRunResult,
} from "./fleetTypes.js";
import { validateFleetReplayLog } from "./fleetReplay.js";

const sortedRobotIds = (record: Record<string, unknown>): string[] =>
  Object.keys(record).sort((left, right) =>
    left < right ? -1 : left > right ? 1 : 0,
  );

export const renderFleetScenarioReport = (
  result: FleetScenarioRunResult,
): ConsoleReport => {
  const robotIds = sortedRobotIds(result.robotResults);

  return [
    "INTERSTICE TELEMETRY — FLEET REPORT",
    `Scenario: ${result.scenario.name}`,
    `Robots: ${result.summary.robotCount}`,
    `Duration: ${formatTimestampMs(result.summary.durationMs)}`,
    `Steps: ${result.summary.stepCount}`,
    `Total Events: ${result.summary.totalEvents}`,
    `Total Faults: ${result.summary.totalFaults}`,
    "",
    "FINAL STATES",
    ...robotIds.map(
      (robotId) => `${robotId}: ${result.summary.finalStates[robotId]}`,
    ),
    "",
    "EVENTS BY ROBOT",
    ...robotIds.map(
      (robotId) =>
        `${robotId}: ${result.robotResults[robotId]!.summary.eventCount}`,
    ),
  ].join("\n");
};

export const renderFleetReplayReport = (
  log: FleetReplayLog,
): ConsoleReport => {
  const validation = validateFleetReplayLog(log);
  const robotIds = sortedRobotIds(log.robotLogs);

  return [
    "INTERSTICE TELEMETRY — FLEET REPLAY REPORT",
    `Fleet: ${log.fleetId}`,
    `Version: ${log.version}`,
    `Robots: ${robotIds.length}`,
    `Total Events: ${log.eventCount}`,
    `Validation: ${validation.valid ? "valid" : "invalid"}`,
    "",
    "EVENTS BY ROBOT",
    ...robotIds.map(
      (robotId) => `${robotId}: ${log.robotLogs[robotId]!.eventCount}`,
    ),
  ].join("\n");
};
