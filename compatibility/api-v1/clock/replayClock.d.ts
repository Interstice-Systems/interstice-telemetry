import type { TelemetryEvent } from "../events/eventTypes.js";
import { type ClockInfo, type DeterministicClock } from "./clockTypes.js";
export interface ReplayClockOptions {
    id?: string;
    metadata?: Record<string, unknown>;
}
export declare class ReplayClock implements DeterministicClock {
    private readonly id;
    private readonly timestamps;
    private readonly initialTimeMs;
    private readonly metadata;
    private currentTimeMs;
    private eventIndex;
    private stepCount;
    constructor(events: readonly Pick<TelemetryEvent, "timestamp">[], options?: ReplayClockOptions);
    now(): number;
    step(deltaMs: number): number;
    advanceToNextEvent(): number;
    reset(): void;
    getInfo(): ClockInfo;
}
