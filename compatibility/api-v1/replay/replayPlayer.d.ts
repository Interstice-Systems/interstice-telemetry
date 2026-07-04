import type { ReplayClock } from "../clock/replayClock.js";
import type { TelemetryEvent, TelemetryEventHandler } from "../events/eventTypes.js";
import type { ReplayLog } from "./replayLog.js";
export type ReplayPlayerStatus = "running" | "stopped";
export declare class ReplayPlayer {
    private readonly clock?;
    private readonly events;
    private readonly handlers;
    private status;
    private currentIndex;
    constructor(log: ReplayLog, clock?: ReplayClock | undefined);
    start(): void;
    stop(): void;
    step(): TelemetryEvent | undefined;
    playAll(): TelemetryEvent[];
    subscribe(handler: TelemetryEventHandler): () => void;
    unsubscribe(handler: TelemetryEventHandler): void;
    getStatus(): ReplayPlayerStatus;
    getCurrentIndex(): number;
}
