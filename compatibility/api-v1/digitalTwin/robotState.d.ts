import { type JsonValue } from "./deterministicJson.js";
import type { Quaternion, Vector3 } from "./model.js";
export declare const ROBOT_STATE_VERSION = "1.0.0";
export declare const ROBOT_OPERATING_MODES: readonly ["idle", "active", "returning", "charging", "faulted", "offline"];
export type CanonicalRobotOperatingMode = (typeof ROBOT_OPERATING_MODES)[number];
export interface Pose {
    readonly frameId: string;
    readonly position: Vector3;
    readonly orientation: Quaternion;
}
export interface JointState {
    readonly position: number;
    readonly velocity?: number;
    readonly effort?: number;
}
export interface BatteryStatus {
    /** Charge remaining on a closed interval from 0 to 1. */
    readonly charge: number;
    readonly voltage?: number;
    readonly current?: number;
    readonly temperature?: number;
    readonly state?: string;
}
export interface HealthIndicator {
    readonly id: string;
    readonly level: "nominal" | "info" | "warning" | "error" | "critical";
    readonly message?: string;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface RobotState {
    readonly schemaVersion: string;
    /** Integer milliseconds in the timeline's declared clock domain. */
    readonly timestamp: number;
    readonly robotId: string;
    readonly operatingMode?: CanonicalRobotOperatingMode;
    readonly globalPose: Pose;
    readonly linearVelocity: Vector3;
    readonly angularVelocity: Vector3;
    readonly jointStates: Readonly<Record<string, JointState>>;
    readonly actuatorOutputs: Readonly<Record<string, JsonValue>>;
    readonly sensorValues: Readonly<Record<string, JsonValue>>;
    readonly batteryStatus?: BatteryStatus;
    readonly healthIndicators: readonly HealthIndicator[];
    readonly metadata: Readonly<Record<string, JsonValue>>;
}
export type RobotStateInput = Omit<RobotState, "schemaVersion"> & {
    readonly schemaVersion?: string;
};
export declare const createRobotState: (input: RobotStateInput) => RobotState;
export declare const serializeRobotState: (state: RobotState, pretty?: boolean) => string;
export declare const deserializeRobotState: (json: string) => RobotState;
export declare const robotStatesEqual: (left: RobotState, right: RobotState) => boolean;
