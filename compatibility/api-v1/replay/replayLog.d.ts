import type { TelemetryEvent } from "../events/eventTypes.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
export declare const REPLAY_LOG_VERSION = "0.3.0";
export interface ReplayLog {
    version: string;
    robotId: string;
    createdAt: string;
    seed?: number | string;
    eventCount: number;
    events: TelemetryEvent[];
    metadata?: Record<string, unknown>;
    provenance?: EvidenceProvenance;
}
export declare const serializeReplayLog: (log: ReplayLog) => string;
export declare const deserializeReplayLog: (json: string) => ReplayLog;
