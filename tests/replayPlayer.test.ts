import { describe, expect, it } from "vitest";

import {
  ReplayPlayer,
  type ReplayLog,
  type TelemetryEvent,
} from "../src/index.js";

const events: TelemetryEvent[] = [1, 2, 3].map((sequence) => ({
  id: `player-rover:${sequence}`,
  type:
    sequence === 1
      ? "stream.started"
      : sequence === 3
        ? "stream.stopped"
        : "telemetry.snapshot",
  timestamp: sequence * 1_000,
  robotId: "player-rover",
  sequence,
  payload: { sequence },
}));

const createLog = (): ReplayLog => ({
  version: "0.3.0",
  robotId: "player-rover",
  createdAt: "1970-01-01T00:00:01.000Z",
  eventCount: events.length,
  events,
});

describe("ReplayPlayer", () => {
  it("starts stopped", () => {
    expect(new ReplayPlayer(createLog()).getStatus()).toBe("stopped");
  });

  it("emits no events while stopped", () => {
    const player = new ReplayPlayer(createLog());
    const emitted: TelemetryEvent[] = [];
    player.subscribe((event) => emitted.push(event));

    expect(player.step()).toBeUndefined();
    expect(player.playAll()).toEqual([]);
    expect(emitted).toEqual([]);
    expect(player.getCurrentIndex()).toBe(0);
  });

  it("steps through independent event copies in exact order", () => {
    const player = new ReplayPlayer(createLog());
    const emitted: TelemetryEvent[] = [];
    player.subscribe((event) => emitted.push(event));

    player.start();
    expect(player.step()).toEqual(events[0]);
    expect(player.step()).toEqual(events[1]);
    expect(player.step()).toEqual(events[2]);

    expect(emitted).toEqual(events);
    expect(emitted[0]).not.toBe(events[0]);
    expect(player.getCurrentIndex()).toBe(3);
  });

  it("plays all remaining events while running", () => {
    const player = new ReplayPlayer(createLog());
    const emitted: TelemetryEvent[] = [];
    player.subscribe((event) => emitted.push(event));

    player.start();
    player.step();
    expect(player.playAll()).toEqual(events.slice(1));
    expect(emitted).toEqual(events);
  });

  it("stops cleanly at the end of the log", () => {
    const player = new ReplayPlayer(createLog());

    player.start();
    player.playAll();

    expect(player.getStatus()).toBe("stopped");
    expect(player.step()).toBeUndefined();
    expect(player.getCurrentIndex()).toBe(events.length);
  });

  it("supports explicit and returned unsubscribe functions", () => {
    const player = new ReplayPlayer(createLog());
    const first: TelemetryEvent[] = [];
    const second: TelemetryEvent[] = [];
    const firstHandler = (event: TelemetryEvent): void => {
      first.push(event);
    };

    player.subscribe(firstHandler);
    const unsubscribeSecond = player.subscribe((event) => second.push(event));
    player.start();
    player.step();
    player.unsubscribe(firstHandler);
    unsubscribeSecond();
    player.playAll();

    expect(first).toEqual([events[0]]);
    expect(second).toEqual([events[0]]);
  });

  it("isolates the source log and subscribers from replay mutation", () => {
    const log = createLog();
    const player = new ReplayPlayer(log);
    const observed: TelemetryEvent[] = [];

    player.subscribe((event) => {
      event.id = "mutated";
      (event.payload as { sequence: number }).sequence = 99;
    });
    player.subscribe((event) => observed.push(event));
    player.start();
    const returned = player.step()!;
    returned.id = "returned-mutation";

    expect(observed[0]).toEqual(events[0]);
    expect(log.events[0]).toEqual(events[0]);
  });
});
