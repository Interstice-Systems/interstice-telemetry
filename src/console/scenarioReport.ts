import type { ScenarioRunResult } from "../scenarios/scenarioTypes.js";
import type { ConsoleReport } from "./consoleTypes.js";
import {
  formatRobotState,
  formatTimestampMs,
} from "./formatters.js";

export const renderScenarioReport = (
  result: ScenarioRunResult,
): ConsoleReport =>
  [
    "INTERSTICE TELEMETRY — SCENARIO REPORT",
    `Scenario: ${result.scenario.name}`,
    `Robot: ${result.finalSnapshot.robotId}`,
    `Duration: ${formatTimestampMs(result.summary.durationMs)}`,
    `Steps: ${result.summary.stepCount}`,
    `Events: ${result.summary.eventCount}`,
    `Faults: ${result.summary.faultCount}`,
    `Final State: ${formatRobotState(result.summary.finalState)}`,
    `Replay Valid: ${result.replayValidation.valid ? "yes" : "no"}`,
  ].join("\n");
