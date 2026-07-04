import { type ClockInfo, type ClockOptions, type DeterministicClock } from "./clockTypes.js";
export interface LogicalClockOptions extends ClockOptions {
    tickSizeMs?: number;
}
export declare class LogicalClock implements DeterministicClock {
    private readonly id;
    private readonly initialTimeMs;
    private readonly tickSizeMs;
    private readonly metadata;
    private currentTimeMs;
    private stepCount;
    constructor(options?: LogicalClockOptions);
    now(): number;
    tick(): number;
    step(deltaMs: number): number;
    reset(): void;
    getInfo(): ClockInfo;
}
