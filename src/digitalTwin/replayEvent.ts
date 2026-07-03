import {
  deterministicStringify,
  parseImmutableJson,
  toImmutableJson,
  type JsonValue,
} from "./deterministicJson.js";

export const REPLAY_EVENT_VERSION = "1.0.0";

export const STANDARD_REPLAY_EVENT_TYPES = [
  "mission.started",
  "mission.completed",
  "collision",
  "gps.loss",
  "sensor.failure",
  "motor.saturation",
  "operator.override",
  "battery.warning",
  "safety.stop",
] as const;

export type StandardReplayEventType =
  (typeof STANDARD_REPLAY_EVENT_TYPES)[number];

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

export const createReplayEvent = (input: ReplayEventInput): ReplayEvent => {
  if (
    !Number.isSafeInteger(input.timestamp) ||
    input.timestamp < 0 ||
    !Number.isSafeInteger(input.sequence) ||
    input.sequence < 0
  ) {
    throw new TypeError("replay event timestamp and sequence must be non-negative safe integers");
  }
  if (input.id.length === 0 || input.robotId.length === 0 || input.type.length === 0) {
    throw new TypeError("replay event id, robotId, and type must not be empty");
  }
  return toImmutableJson(
    {
      ...input,
      schemaVersion: input.schemaVersion ?? REPLAY_EVENT_VERSION,
    },
    "replayEvent",
  );
};

export const compareReplayEvents = (
  left: ReplayEvent,
  right: ReplayEvent,
): number =>
  left.timestamp - right.timestamp ||
  left.sequence - right.sequence ||
  (left.id < right.id ? -1 : left.id > right.id ? 1 : 0);

export const serializeReplayEvents = (
  events: readonly ReplayEvent[],
  pretty = false,
): string =>
  deterministicStringify([...events].sort(compareReplayEvents), pretty);

export const deserializeReplayEvents = (json: string): readonly ReplayEvent[] => {
  const inputs = parseImmutableJson<readonly ReplayEventInput[]>(json, "replayEvents");
  if (!Array.isArray(inputs)) {
    throw new TypeError("replay events JSON must contain an array");
  }
  return Object.freeze(inputs.map(createReplayEvent).sort(compareReplayEvents));
};
