import { describe, expect, it, vi } from "vitest";

import {
  buildTwinTimelineFromReplay,
  buildTwinTimelineFromTelemetry,
  createRobotState,
  mapReplayEventToState,
  mapTelemetrySnapshotToState,
  type TelemetryEvent,
  type TelemetrySnapshot,
  type TelemetryToStateMapper,
} from "../src/index.js";

const snapshot = (timestamp: string): TelemetrySnapshot => ({
  timestamp,
  robotId: "rover-1",
  batteryPercentage: 80,
  batteryVoltage: 24,
  leftMotorRpm: 10,
  rightMotorRpm: 11,
  leftMotorTemperature: 30,
  rightMotorTemperature: 31,
  cpuUsage: 20,
  memoryUsage: 40,
  signalStrength: 90,
  imu: {
    acceleration: { x: 0, y: 0, z: 9.8 },
    gyro: { x: 0, y: 0, z: 0.1 },
  },
  state: "active",
});

const event: TelemetryEvent = {
  id: "e1",
  type: "telemetry.snapshot",
  timestamp: 1_000,
  robotId: "rover-1",
  sequence: 1,
  payload: {},
};

describe("telemetry-to-state bridge", () => {
  it("maps snapshots deterministically without mutating input", () => {
    const input = snapshot("1970-01-01T00:00:01.000Z");
    const before = structuredClone(input);
    expect(mapTelemetrySnapshotToState(input)).toEqual(
      mapTelemetrySnapshotToState(input),
    );
    expect(input).toEqual(before);
  });

  it("maps replay events conservatively and deterministically", () => {
    const before = structuredClone(event);
    const state = mapReplayEventToState(event);
    expect(state.timestamp).toBe(1_000);
    expect(state.metadata.lastReplayEvent).toEqual({
      id: "e1",
      sequence: 1,
      type: "telemetry.snapshot",
    });
    expect(event).toEqual(before);
  });

  it("invokes application mappers in sorted fold order", () => {
    const mapper: TelemetryToStateMapper<TelemetrySnapshot> = vi.fn(
      (previous, _input, context) =>
        createRobotState({
          timestamp: context.timestamp,
          robotId: context.robotId,
          globalPose: {
            frameId: "world",
            position: { x: (previous?.globalPose.position.x ?? 0) + 1, y: 0, z: 0 },
            orientation: { x: 0, y: 0, z: 0, w: 1 },
          },
          linearVelocity: { x: 0, y: 0, z: 0 },
          angularVelocity: { x: 0, y: 0, z: 0 },
          jointStates: {},
          actuatorOutputs: {},
          sensorValues: {},
          healthIndicators: [],
          metadata: {},
        }),
    );
    const timeline = buildTwinTimelineFromTelemetry(
      "rover-1",
      [
        snapshot("1970-01-01T00:00:02.000Z"),
        snapshot("1970-01-01T00:00:01.000Z"),
      ],
      mapper,
    );
    expect(timeline.states.map(({ timestamp }) => timestamp)).toEqual([1_000, 2_000]);
    expect(timeline.states[1]?.globalPose.position.x).toBe(2);
    expect(mapper).toHaveBeenCalledTimes(2);
  });

  it("builds a timeline directly from a replay log", () => {
    const timeline = buildTwinTimelineFromReplay({
      version: "0.3.0",
      robotId: "rover-1",
      createdAt: "1970-01-01T00:00:00.000Z",
      eventCount: 1,
      events: [event],
    });
    expect(timeline.states).toHaveLength(1);
  });

  it("folds all same-timestamp replay events into one canonical state", () => {
    const second = { ...event, id: "e2", sequence: 2 };
    const mapper = vi.fn(defaultMapperForReplay);
    const timeline = buildTwinTimelineFromReplay(
      "rover-1",
      [second, event],
      mapper,
    );
    expect(mapper).toHaveBeenCalledTimes(2);
    expect(timeline.states).toHaveLength(1);
    expect(timeline.states[0]?.metadata.eventId).toBe("e2");
  });
});

const defaultMapperForReplay: TelemetryToStateMapper<TelemetryEvent> = (
  previous,
  input,
  context,
) =>
  createRobotState({
    ...(previous ?? mapReplayEventToState(input)),
    timestamp: context.timestamp,
    robotId: context.robotId,
    metadata: { eventId: input.id },
  });
