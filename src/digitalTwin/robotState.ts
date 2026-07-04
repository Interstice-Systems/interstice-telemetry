import {
  deterministicEqual,
  deterministicStringify,
  parseImmutableJson,
  toImmutableJson,
  type JsonValue,
} from "./deterministicJson.js";
import type {
  Quaternion,
  Vector3,
} from "./model.js";

export const ROBOT_STATE_VERSION = "1.0.0";
export const ROBOT_OPERATING_MODES = [
  "idle",
  "active",
  "returning",
  "charging",
  "faulted",
  "offline",
] as const;

export type CanonicalRobotOperatingMode =
  (typeof ROBOT_OPERATING_MODES)[number];

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

const assertFiniteTimestamp = (timestamp: number): void => {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new TypeError("robot state timestamp must be a non-negative safe integer");
  }
};

export const createRobotState = (input: RobotStateInput): RobotState => {
  assertFiniteTimestamp(input.timestamp);
  if (input.robotId.length === 0) {
    throw new TypeError("robot state robotId must not be empty");
  }
  if (
    input.batteryStatus !== undefined &&
    (input.batteryStatus.charge < 0 || input.batteryStatus.charge > 1)
  ) {
    throw new TypeError("battery charge must be between 0 and 1");
  }

  return toImmutableJson(
    {
      ...input,
      schemaVersion: input.schemaVersion ?? ROBOT_STATE_VERSION,
    },
    "robotState",
  );
};

export const serializeRobotState = (
  state: RobotState,
  pretty = false,
): string => deterministicStringify(state, pretty);

export const deserializeRobotState = (json: string): RobotState => {
  const parsed = parseImmutableJson<RobotStateInput>(json, "robotState");
  return createRobotState(parsed);
};

export const robotStatesEqual = (
  left: RobotState,
  right: RobotState,
): boolean => deterministicEqual(left, right);
