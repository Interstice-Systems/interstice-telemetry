import { describe, expect, it } from "vitest";

import {
  ReplayClock,
  ReplayPlayer,
  type ReplayLog,
  type TelemetryEvent,
} from "../src/index.js";

const createEvents = (): TelemetryEvent[] =>
  [100, 250, 250, 900].map((timestamp, index) => ({
    id: `replay:${index + 1}`,
    type: "telemetry.snapshot",
    timestamp,
    robotId: "replay-rover",
    sequence: index + 1,
    payload: {},
  }));

describe("ReplayClock", () => {
  it("starts at the first timestamp and advances through event timestamps", () => {
    const clock = new ReplayClock(createEvents());

    expect(clock.now()).toBe(100);
    expect(clock.advanceToNextEvent()).toBe(250);
    expect(clock.advanceToNextEvent()).toBe(250);
    expect(clock.advanceToNextEvent()).toBe(900);
    expect(clock.getInfo().stepCount).toBe(3);
  });

  it("resets to the first replay timestamp", () => {
    const clock = new ReplayClock(createEvents());
    clock.advanceToNextEvent();
    clock.reset();

    expect(clock.now()).toBe(100);
    expect(clock.getInfo().stepCount).toBe(0);
  });

  it("does not mutate replay events", () => {
    const events = createEvents();
    const original = structuredClone(events);
    const clock = new ReplayClock(events);

    clock.advanceToNextEvent();
    clock.step(10);
    clock.reset();

    expect(events).toEqual(original);
  });

  it("tracks replay playback when supplied to a player", () => {
    const events = createEvents();
    const log: ReplayLog = {
      version: "0.3.0",
      robotId: "replay-rover",
      createdAt: new Date(0).toISOString(),
      eventCount: events.length,
      events,
    };
    const clock = new ReplayClock(events);
    const player = new ReplayPlayer(log, clock);

    player.start();
    expect(player.step()?.timestamp).toBe(clock.now());
    expect(player.step()?.timestamp).toBe(clock.now());
    player.playAll();

    expect(clock.now()).toBe(900);
  });
});
