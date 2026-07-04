import type { ReplayLog } from "../replay/replayLog.js";
import type { FleetReplayLog, FleetReplayValidationResult } from "./fleetTypes.js";
export declare const FLEET_REPLAY_LOG_VERSION = "0.7.0";
export declare const createFleetReplayLog: (fleetId: string, robotLogs: Record<string, ReplayLog>, metadata?: Record<string, unknown>, createdAt?: Date | string | number) => FleetReplayLog;
export declare const validateFleetReplayLog: (log: unknown) => FleetReplayValidationResult;
export declare const serializeFleetReplayLog: (log: FleetReplayLog) => string;
export declare const deserializeFleetReplayLog: (json: string) => FleetReplayLog;
