import type { ReplayLog } from "../replay/replayLog.js";
import type { ScenarioProfile, ScenarioRunResult } from "../scenarios/scenarioTypes.js";
import type { RobotState } from "../types.js";
export interface FleetRobotProfile {
    robotId: string;
    scenario: ScenarioProfile;
    metadata?: Record<string, unknown>;
}
export interface FleetScenarioProfile {
    id: string;
    name: string;
    description: string;
    robots: FleetRobotProfile[];
    durationMs: number;
    stepMs: number;
    metadata?: Record<string, unknown>;
}
export interface FleetValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface FleetReplayValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface FleetReplayLog {
    version: string;
    fleetId: string;
    createdAt: string;
    robotLogs: Record<string, ReplayLog>;
    eventCount: number;
    metadata?: Record<string, unknown>;
}
export interface FleetScenarioRunSummary {
    robotCount: number;
    durationMs: number;
    stepCount: number;
    totalEvents: number;
    totalFaults: number;
    finalStates: Record<string, RobotState>;
}
export interface FleetScenarioRunResult {
    scenario: FleetScenarioProfile;
    robotResults: Record<string, ScenarioRunResult>;
    fleetReplayLog: FleetReplayLog;
    fleetValidation: FleetValidationResult;
    summary: FleetScenarioRunSummary;
}
