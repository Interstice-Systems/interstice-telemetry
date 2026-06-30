import { describe, expect, it } from "vitest";

import {
  AdapterTelemetryCollector,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
} from "../src/index.js";

const createFixture = () => {
  const battery = new VirtualBatteryAdapter({
    percentage: 82,
    voltage: 24.4,
  });
  const motor = new VirtualMotorAdapter({
    leftRpm: 125,
    rightRpm: 123,
    leftTemperatureC: 38,
    rightTemperatureC: 39,
  });
  const imu = new VirtualImuAdapter({
    acceleration: { x: 0.1, y: 0.2, z: 9.81 },
    gyro: { x: 0.01, y: 0.02, z: 0.03 },
  });
  const system = new VirtualSystemAdapter({
    cpuUsage: 35,
    memoryUsage: 48,
    signalStrength: -61,
  });
  const collector = new AdapterTelemetryCollector({
    robotId: "adapter-rover",
    battery,
    motor,
    imu,
    system,
    initialState: "active",
  });

  return { battery, motor, imu, system, collector };
};

describe("AdapterTelemetryCollector", () => {
  it("produces a complete telemetry snapshot", () => {
    const { collector } = createFixture();

    expect(collector.collect(1_000)).toEqual({
      timestamp: "1970-01-01T00:00:01.000Z",
      robotId: "adapter-rover",
      batteryPercentage: 82,
      batteryVoltage: 24.4,
      leftMotorRpm: 125,
      rightMotorRpm: 123,
      leftMotorTemperature: 38,
      rightMotorTemperature: 39,
      cpuUsage: 35,
      memoryUsage: 48,
      signalStrength: -61,
      imu: {
        acceleration: { x: 0.1, y: 0.2, z: 9.81 },
        gyro: { x: 0.01, y: 0.02, z: 0.03 },
      },
      state: "active",
    });
  });

  it("preserves configured state while adapters are ready", () => {
    const { collector } = createFixture();

    expect(collector.collect(0).state).toBe("active");
    expect(collector.getState()).toBe("active");
  });

  it("infers faulted when any adapter is faulted", () => {
    const { collector, motor } = createFixture();

    motor.setStatus("faulted");

    expect(collector.collect(0).state).toBe("faulted");
    expect(collector.getState()).toBe("active");
  });

  it("infers offline when all adapters are offline", () => {
    const { collector, battery, motor, imu, system } = createFixture();

    battery.setStatus("offline");
    motor.setStatus("offline");
    imu.setStatus("offline");
    system.setStatus("offline");

    expect(collector.collect(0).state).toBe("offline");
  });

  it("updates configured state through setState", () => {
    const { collector } = createFixture();

    collector.setState("returning");

    expect(collector.getState()).toBe("returning");
    expect(collector.collect(0).state).toBe("returning");
  });

  it("is deterministic and does not mutate adapter readings", () => {
    const { collector, imu } = createFixture();
    const readingBefore = imu.read();

    const first = collector.collect("2026-01-01T00:00:00.000Z");
    const second = collector.collect("2026-01-01T00:00:00.000Z");

    expect(first).toEqual(second);
    expect(imu.read()).toEqual(readingBefore);
    first.imu.acceleration.x = 99;
    expect(imu.read()).toEqual(readingBefore);
  });

  it("rejects invalid timestamps", () => {
    const { collector } = createFixture();

    expect(() => collector.collect("not-a-date")).toThrow(TypeError);
  });
});
