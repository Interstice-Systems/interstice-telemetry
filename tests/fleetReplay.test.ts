import { describe, expect, it } from "vitest";

import {
  createFleetReplayLog,
  deserializeFleetReplayLog,
  getBuiltInFleetScenario,
  runFleetScenario,
  serializeFleetReplayLog,
  validateFleetReplayLog,
} from "../src/index.js";

const runFleet = () => {
  const profile = getBuiltInFleetScenario("two-robot-patrol");

  if (profile === undefined) {
    throw new Error("Missing two-robot-patrol.");
  }

  return runFleetScenario(profile);
};

describe("fleet replay logs", () => {
  it("counts all events across robot logs", () => {
    const result = runFleet();
    const summedEvents = Object.values(
      result.fleetReplayLog.robotLogs,
    ).reduce((total, log) => total + log.eventCount, 0);

    expect(result.fleetReplayLog.eventCount).toBe(summedEvents);
    expect(validateFleetReplayLog(result.fleetReplayLog).valid).toBe(true);
  });

  it("serializes and deserializes without changing the log", () => {
    const log = runFleet().fleetReplayLog;

    expect(deserializeFleetReplayLog(serializeFleetReplayLog(log))).toEqual(
      log,
    );
  });

  it("rejects an eventCount mismatch", () => {
    const log = structuredClone(runFleet().fleetReplayLog);
    log.eventCount += 1;

    expect(validateFleetReplayLog(log).valid).toBe(false);
    expect(validateFleetReplayLog(log).errors[0]).toContain(
      "eventCount must equal summed robot event counts",
    );
  });

  it("rejects unsupported fleet replay versions", () => {
    const log = structuredClone(runFleet().fleetReplayLog);
    log.version = "99.0.0";

    expect(validateFleetReplayLog(log).errors).toContain(
      'Unsupported fleet replay log version "99.0.0"; expected "0.7.0".',
    );
  });

  it("creates independent, sorted per-robot logs", () => {
    const source = runFleet().fleetReplayLog.robotLogs;
    const reversed = Object.fromEntries(Object.entries(source).reverse());
    const log = createFleetReplayLog("created-fleet", reversed);

    expect(Object.keys(log.robotLogs)).toEqual(["patrol-alpha", "patrol-beta"]);
    expect(log.robotLogs).not.toBe(reversed);
  });
});
