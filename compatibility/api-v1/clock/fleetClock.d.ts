import { type ClockInfo, type ClockOptions, type DeterministicClock } from "./clockTypes.js";
export type FleetClockOptions = ClockOptions;
export declare class FleetClock implements DeterministicClock {
    private readonly id;
    private readonly initialTimeMs;
    private readonly metadata;
    private currentTimeMs;
    private stepCount;
    constructor(options?: FleetClockOptions);
    now(): number;
    step(deltaMs: number): number;
    reset(): void;
    getInfo(): ClockInfo;
}
