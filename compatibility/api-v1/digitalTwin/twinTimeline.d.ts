import { type JsonValue } from "./deterministicJson.js";
import { type ReplayEvent } from "./replayEvent.js";
import { type RobotState, type RobotStateInput } from "./robotState.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
export declare const TWIN_TIMELINE_VERSION = "1.0.0";
export declare const TWIN_REPLAY_CURSOR_STATE_VERSION = "1.0.0";
export interface TwinTimeline {
    readonly schemaVersion: string;
    readonly robotId: string;
    readonly clockDomain: string;
    readonly states: readonly RobotState[];
    readonly events: readonly ReplayEvent[];
    readonly metadata: Readonly<Record<string, JsonValue>>;
    readonly provenance?: EvidenceProvenance;
}
export interface TwinTimelineInput {
    readonly schemaVersion?: string;
    readonly robotId: string;
    readonly clockDomain?: string;
    readonly states: readonly RobotState[];
    readonly events?: readonly ReplayEvent[];
    readonly metadata?: Readonly<Record<string, JsonValue>>;
    readonly provenance?: EvidenceProvenance;
}
export interface TwinReplayCursorState {
    readonly schemaVersion: string;
    readonly robotId: string;
    readonly index: number;
}
export interface TwinTelemetryRecord<TPayload = JsonValue> {
    readonly id: string;
    readonly robotId: string;
    readonly timestamp: number;
    readonly sequence: number;
    readonly payload: TPayload;
}
export type RobotStateReconstructor<TPayload> = (previous: RobotState | undefined, record: TwinTelemetryRecord<TPayload>) => RobotStateInput;
export declare const createTwinTimeline: (input: TwinTimelineInput) => TwinTimeline;
/**
 * Deterministically folds telemetry records into complete robot states.
 *
 * Input order is deliberately ignored. Records are ordered by timestamp,
 * sequence, then id before the caller-supplied pure reconstruction function
 * is invoked.
 */
export declare const reconstructTwinTimeline: <TPayload>(robotId: string, records: readonly TwinTelemetryRecord<TPayload>[], reconstruct: RobotStateReconstructor<TPayload>, options?: Omit<TwinTimelineInput, "robotId" | "states">) => TwinTimeline;
export declare const serializeTwinTimeline: (timeline: TwinTimeline, pretty?: boolean) => string;
export declare const deserializeTwinTimeline: (json: string) => TwinTimeline;
export declare class TwinReplayCursor {
    private readonly timeline;
    private index;
    constructor(timeline: TwinTimeline);
    reset(): void;
    next(): RobotState | undefined;
    current(): RobotState | undefined;
    seek(timestamp: number): RobotState | undefined;
    eventsThrough(timestamp: number): readonly ReplayEvent[];
    getIndex(): number;
    getState(): TwinReplayCursorState;
    restore(state: TwinReplayCursorState): void;
}
