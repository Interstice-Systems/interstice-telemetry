import { describe, expect, it } from "vitest";

import {
  ReplayRecorder,
  RobotSimulator,
  TelemetryStream,
  type TelemetryEvent,
} from "../src/index.js";

const event = (sequence: number): TelemetryEvent => ({
  id: `recorder-rover:${sequence}`,
  type: "telemetry.snapshot",
  timestamp: sequence * 1_000,
  robotId: "recorder-rover",
  sequence,
  payload: { sequence },
});

describe("ReplayRecorder", () => {
  it("starts inactive", () => {
    expect(new ReplayRecorder().getStatus()).toBe("inactive");
  });

  it("ignores manually recorded events while inactive", () => {
    const recorder = new ReplayRecorder();

    recorder.record(event(1));

    expect(recorder.getEvents()).toEqual([]);
  });

  it("records stream events in order while active", () => {
    const simulator = new RobotSimulator({
      robotId: "recorder-rover",
      seed: 7,
    });
    const stream = new TelemetryStream(simulator);
    const recorder = new ReplayRecorder({ seed: 7 });
    const unsubscribe = stream.subscribe(recorder.record);

    recorder.start();
    stream.start();
    stream.step(1_000);
    stream.injectFault({ type: "low_battery" });
    stream.stop();
    recorder.stop();
    unsubscribe();

    expect(recorder.getEvents().map(({ type }) => type)).toEqual([
      "stream.started",
      "telemetry.snapshot",
      "fault.injected",
      "stream.stopped",
    ]);
  });

  it("preserves event values and sequence numbers behind a copy boundary", () => {
    const recorder = new ReplayRecorder();
    const first = event(4);
    const second = event(9);

    recorder.start();
    recorder.record(first);
    recorder.record(second);

    const recorded = recorder.getEvents();
    expect(recorded).toEqual([first, second]);
    expect(recorded[0]).not.toBe(first);
    expect(recorded.map(({ sequence }) => sequence)).toEqual([4, 9]);

    (first.payload as { sequence: number }).sequence = 100;
    (recorded[0]!.payload as { sequence: number }).sequence = 200;
    expect(recorder.getEvents()[0]!.payload).toEqual({ sequence: 4 });
  });

  it("clears all recorded events", () => {
    const recorder = new ReplayRecorder();

    recorder.start();
    recorder.record(event(1));
    recorder.clear();

    expect(recorder.getEvents()).toEqual([]);
  });

  it("creates a log with matching eventCount and inferred identity", () => {
    const recorder = new ReplayRecorder({
      seed: "test-seed",
      createdAt: 0,
    });

    recorder.start();
    recorder.record(event(1));
    recorder.record(event(2));

    expect(recorder.toLog({ run: "unit-test" })).toEqual({
      version: "0.3.0",
      robotId: "recorder-rover",
      createdAt: "1970-01-01T00:00:00.000Z",
      seed: "test-seed",
      eventCount: 2,
      events: [event(1), event(2)],
      metadata: { run: "unit-test" },
    });
  });

  it("returns independent replay logs", () => {
    const recorder = new ReplayRecorder();
    recorder.start();
    recorder.record(event(1));

    const first = recorder.toLog();
    (first.events[0]!.payload as { sequence: number }).sequence = 99;

    expect(recorder.toLog().events[0]!.payload).toEqual({ sequence: 1 });
  });
});
