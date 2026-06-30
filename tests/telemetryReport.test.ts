import { describe, expect, it } from "vitest";

import {
  renderTelemetrySnapshot,
  type TelemetrySnapshot,
} from "../src/index.js";

const snapshot: TelemetrySnapshot = {
  timestamp: "1970-01-01T00:00:01.000Z",
  robotId: "robot-001",
  state: "active",
  batteryPercentage: 86.2,
  batteryVoltage: 12.1,
  leftMotorRpm: 1_220,
  rightMotorRpm: 1_198,
  leftMotorTemperature: 54.2,
  rightMotorTemperature: 53.7,
  cpuUsage: 42,
  memoryUsage: 58,
  signalStrength: -67,
  imu: {
    acceleration: { x: 0.1, y: -0.2, z: 9.81 },
    gyro: { x: 0.01, y: 0.02, z: -0.01 },
  },
};

describe("renderTelemetrySnapshot", () => {
  it("renders power, motors, system health, and IMU data", () => {
    const report = renderTelemetrySnapshot(snapshot);

    expect(report).toContain("Robot: robot-001");
    expect(report).toContain("State: active");
    expect(report).toContain("Battery: 86.2%");
    expect(report).toContain("Voltage: 12.1V");
    expect(report).toContain("Left Temp: 54.2C");
    expect(report).toContain("Right Temp: 53.7C");
    expect(report).toContain("CPU: 42%");
    expect(report).toContain("Memory: 58%");
    expect(report).toContain("Signal: -67 dBm");
    expect(report).toContain("IMU:");
    expect(report).toContain("Accel: x=0.1, y=-0.2, z=9.81");
    expect(report).toContain("Gyro: x=0.01, y=0.02, z=-0.01");
  });

  it("is deterministic for the same snapshot", () => {
    expect(renderTelemetrySnapshot(snapshot)).toBe(
      renderTelemetrySnapshot(snapshot),
    );
  });
});
