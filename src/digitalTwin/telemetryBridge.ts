import type { TelemetryEvent } from "../events/eventTypes.js";
import type { ReplayLog } from "../replay/replayLog.js";
import type { TelemetrySnapshot } from "../types.js";
import { deriveProvenance } from "../provenance/provenanceBuilder.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
import { toImmutableJson, type JsonValue } from "./deterministicJson.js";
import {
  createRobotState,
  type RobotState,
  type RobotStateInput,
} from "./robotState.js";
import {
  createTwinTimeline,
  type TwinTimeline,
  type TwinTimelineInput,
} from "./twinTimeline.js";

export type CanonicalRobotState = RobotState;

export const TELEMETRY_BRIDGE_SOURCES = [
  "telemetry-snapshot",
  "replay-event",
  "adapter-reading",
  "custom",
] as const;

export type TelemetryBridgeSource =
  (typeof TELEMETRY_BRIDGE_SOURCES)[number];

export interface TelemetryBridgeContext {
  readonly robotId: string;
  readonly timestamp: number;
  readonly source: TelemetryBridgeSource;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type TelemetryToStateMapper<TInput = unknown> = (
  previousState: CanonicalRobotState | undefined,
  input: TInput,
  context: TelemetryBridgeContext,
) => CanonicalRobotState;

export interface TelemetryBridgeMapOptions {
  readonly previousState?: CanonicalRobotState;
  readonly contextMetadata?: Readonly<Record<string, unknown>>;
}

export interface TelemetryBridgeBuildOptions
  extends Omit<TwinTimelineInput, "robotId" | "states"> {
  readonly contextMetadata?: Readonly<Record<string, unknown>>;
  readonly provenance?: EvidenceProvenance;
}

const toTimelineOptions = (
  options: TelemetryBridgeBuildOptions,
): Omit<TwinTimelineInput, "robotId" | "states"> => ({
  ...(options.schemaVersion === undefined
    ? {}
    : { schemaVersion: options.schemaVersion }),
  ...(options.clockDomain === undefined
    ? {}
    : { clockDomain: options.clockDomain }),
  ...(options.events === undefined ? {} : { events: options.events }),
  ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
  ...(options.provenance === undefined
    ? {}
    : { provenance: options.provenance }),
});

const timelineProvenance = (
  provenance: EvidenceProvenance | undefined,
  timestamp: number,
): EvidenceProvenance | undefined =>
  provenance === undefined
    ? undefined
    : deriveProvenance(provenance, {
        name: "Twin Timeline Builder",
        timestamp: Math.max(provenance.timestamp, timestamp),
      });

const zeroVector = { x: 0, y: 0, z: 0 } as const;
const identityQuaternion = { x: 0, y: 0, z: 0, w: 1 } as const;

const timestampFromSnapshot = (snapshot: TelemetrySnapshot): number => {
  const timestamp = Date.parse(snapshot.timestamp);
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new TypeError("telemetry snapshot timestamp must be a valid non-negative date");
  }
  return timestamp;
};

const immutableContext = (
  robotId: string,
  timestamp: number,
  source: TelemetryBridgeSource,
  metadata?: Readonly<Record<string, unknown>>,
): TelemetryBridgeContext =>
  toImmutableJson(
    {
      robotId,
      timestamp,
      source,
      ...(metadata === undefined ? {} : { metadata }),
    },
    "telemetryBridgeContext",
  );

const requireMappedIdentity = (
  state: RobotState,
  context: TelemetryBridgeContext,
): RobotState => {
  if (
    state.robotId !== context.robotId ||
    state.timestamp !== context.timestamp
  ) {
    throw new TypeError(
      "mapped state must match the bridge context robotId and timestamp",
    );
  }
  return createRobotState(state);
};

export const defaultTelemetrySnapshotMapper: TelemetryToStateMapper<TelemetrySnapshot> = (
  _previous,
  snapshot,
  context,
) =>
  createRobotState({
    timestamp: context.timestamp,
    robotId: context.robotId,
    operatingMode: snapshot.state,
    globalPose: {
      frameId: "world",
      position: zeroVector,
      orientation: identityQuaternion,
    },
    linearVelocity: zeroVector,
    angularVelocity: snapshot.imu.gyro,
    jointStates: {},
    actuatorOutputs: {
      leftMotorRpm: snapshot.leftMotorRpm,
      rightMotorRpm: snapshot.rightMotorRpm,
    },
    sensorValues: {
      imu: snapshot.imu as unknown as JsonValue,
      cpuUsage: snapshot.cpuUsage,
      memoryUsage: snapshot.memoryUsage,
      signalStrength: snapshot.signalStrength,
    },
    batteryStatus: {
      charge: snapshot.batteryPercentage / 100,
      voltage: snapshot.batteryVoltage,
    },
    healthIndicators: [],
    metadata: { bridgeSource: context.source },
  });

export const defaultReplayEventMapper: TelemetryToStateMapper<TelemetryEvent> = (
  previous,
  event,
  context,
) => {
  const base: RobotStateInput =
    previous === undefined
      ? {
          timestamp: context.timestamp,
          robotId: context.robotId,
          globalPose: {
            frameId: "world",
            position: zeroVector,
            orientation: identityQuaternion,
          },
          linearVelocity: zeroVector,
          angularVelocity: zeroVector,
          jointStates: {},
          actuatorOutputs: {},
          sensorValues: {},
          healthIndicators: [],
          metadata: {},
        }
      : {
          ...previous,
          timestamp: context.timestamp,
          robotId: context.robotId,
        };

  return createRobotState({
    ...base,
    metadata: {
      ...base.metadata,
      bridgeSource: context.source,
      lastReplayEvent: {
        id: event.id,
        sequence: event.sequence,
        type: event.type,
      },
    },
  });
};

