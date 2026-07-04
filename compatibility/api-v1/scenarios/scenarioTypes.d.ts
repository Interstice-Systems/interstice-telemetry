import type { TelemetryEvent } from "../events/eventTypes.js";
import type { Fault } from "../faults/faultTypes.js";
import type { ReplayLog } from "../replay/replayLog.js";
import type { ReplayValidationResult } from "../replay/replayValidator.js";
import type { RobotState, TelemetrySnapshot } from "../types.js";
export interface ScheduledFault {
    atMs: number;
    fault: Fault;
}
export interface ScenarioProfile {
    id: string;
    name: string;
    description: string;
    seed?: number | string;
    robotId?: string;
    initialState?: RobotState;
    durationMs: number;
    stepMs: number;
    faults?: ScheduledFault[];
    metadata?: Record<string, unknown>;
}
export interface ScenarioValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export interface ScenarioRunSummary {
    durationMs: number;
    stepCount: number;
    eventCount: number;
    faultCount: number;
    finalState: RobotState;
}
export interface ScenarioRunResult {
    scenario: ScenarioProfile;
    finalSnapshot: TelemetrySnapshot;
    events: TelemetryEvent[];
    replayLog: ReplayLog;
    scenarioValidation: ScenarioValidationResult;
    replayValidation: ReplayValidationResult;
    summary: ScenarioRunSummary;
}
