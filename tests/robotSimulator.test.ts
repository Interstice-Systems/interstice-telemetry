import { describe, expect, it } from "vitest";

import { RobotSimulator } from "../src/index.js";

describe("RobotSimulator", () => {
  it("produces snapshots with all required telemetry fields", () => {
    const snapshot = new RobotSimulator().getSnapshot();

    expect(snapshot).toMatchObject({
      timestamp: expect.any(String),
      robotId: expect.any(String),
      batteryPercentage: expect.any(Number),
      batteryVoltage: expect.any(Number),
      leftMotorRpm: expect.any(Number),
      rightMotorRpm: expect.any(Number),
      leftMotorTemperature: expect.any(Number),
      rightMotorTemperature: expect.any(Number),
      cpuUsage: expect.any(Number),
      memoryUsage: expect.any(Number),
      signalStrength: expect.any(Number),
      imu: {
        acceleration: {
          x: expect.any(Number),
          y: expect.any(Number),
          z: expect.any(Number),
        },
        gyro: {
          x: expect.any(Number),
          y: expect.any(Number),
          z: expect.any(Number),
        },
      },
      state: expect.any(String),
    });
  });

  it("is deterministic for the same seed and inputs", () => {
    const first = new RobotSimulator({ seed: 42, initialState: "active" });
    const second = new RobotSimulator({ seed: 42, initialState: "active" });

    expect(first.getSnapshot()).toEqual(second.getSnapshot());
    expect(first.step(1_000)).toEqual(second.step(1_000));
    expect(first.step(2_500)).toEqual(second.step(2_500));
  });

  it("decreases battery charge during active operation", () => {
    const simulator = new RobotSimulator({ initialState: "active" });
    const before = simulator.getSnapshot().batteryPercentage;
    const after = simulator.step(60_000).batteryPercentage;

    expect(after).toBeLessThan(before);
  });

  it("rejects invalid step durations", () => {
    const simulator = new RobotSimulator();

    expect(() => simulator.step(0)).toThrow(RangeError);
  });
});