export const mapTelemetrySnapshotToState = (
  snapshot: TelemetrySnapshot,
  mapper: TelemetryToStateMapper<TelemetrySnapshot> =
    defaultTelemetrySnapshotMapper,
  options: TelemetryBridgeMapOptions = {},
): CanonicalRobotState => {
  const input = toImmutableJson(snapshot, "telemetrySnapshot");
  const context = immutableContext(
    input.robotId,
    timestampFromSnapshot(input),
    "telemetry-snapshot",
    options.contextMetadata,
  );
  return requireMappedIdentity(
    mapper(options.previousState, input, context),
    context,
  );
};

export const mapReplayEventToState = (
  event: TelemetryEvent,
  mapper: TelemetryToStateMapper<TelemetryEvent> = defaultReplayEventMapper,
  options: TelemetryBridgeMapOptions = {},
): CanonicalRobotState => {
  const input = toImmutableJson(event, "replayEvent");
  const context = immutableContext(
    input.robotId,
    input.timestamp,
    "replay-event",
    options.contextMetadata,
  );
  return requireMappedIdentity(
    mapper(options.previousState, input, context),
    context,
  );
};

export const buildTwinTimelineFromTelemetry = (
  robotId: string,
  snapshots: readonly TelemetrySnapshot[],
  mapper: TelemetryToStateMapper<TelemetrySnapshot> =
    defaultTelemetrySnapshotMapper,
  options: TelemetryBridgeBuildOptions = {},
): TwinTimeline => {
  let previousState: RobotState | undefined;
  const states = [...snapshots]
    .sort((left, right) => timestampFromSnapshot(left) - timestampFromSnapshot(right))
    .map((snapshot) => {
      if (snapshot.robotId !== robotId) {
        throw new TypeError("telemetry snapshot robotId does not match timeline");
      }
      const state = mapTelemetrySnapshotToState(snapshot, mapper, {
        ...(previousState === undefined ? {} : { previousState }),
        ...(options.contextMetadata === undefined
          ? {}
          : { contextMetadata: options.contextMetadata }),
      });
      previousState = state;
      return state;
    });
  return createTwinTimeline({
    ...toTimelineOptions(options),
    robotId,
    states,
    ...(() => {
      const provenance = timelineProvenance(
        options.provenance ?? snapshots.find(({ provenance }) => provenance)?.provenance,
        states.at(-1)?.timestamp ?? 0,
      );
      return provenance === undefined ? {} : { provenance };
    })(),
  });
};

const compareTelemetryEvents = (
  left: TelemetryEvent,
  right: TelemetryEvent,
): number =>
  left.timestamp - right.timestamp ||
  left.sequence - right.sequence ||
  left.id.localeCompare(right.id);

export function buildTwinTimelineFromReplay(
  replayLog: ReplayLog,
  mapper?: TelemetryToStateMapper<TelemetryEvent>,
  options?: TelemetryBridgeBuildOptions,
): TwinTimeline;
export function buildTwinTimelineFromReplay(
  robotId: string,
  events: readonly TelemetryEvent[],
  mapper?: TelemetryToStateMapper<TelemetryEvent>,
  options?: TelemetryBridgeBuildOptions,
): TwinTimeline;
export function buildTwinTimelineFromReplay(
  replayOrRobotId: ReplayLog | string,
  eventsOrMapper?:
    | readonly TelemetryEvent[]
    | TelemetryToStateMapper<TelemetryEvent>,
  mapperOrOptions?:
    | TelemetryToStateMapper<TelemetryEvent>
    | TelemetryBridgeBuildOptions,
  maybeOptions: TelemetryBridgeBuildOptions = {},
): TwinTimeline {
  const fromLog = typeof replayOrRobotId !== "string";
  const robotId = fromLog ? replayOrRobotId.robotId : replayOrRobotId;
  const events = fromLog
    ? replayOrRobotId.events
    : (eventsOrMapper as readonly TelemetryEvent[]);
  const mapper = (
    fromLog ? eventsOrMapper : mapperOrOptions
  ) as TelemetryToStateMapper<TelemetryEvent> | undefined;
  const options = (
    fromLog ? mapperOrOptions : maybeOptions
  ) as TelemetryBridgeBuildOptions | undefined;

  let previousState: RobotState | undefined;
  const states: RobotState[] = [];
  for (const event of [...events].sort(compareTelemetryEvents)) {
    if (event.robotId !== robotId) {
      throw new TypeError("replay event robotId does not match timeline");
    }
    const state = mapReplayEventToState(
      event,
      mapper ?? defaultReplayEventMapper,
      {
        ...(previousState === undefined ? {} : { previousState }),
        ...(options?.contextMetadata === undefined
          ? {}
          : { contextMetadata: options.contextMetadata }),
      },
    );
    previousState = state;
    const previousTimelineState = states.at(-1);
    if (previousTimelineState?.timestamp === state.timestamp) {
      states[states.length - 1] = state;
    } else {
      states.push(state);
    }
  }
  return createTwinTimeline({
    ...toTimelineOptions(options ?? {}),
    robotId,
    states,
    ...(() => {
      const provenance = timelineProvenance(
        options?.provenance ??
          (fromLog
            ? replayOrRobotId.provenance
            : events.find(({ provenance }) => provenance)?.provenance),
        states.at(-1)?.timestamp ?? 0,
      );
      return provenance === undefined ? {} : { provenance };
    })(),
  });
}
