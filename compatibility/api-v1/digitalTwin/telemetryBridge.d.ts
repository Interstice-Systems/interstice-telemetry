import type { TelemetryEvent } from "../events/eventTypes.js";
import type { ReplayLog } from "../replay/replayLog.js";
import type { TelemetrySnapshot } from "../types.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
import { type RobotState } from "./robotState.js";
import { type TwinTimeline, type TwinTimelineInput } from "./twinTimeline.js";
export type CanonicalRobotState = RobotState;
export declare const TELEMETRY_BRIDGE_SOURCES: readonly ["telemetry-snapshot", "replay-event", "adapter-reading", "custom"];
export type TelemetryBridgeSource = (typeof TELEMETRY_BRIDGE_SOURCES)[number];
export interface TelemetryBridgeContext {
    readonly robotId: string;
    readonly timestamp: number;
    readonly source: TelemetryBridgeSource;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export type TelemetryToStateMapper<TInput = unknown> = (previousState: CanonicalRobotState | undefined, input: TInput, context: TelemetryBridgeContext) => CanonicalRobotState;
export interface TelemetryBridgeMapOptions {
    readonly previousState?: CanonicalRobotState;
    readonly contextMetadata?: Readonly<Record<string, unknown>>;
}
export interface TelemetryBridgeBuildOptions extends Omit<TwinTimelineInput, "robotId" | "states"> {
    readonly contextMetadata?: Readonly<Record<string, unknown>>;
    readonly provenance?: EvidenceProvenance;
}
export declare const defaultTelemetrySnapshotMapper: TelemetryToStateMapper<TelemetrySnapshot>;
export declare const defaultReplayEventMapper: TelemetryToStateMapper<TelemetryEvent>;
export declare const mapTelemetrySnapshotToState: (snapshot: TelemetrySnapshot, mapper?: TelemetryToStateMapper<TelemetrySnapshot>, options?: TelemetryBridgeMapOptions) => CanonicalRobotState;
export declare const mapReplayEventToState: (event: TelemetryEvent, mapper?: TelemetryToStateMapper<TelemetryEvent>, options?: TelemetryBridgeMapOptions) => CanonicalRobotState;
export declare const buildTwinTimelineFromTelemetry: (robotId: string, snapshots: readonly TelemetrySnapshot[], mapper?: TelemetryToStateMapper<TelemetrySnapshot>, options?: TelemetryBridgeBuildOptions) => TwinTimeline;
export declare function buildTwinTimelineFromReplay(replayLog: ReplayLog, mapper?: TelemetryToStateMapper<TelemetryEvent>, options?: TelemetryBridgeBuildOptions): TwinTimeline;
export declare function buildTwinTimelineFromReplay(robotId: string, events: readonly TelemetryEvent[], mapper?: TelemetryToStateMapper<TelemetryEvent>, options?: TelemetryBridgeBuildOptions): TwinTimeline;
