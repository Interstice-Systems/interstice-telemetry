import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ReplayRecorder,
  SimulationClock,
  TelemetryStream,
  getBuiltInFleetScenario,
  getBuiltInScenario,
  runFleetScenario,
  runScenario,
} from "../src/index.js";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("runner lifecycle cleanup", () => {
  it("stops and unsubscribes a scenario runtime after a clock exception", () => {
    const profile = getBuiltInScenario("basic-patrol");
    if (profile === undefined) throw new Error("Missing scenario.");
    const clock = new SimulationClock();
    vi.spyOn(clock, "step").mockImplementation(() => {
      throw new Error("clock failed");
    });
    const stopStream = vi.spyOn(TelemetryStream.prototype, "stop");
    const unsubscribe = vi.spyOn(TelemetryStream.prototype, "unsubscribe");
    const stopRecorder = vi.spyOn(ReplayRecorder.prototype, "stop");

    expect(() => runScenario(profile, clock)).toThrow("clock failed");
    expect(stopStream).toHaveBeenCalledTimes(1);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(stopRecorder).toHaveBeenCalledTimes(1);
  });

  it("cleans every fleet runtime after a fleet clock exception", () => {
    const profile = getBuiltInFleetScenario("mixed-fault-fleet");
    if (profile === undefined) throw new Error("Missing fleet scenario.");
    const clock = new SimulationClock();
    vi.spyOn(clock, "step").mockImplementation(() => {
      throw new Error("fleet clock failed");
    });
    const stopStream = vi.spyOn(TelemetryStream.prototype, "stop");
    const unsubscribe = vi.spyOn(TelemetryStream.prototype, "unsubscribe");
    const stopRecorder = vi.spyOn(ReplayRecorder.prototype, "stop");

    expect(() => runFleetScenario(profile, clock)).toThrow(
      "fleet clock failed",
    );
    expect(stopStream).toHaveBeenCalledTimes(profile.robots.length);
    expect(unsubscribe).toHaveBeenCalledTimes(profile.robots.length);
    expect(stopRecorder).toHaveBeenCalledTimes(profile.robots.length);
  });

  it("cleans up after a stream subscriber failure during startup", () => {
    const profile = getBuiltInScenario("basic-patrol");
    if (profile === undefined) throw new Error("Missing scenario.");
    const originalStart = TelemetryStream.prototype.start;
    vi.spyOn(TelemetryStream.prototype, "start").mockImplementation(function (
      this: TelemetryStream,
    ) {
      originalStart.call(this);
      throw new Error("subscriber failed");
    });
    const stopRecorder = vi.spyOn(ReplayRecorder.prototype, "stop");
    const unsubscribe = vi.spyOn(TelemetryStream.prototype, "unsubscribe");

    expect(() => runScenario(profile)).toThrow("subscriber failed");
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(stopRecorder).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid profiles before starting runtime resources", () => {
    const start = vi.spyOn(TelemetryStream.prototype, "start");
    const profile = getBuiltInScenario("basic-patrol");
    if (profile === undefined) throw new Error("Missing scenario.");

    expect(() => runScenario({ ...profile, durationMs: 0 })).toThrow(
      "Invalid scenario profile",
    );
    expect(start).not.toHaveBeenCalled();
  });

  it("rejects invalid fleet profiles before starting runtime resources", () => {
    const start = vi.spyOn(TelemetryStream.prototype, "start");
    const profile = getBuiltInFleetScenario("mixed-fault-fleet");
    if (profile === undefined) throw new Error("Missing fleet scenario.");

    expect(() => runFleetScenario({ ...profile, robots: [] })).toThrow(
      "Invalid fleet scenario profile",
    );
    expect(start).not.toHaveBeenCalled();
  });
});
