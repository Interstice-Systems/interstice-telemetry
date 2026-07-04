import { type JsonValue } from "./deterministicJson.js";
export declare const REPLAY_EVENT_VERSION = "1.0.0";
export declare const STANDARD_REPLAY_EVENT_TYPES: readonly ["mission.started", "mission.completed", "collision", "gps.loss", "sensor.failure", "motor.saturation", "operator.override", "battery.warning", "safety.stop"];
export type StandardReplayEventType = (typeof STANDARD_REPLAY_EVENT_TYPES)[number];
export interface ReplayEvent {
    readonly schemaVersion: string;
    readonly id: string;
    readonly robotId: string;
    readonly timestamp: number;
    readonly sequence: number;
    /** Standard values are listed in `STANDARD_REPLAY_EVENT_TYPES`; extensions are allowed. */
    readonly type: string;
    readonly label?: string;
    readonly metadata: Readonly<Record<string, JsonValue>>;
}
export type ReplayEventInput = Omit<ReplayEvent, "schemaVersion"> & {
    readonly schemaVersion?: string;
};
export declare const createReplayEvent: (input: ReplayEventInput) => ReplayEvent;
export declare const compareReplayEvents: (left: ReplayEvent, right: ReplayEvent) => number;
export declare const serializeReplayEvents: (events: readonly ReplayEvent[], pretty?: boolean) => string;
export declare const deserializeReplayEvents: (json: string) => readonly ReplayEvent[];
