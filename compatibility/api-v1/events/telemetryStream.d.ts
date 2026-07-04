import type { DeterministicClock } from "../clock/clockTypes.js";
import type { Fault } from "../faults/faultTypes.js";
import type { RobotSimulator } from "../simulator/robotSimulator.js";
import type { TelemetrySnapshot } from "../types.js";
import type { TelemetryEventHandler } from "./eventTypes.js";
export type TelemetryStreamStatus = "running" | "stopped";
export declare class TelemetryStream {
    private readonly simulator;
    private readonly clock?;
    private readonly handlers;
    private status;
    private sequence;
    private lastObservedState;
    constructor(simulator: RobotSimulator, clock?: DeterministicClock | undefined);
    start(): void;
    stop(): void;
    step(deltaMs: number): TelemetrySnapshot | undefined;
    injectFault(fault: Fault): void;
    subscribe(handler: TelemetryEventHandler): () => void;
    unsubscribe(handler: TelemetryEventHandler): void;
    getStatus(): TelemetryStreamStatus;
    private emit;
}
