import {
  deterministicStringify,
  parseImmutableJson,
  toImmutableJson,
  type JsonValue,
} from "./deterministicJson.js";

export const DIGITAL_TWIN_MODEL_VERSION = "1.0.0";

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

export const STANDARD_JOINT_TYPES = [
  "fixed",
  "revolute",
  "continuous",
  "prismatic",
  "planar",
  "floating",
  "spherical",
] as const;

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

const requireUniqueIds = (
  values: readonly { readonly id: string }[],
  field: string,
): void => {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new TypeError(`${field} contains duplicate id "${value.id}"`);
    }
    ids.add(value.id);
  }
};

const requireReference = (
  ids: ReadonlySet<string>,
  value: string,
  field: string,
): void => {
  if (!ids.has(value)) {
    throw new TypeError(`${field} references unknown id "${value}"`);
  }
};

export const createRobot = (input: RobotInput): Robot => {
  if (input.id.length === 0) {
    throw new TypeError("robot id must not be empty");
  }

  requireUniqueIds(input.frames, "frames");
  requireUniqueIds(input.links, "links");
  requireUniqueIds(input.joints, "joints");
  requireUniqueIds(input.sensors, "sensors");
  requireUniqueIds(input.actuators, "actuators");
  requireUniqueIds(input.attachments, "attachments");

  if (!input.frames.some((frame) => frame.id === input.rootFrameId)) {
    throw new TypeError("rootFrameId must reference a coordinate frame");
  }

  const frameIds = new Set(input.frames.map((frame) => frame.id));
  const linkIds = new Set(input.links.map((link) => link.id));
  const jointIds = new Set(input.joints.map((joint) => joint.id));

  for (const frame of input.frames) {
    if (frame.parentFrameId !== undefined) {
      requireReference(frameIds, frame.parentFrameId, `frame "${frame.id}".parentFrameId`);
    }
  }
  for (const link of input.links) {
    requireReference(frameIds, link.frameId, `link "${link.id}".frameId`);
  }
  for (const joint of input.joints) {
    requireReference(linkIds, joint.parentLinkId, `joint "${joint.id}".parentLinkId`);
    requireReference(linkIds, joint.childLinkId, `joint "${joint.id}".childLinkId`);
  }
  for (const sensor of input.sensors) {
    requireReference(frameIds, sensor.frameId, `sensor "${sensor.id}".frameId`);
  }
  for (const actuator of input.actuators) {
    for (const jointId of actuator.jointIds) {
      requireReference(jointIds, jointId, `actuator "${actuator.id}".jointIds`);
    }
  }
  for (const attachment of input.attachments) {
    requireReference(linkIds, attachment.parentLinkId, `attachment "${attachment.id}".parentLinkId`);
    requireReference(frameIds, attachment.frameId, `attachment "${attachment.id}".frameId`);
  }

  return toImmutableJson(
    {
      ...input,
      schemaVersion: input.schemaVersion ?? DIGITAL_TWIN_MODEL_VERSION,
    },
    "robot",
  );
};

export const serializeRobot = (robot: Robot, pretty = false): string =>
  deterministicStringify(robot, pretty);

export const deserializeRobot = (json: string): Robot =>
  createRobot(parseImmutableJson<RobotInput>(json, "robot"));
