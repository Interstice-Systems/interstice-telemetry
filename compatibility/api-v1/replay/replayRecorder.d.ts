import type { TelemetryEvent } from "../events/eventTypes.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
import { type ReplayLog } from "./replayLog.js";
export type ReplayRecorderStatus = "active" | "inactive";
export interface ReplayRecorderOptions {
    robotId?: string;
    version?: string;
    createdAt?: Date | string | number;
    seed?: number | string;
    provenance?: EvidenceProvenance;
}
export declare class ReplayRecorder {
    private readonly events;
    private readonly options;
    private status;
    constructor(options?: ReplayRecorderOptions);
    start(): void;
    stop(): void;
    record: (event: TelemetryEvent) => void;
    clear(): void;
    toLog(metadata?: Record<string, unknown>): ReplayLog;
    getEvents(): TelemetryEvent[];
    getStatus(): ReplayRecorderStatus;
}
