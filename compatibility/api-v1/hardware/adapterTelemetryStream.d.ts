import type { DeterministicClock } from "../clock/clockTypes.js";
import type { TelemetrySnapshot } from "../types.js";
import { type AdapterTelemetryCollectorOptions, type TelemetryCollectionTimestamp } from "./adapterTelemetryCollector.js";
import type { AdapterTelemetryEventHandler } from "./adapterEventTypes.js";
export type AdapterTelemetryStreamStatus = "running" | "stopped";
export interface AdapterTelemetryStreamOptions extends AdapterTelemetryCollectorOptions {
    startTime?: TelemetryCollectionTimestamp;
    emitReadingChanges?: boolean;
    clock?: DeterministicClock;
}
export declare class AdapterTelemetryStream {
    private readonly collector;
    private readonly adapters;
    private readonly emitReadingChanges;
    private readonly clock;
    private readonly handlers;
    private status;
    private sequence;
    private timestamp;
    private observations;
    constructor(options: AdapterTelemetryStreamOptions);
    start(): void;
    stop(): void;
    step(deltaMs: number): TelemetrySnapshot | undefined;
    subscribe(handler: AdapterTelemetryEventHandler): () => void;
    unsubscribe(handler: AdapterTelemetryEventHandler): void;
    getStatus(): AdapterTelemetryStreamStatus;
    getSequence(): number;
    private observeAdapters;
    private emit;
}
