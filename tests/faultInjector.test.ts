import { describe, expect, it } from "vitest";

import {
  FaultInjector,
  RobotSimulator,
  snapshotToJson,
} from "../src/index.js";

describe("FaultInjector", () => {
  it("injects a low battery fault", () => {
    const simulator = new RobotSimulator();
    simulator.injectFault({ type: "low_battery" });

    const snapshot = simulator.getSnapshot();
    expect(snapshot.batteryPercentage).toBeLessThanOrEqual(5);
    expect(snapshot.state).toBe("faulted");
  });

  it("raises motor temperatures and faults the robot", () => {
    const injector = new FaultInjector();
    const simulator = new RobotSimulator({ faultInjector: injector });
    injector.inject({ type: "motor_overheating" });

    const snapshot = simulator.getSnapshot();
    expect(snapshot.leftMotorTemperature).toBeGreaterThanOrEqual(105);
    expect(snapshot.rightMotorTemperature).toBeGreaterThanOrEqual(105);
    expect(snapshot.state).toBe("faulted");
  });

  it("serializes snapshots as valid JSON", () => {
    const snapshot = new RobotSimulator({ robotId: "json-test" }).getSnapshot();
    const output = snapshotToJson(snapshot, true);

    expect(JSON.parse(output)).toEqual(snapshot);
    expect(output).toContain("\n");
  });
});
