import { describe, expect, it } from "vitest";

import {
  createReplayEvent,
  createTwinTimeline,
  deserializeReplayEvents,
  deserializeTwinTimeline,
  reconstructTwinTimeline,
  serializeReplayEvents,
  serializeTwinTimeline,
  TwinReplayCursor,
  type TwinTelemetryRecord,
} from "../src/index.js";
import { stateInput } from "./fixtures/digitalTwin.js";

interface Payload {
  readonly charge: number;
}

const records: readonly TwinTelemetryRecord<Payload>[] = [
  { id: "r3", robotId: "rover-1", timestamp: 3_000, sequence: 3, payload: { charge: 0.7 } },
  { id: "r1", robotId: "rover-1", timestamp: 1_000, sequence: 1, payload: { charge: 0.9 } },
  { id: "r2", robotId: "rover-1", timestamp: 2_000, sequence: 2, payload: { charge: 0.8 } },
];

const reconstruct = (
  _previous: unknown,
  record: TwinTelemetryRecord<Payload>,
) => stateInput(record.timestamp, record.payload.charge);

describe("twin timeline", () => {
  it("reconstructs the same timeline from any input ordering", () => {
    const forward = reconstructTwinTimeline("rover-1", records, reconstruct);
    const reverse = reconstructTwinTimeline(
      "rover-1",
      [...records].reverse(),
      reconstruct,
    );

    expect(serializeTwinTimeline(forward)).toBe(serializeTwinTimeline(reverse));
    expect(forward.states.map((state) => state.timestamp)).toEqual([
      1_000, 2_000, 3_000,
    ]);
  });

  it("round trips states and deterministically ordered event markers", () => {
    const events = [
      createReplayEvent({
        id: "battery",
        robotId: "rover-1",
        timestamp: 2_000,
        sequence: 2,
        type: "battery.warning",
        metadata: { charge: 0.8 },
      }),
      createReplayEvent({
        id: "mission",
        robotId: "rover-1",
        timestamp: 1_000,
        sequence: 1,
        type: "mission.started",
        metadata: {},
      }),
    ];
    const base = reconstructTwinTimeline("rover-1", records, reconstruct);
    const timeline = createTwinTimeline({ ...base, events });
    const restored = deserializeTwinTimeline(serializeTwinTimeline(timeline));

    expect(restored).toEqual(timeline);
    expect(restored.events.map((event) => event.id)).toEqual([
      "mission", "battery",
    ]);
    expect(deserializeReplayEvents(serializeReplayEvents(events))).toEqual(
      restored.events,
    );
  });

  it("supports deterministic cursor stepping, seeking, and event inspection", () => {
    const event = createReplayEvent({
      id: "warning",
      robotId: "rover-1",
      timestamp: 2_000,
      sequence: 1,
      type: "battery.warning",
      metadata: {},
    });
    const timeline = reconstructTwinTimeline(
      "rover-1",
      records,
      reconstruct,
      { events: [event] },
    );
    const cursor = new TwinReplayCursor(timeline);

    expect(cursor.current()).toBeUndefined();
    expect(cursor.next()?.timestamp).toBe(1_000);
    expect(cursor.seek(2_500)?.timestamp).toBe(2_000);
    expect(cursor.eventsThrough(2_500)).toEqual([event]);
    expect(cursor.seek(500)).toBeUndefined();
    cursor.reset();
    expect(cursor.getIndex()).toBe(-1);
  });

  it("rejects ambiguous or cross-robot reconstruction", () => {
    const base = reconstructTwinTimeline("rover-1", records, reconstruct);
    expect(() =>
      createTwinTimeline({
        ...base,
        states: [base.states[0]!, base.states[0]!],
      }),
    ).toThrow(/one state/);
    expect(() =>
      reconstructTwinTimeline(
        "another-robot",
        records,
        reconstruct,
      ),
    ).toThrow(/robotId/);
  });
});
