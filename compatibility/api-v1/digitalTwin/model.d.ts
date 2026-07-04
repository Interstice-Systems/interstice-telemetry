import { type JsonValue } from "./deterministicJson.js";
export declare const DIGITAL_TWIN_MODEL_VERSION = "1.0.0";
export interface Vector3 {
    readonly x: number;
    readonly y: number;
    readonly z: number;
}
export interface Quaternion {
    readonly x: number;
    readonly y: number;
    readonly z: number;
    readonly w: number;
}
export interface Transform {
    readonly translation: Vector3;
    readonly rotation: Quaternion;
}
export interface RobotMetadata {
    readonly name: string;
    readonly manufacturer?: string;
    readonly model?: string;
    readonly serialNumber?: string;
    readonly description?: string;
    readonly tags?: readonly string[];
    readonly properties?: Readonly<Record<string, JsonValue>>;
}
export interface CoordinateFrame {
    readonly id: string;
    readonly name: string;
    readonly parentFrameId?: string;
    readonly transformToParent: Transform;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface Link {
    readonly id: string;
    readonly name: string;
    readonly frameId: string;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export declare const STANDARD_JOINT_TYPES: readonly ["fixed", "revolute", "continuous", "prismatic", "planar", "floating", "spherical"];
export type StandardJointType = (typeof STANDARD_JOINT_TYPES)[number];
export interface JointLimit {
    readonly lower?: number;
    readonly upper?: number;
    readonly velocity?: number;
    readonly effort?: number;
}
export interface Joint {
    readonly id: string;
    readonly name: string;
    /** Standard values are listed in `STANDARD_JOINT_TYPES`; extensions are allowed. */
    readonly type: string;
    readonly parentLinkId: string;
    readonly childLinkId: string;
    readonly origin: Transform;
    readonly axis?: Vector3;
    readonly limit?: JointLimit;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface Sensor {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly frameId: string;
    readonly updateRateHz?: number;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface Actuator {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly jointIds: readonly string[];
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface Attachment {
    readonly id: string;
    readonly name: string;
    readonly type: string;
    readonly parentLinkId: string;
    readonly frameId: string;
    readonly metadata?: Readonly<Record<string, JsonValue>>;
}
export interface Robot {
    readonly schemaVersion: string;
    readonly id: string;
    readonly rootFrameId: string;
    readonly metadata: RobotMetadata;
    readonly frames: readonly CoordinateFrame[];
    readonly links: readonly Link[];
    readonly joints: readonly Joint[];
    readonly sensors: readonly Sensor[];
    readonly actuators: readonly Actuator[];
    readonly attachments: readonly Attachment[];
}
export type RobotInput = Omit<Robot, "schemaVersion"> & {
    readonly schemaVersion?: string;
};
export declare const createRobot: (input: RobotInput) => Robot;
export declare const serializeRobot: (robot: Robot, pretty?: boolean) => string;
export declare const deserializeRobot: (json: string) => Robot;
