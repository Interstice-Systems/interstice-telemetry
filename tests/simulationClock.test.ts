import { describe, expect, it } from "vitest";

import {
  RobotSimulator,
  runScenario,
  SimulationClock,
  TelemetryStream,
  type ScenarioProfile,
  type TelemetryEvent,
} from "../src/index.js";

describe("SimulationClock", () => {
  it("starts at zero by default and advances deterministically", () => {
    const clock = new SimulationClock();

    expect(clock.now()).toBe(0);
    expect(clock.step(250)).toBe(250);
    expect(clock.step(750)).toBe(1_000);
    expect(clock.getInfo().stepCount).toBe(2);
  });

  it("accepts a configurable start time and resets to it", () => {
    const clock = new SimulationClock({
      id: "mission-clock",
      startTimeMs: 5_000,
    });

    clock.step(100);
    clock.reset();

    expect(clock.getInfo()).toMatchObject({
      id: "mission-clock",
      kind: "simulation",
      currentTimeMs: 5_000,
      stepCount: 0,
    });
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid delta %s",
    (deltaMs) => {
      expect(() => new SimulationClock().step(deltaMs)).toThrow(RangeError);
    },
  );

  it("optionally timestamps telemetry stream events", () => {
    const clock = new SimulationClock({ startTimeMs: 10_000 });
    const stream = new TelemetryStream(new RobotSimulator(), clock);
    const events: TelemetryEvent[] = [];
    stream.subscribe((event) => events.push(event));

    stream.start();
    stream.step(500);

    expect(clock.now()).toBe(10_500);
    expect(events.map(({ timestamp }) => timestamp)).toEqual([
      10_000,
      10_500,
    ]);
  });

  it("optionally advances through scenario execution", () => {
    const profile: ScenarioProfile = {
      id: "clocked-scenario",
      name: "Clocked scenario",
      description: "Clock integration.",
      durationMs: 250,
      stepMs: 100,
    };
    const clock = new SimulationClock();

    const result = runScenario(profile, clock);

    expect(clock.now()).toBe(250);
    expect(clock.getInfo().stepCount).toBe(3);
    expect(result.summary.durationMs).toBe(250);
  });
});
