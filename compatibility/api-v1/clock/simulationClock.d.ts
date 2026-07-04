import { type ClockInfo, type ClockOptions, type DeterministicClock } from "./clockTypes.js";
export type SimulationClockOptions = ClockOptions;
export declare class SimulationClock implements DeterministicClock {
    private readonly id;
    private readonly initialTimeMs;
    private readonly metadata;
    private currentTimeMs;
    private stepCount;
    constructor(options?: SimulationClockOptions);
    now(): number;
    step(deltaMs: number): number;
    reset(): void;
    getInfo(): ClockInfo;
}
