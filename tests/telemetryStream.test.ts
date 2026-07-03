import { describe, expect, it } from "vitest";

import {
  RobotSimulator,
  TelemetryStream,
  type TelemetryEvent,
} from "../src/index.js";

const collectEvents = (
  stream: TelemetryStream,
): { events: TelemetryEvent[]; unsubscribe: () => void } => {
  const events: TelemetryEvent[] = [];
  const unsubscribe = stream.subscribe((event) => events.push(event));
  return { events, unsubscribe };
};

describe("TelemetryStream", () => {
  it("starts stopped by default", () => {
    const stream = new TelemetryStream(new RobotSimulator());

    expect(stream.getStatus()).toBe("stopped");
  });

  it("emits stream.started when started", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const { events } = collectEvents(stream);

    stream.start();

    expect(stream.getStatus()).toBe("running");
    expect(events.map((event) => event.type)).toEqual(["stream.started"]);
  });

  it("emits stream.stopped when stopped", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const { events } = collectEvents(stream);

    stream.start();
    stream.stop();

    expect(stream.getStatus()).toBe("stopped");
    expect(events.map((event) => event.type)).toEqual([
      "stream.started",
      "stream.stopped",
    ]);
  });

  it("emits telemetry.snapshot when stepped while running", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const { events } = collectEvents(stream);

    stream.start();
    const snapshot = stream.step(1_000);

    expect(snapshot).toBeDefined();
    expect(events.at(-1)).toMatchObject({
      type: "telemetry.snapshot",
      payload: { snapshot },
    });
  });

  it("does not step or emit a snapshot while stopped", () => {
    const simulator = new RobotSimulator();
    const stream = new TelemetryStream(simulator);
    const { events } = collectEvents(stream);
    const timestamp = simulator.getSnapshot().timestamp;

    expect(stream.step(1_000)).toBeUndefined();
    expect(simulator.getSnapshot().timestamp).toBe(timestamp);
    expect(events).toEqual([]);
  });

  it("assigns strictly increasing event sequence numbers", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const { events } = collectEvents(stream);

    stream.start();
    stream.step(1_000);
    stream.injectFault({ type: "low_battery" });
    stream.step(1_000);
    stream.stop();

    expect(events.map((event) => event.sequence)).toEqual(
      events.map((_, index) => index + 1),
    );
  });

  it("produces deterministic events for equal seeds and actions", () => {
    const run = (): TelemetryEvent[] => {
      const stream = new TelemetryStream(
        new RobotSimulator({
          robotId: "deterministic-rover",
          seed: 42,
          initialState: "active",
        }),
      );
      const { events } = collectEvents(stream);

      stream.start();
      stream.step(1_000);
      stream.injectFault({ type: "low_battery", severity: 0.5 });
      stream.step(2_000);
      stream.stop();

      return events;
    };

    expect(run()).toEqual(run());
  });

  it("isolates each subscriber from event mutation", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const observed: TelemetryEvent[] = [];

    stream.subscribe((event) => {
      event.id = "mutated";
      (event.payload as { status: string }).status = "mutated";
    });
    stream.subscribe((event) => observed.push(event));

    stream.start();

    expect(observed[0]).toMatchObject({
      id: "robot-001:1",
      payload: { status: "running" },
    });
  });

  it("emits fault.injected for a low battery fault", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const { events } = collectEvents(stream);

    stream.injectFault({ type: "low_battery" });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: "fault.injected",
      payload: { fault: { type: "low_battery" } },
    });
  });

  it("emits state.changed before the snapshot that reflects it", () => {
    const simulator = new RobotSimulator({ initialState: "idle" });
    const stream = new TelemetryStream(simulator);
    const { events } = collectEvents(stream);

    stream.start();
    simulator.setState("active");
    stream.step(1_000);

    expect(events.slice(1).map((event) => event.type)).toEqual([
      "state.changed",
      "telemetry.snapshot",
    ]);
    expect(events[1]?.payload).toEqual({
      previousState: "idle",
      currentState: "active",
    });
  });

  it("supports explicit and returned unsubscribe functions", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const first: TelemetryEvent[] = [];
    const second: TelemetryEvent[] = [];
    const firstHandler = (event: TelemetryEvent): void => {
      first.push(event);
    };

    stream.subscribe(firstHandler);
    const unsubscribeSecond = stream.subscribe((event) => second.push(event));
    stream.start();
    stream.unsubscribe(firstHandler);
    unsubscribeSecond();
    stream.stop();

    expect(first.map((event) => event.type)).toEqual(["stream.started"]);
    expect(second.map((event) => event.type)).toEqual(["stream.started"]);
  });

  it("does not duplicate lifecycle events", () => {
    const stream = new TelemetryStream(new RobotSimulator());
    const { events } = collectEvents(stream);

    stream.start();
    stream.start();
    stream.stop();
    stream.stop();

    expect(events.map((event) => event.type)).toEqual([
      "stream.started",
      "stream.stopped",
    ]);
  });
});
