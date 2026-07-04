import {
  deterministicStringify,
  parseImmutableJson,
  toImmutableJson,
  type JsonValue,
} from "./deterministicJson.js";
import {
  compareReplayEvents,
  createReplayEvent,
  type ReplayEvent,
  type ReplayEventInput,
} from "./replayEvent.js";
import {
  createRobotState,
  type RobotState,
  type RobotStateInput,
} from "./robotState.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";

export const TWIN_TIMELINE_VERSION = "1.0.0";
export const TWIN_REPLAY_CURSOR_STATE_VERSION = "1.0.0";

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

export type RobotStateReconstructor<TPayload> = (
  previous: RobotState | undefined,
  record: TwinTelemetryRecord<TPayload>,
) => RobotStateInput;

const compareStrings = (left: string, right: string): number =>
  left < right ? -1 : left > right ? 1 : 0;

const compareRecords = <TPayload>(
  left: TwinTelemetryRecord<TPayload>,
  right: TwinTelemetryRecord<TPayload>,
): number =>
  left.timestamp - right.timestamp ||
  left.sequence - right.sequence ||
  compareStrings(left.id, right.id);

const compareStates = (left: RobotState, right: RobotState): number =>
  left.timestamp - right.timestamp;

export const createTwinTimeline = (input: TwinTimelineInput): TwinTimeline => {
  if (input.robotId.length === 0) {
    throw new TypeError("timeline robotId must not be empty");
  }

  const states = [...input.states].sort(compareStates);
  const events = [...(input.events ?? [])].sort(compareReplayEvents);
  if (
    states.some((state) => state.robotId !== input.robotId) ||
    events.some((event) => event.robotId !== input.robotId)
  ) {
    throw new TypeError("timeline states and events must belong to its robotId");
  }
  if (
    states.some(
      (state, index) =>
        index > 0 && states[index - 1]?.timestamp === state.timestamp,
    )
  ) {
    throw new TypeError("timeline may contain only one state per timestamp");
  }

  return toImmutableJson(
    {
      schemaVersion: input.schemaVersion ?? TWIN_TIMELINE_VERSION,
      robotId: input.robotId,
      clockDomain: input.clockDomain ?? "unix-ms",
      states,
      events,
      metadata: input.metadata ?? {},
      ...(input.provenance === undefined
        ? {}
        : { provenance: input.provenance }),
    },
    "twinTimeline",
  );
};

/**
 * Deterministically folds telemetry records into complete robot states.
 *
 * Input order is deliberately ignored. Records are ordered by timestamp,
 * sequence, then id before the caller-supplied pure reconstruction function
 * is invoked.
 */
export const reconstructTwinTimeline = <TPayload>(
  robotId: string,
  records: readonly TwinTelemetryRecord<TPayload>[],
  reconstruct: RobotStateReconstructor<TPayload>,
  options: Omit<TwinTimelineInput, "robotId" | "states"> = {},
): TwinTimeline => {
  const states: RobotState[] = [];
  let previous: RobotState | undefined;

  for (const record of [...records].sort(compareRecords)) {
    if (record.robotId !== robotId) {
      throw new TypeError("telemetry record robotId does not match timeline");
    }
    const state = createRobotState(reconstruct(previous, record));
    if (state.robotId !== robotId || state.timestamp !== record.timestamp) {
      throw new TypeError("reconstructed state must match its record robotId and timestamp");
    }
    states.push(state);
    previous = state;
  }

  return createTwinTimeline({ ...options, robotId, states });
};

export const serializeTwinTimeline = (
  timeline: TwinTimeline,
  pretty = false,
): string => deterministicStringify(timeline, pretty);

export const deserializeTwinTimeline = (json: string): TwinTimeline => {
  const input = parseImmutableJson<{
    readonly schemaVersion?: string;
    readonly robotId: string;
    readonly clockDomain?: string;
    readonly states: readonly RobotStateInput[];
    readonly events?: readonly ReplayEventInput[];
    readonly metadata?: Readonly<Record<string, JsonValue>>;
    readonly provenance?: EvidenceProvenance;
  }>(json, "twinTimeline");

  return createTwinTimeline({
    robotId: input.robotId,
    states: input.states.map(createRobotState),
    ...(input.schemaVersion === undefined
      ? {}
      : { schemaVersion: input.schemaVersion }),
    ...(input.clockDomain === undefined
      ? {}
      : { clockDomain: input.clockDomain }),
    ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
    ...(input.events === undefined
      ? {}
      : { events: input.events.map(createReplayEvent) }),
    ...(input.provenance === undefined
      ? {}
      : { provenance: input.provenance }),
  });
};

export class TwinReplayCursor {
  private index = -1;

  constructor(private readonly timeline: TwinTimeline) {}

  reset(): void {
    this.index = -1;
  }

  next(): RobotState | undefined {
    if (this.index + 1 >= this.timeline.states.length) {
      return undefined;
    }
    this.index += 1;
    return this.current();
  }

  current(): RobotState | undefined {
    return this.timeline.states[this.index];
  }

  seek(timestamp: number): RobotState | undefined {
    let low = 0;
    let high = this.timeline.states.length - 1;
    let match = -1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const state = this.timeline.states[middle];
      if (state === undefined) break;
      if (state.timestamp <= timestamp) {
        match = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    this.index = match;
    return this.current();
  }

  eventsThrough(timestamp: number): readonly ReplayEvent[] {
    return Object.freeze(
      this.timeline.events.filter((event) => event.timestamp <= timestamp),
    );
  }

  getIndex(): number {
    return this.index;
  }

  getState(): TwinReplayCursorState {
    return toImmutableJson(
      {
        schemaVersion: TWIN_REPLAY_CURSOR_STATE_VERSION,
        robotId: this.timeline.robotId,
        index: this.index,
      },
      "twinReplayCursorState",
    );
  }

  restore(state: TwinReplayCursorState): void {
    if (
      state.schemaVersion !== TWIN_REPLAY_CURSOR_STATE_VERSION ||
      state.robotId !== this.timeline.robotId ||
      !Number.isInteger(state.index) ||
      state.index < -1 ||
      state.index >= this.timeline.states.length
    ) {
      throw new TypeError("replay cursor state is incompatible with this timeline");
    }
    this.index = state.index;
  }
}
