import type { ConsoleReport } from "../console/consoleTypes.js";
import type { FleetReplayLog, FleetScenarioRunResult } from "./fleetTypes.js";
export declare const renderFleetScenarioReport: (result: FleetScenarioRunResult) => ConsoleReport;
export declare const renderFleetReplayReport: (log: FleetReplayLog) => ConsoleReport;
