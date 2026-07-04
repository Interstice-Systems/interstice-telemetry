import { type JsonValue } from "./deterministicJson.js";
import type { RobotState } from "./robotState.js";
import { type TwinDiagnosticReport } from "./twinDiagnostics.js";
import type { TwinTimeline } from "./twinTimeline.js";
export declare const MULTI_ROBOT_TWIN_VIEW_VERSION = "1.0.0";
export interface MultiRobotTwinViewSummary {
    readonly robotCount: number;
    readonly firstTimestamp: number | null;
    readonly lastTimestamp: number | null;
    readonly totalRecords: number;
}
export interface MultiRobotTwinView {
    readonly version: string;
    readonly viewId: string;
    readonly createdAt: string;
    readonly robotIds: readonly string[];
    readonly timelines: Readonly<Record<string, TwinTimeline>>;
    readonly summary: MultiRobotTwinViewSummary;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface MultiRobotTwinViewOptions {
    readonly version?: string;
    readonly viewId?: string;
    readonly createdAt?: string | number | Date;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export declare const createMultiRobotTwinView: (timelines: readonly TwinTimeline[], options?: MultiRobotTwinViewOptions) => MultiRobotTwinView;
export declare const summarizeMultiRobotTwinView: (view: MultiRobotTwinView) => MultiRobotTwinViewSummary;
export declare const getRobotTwinTimeline: (view: MultiRobotTwinView, robotId: string) => TwinTimeline | undefined;
export declare const getTwinStatesAtTime: (view: MultiRobotTwinView, timestamp: number) => Readonly<Record<string, RobotState>>;
export declare const validateMultiRobotTwinView: (view: MultiRobotTwinView | unknown) => TwinDiagnosticReport;
