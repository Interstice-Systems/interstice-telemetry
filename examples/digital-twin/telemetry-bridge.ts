import {
  buildTwinTimelineFromTelemetry,
  type TelemetrySnapshot,
} from "../../src/index.js";

const snapshots: TelemetrySnapshot[] = [{
  timestamp: "2026-01-01T00:00:01.000Z",
  robotId: "rover-1",
  batteryPercentage: 80,
  batteryVoltage: 24,
  leftMotorRpm: 100,
  rightMotorRpm: 100,
  leftMotorTemperature: 30,
  rightMotorTemperature: 30,
  cpuUsage: 20,
  memoryUsage: 40,
  signalStrength: 90,
  imu: {
    acceleration: { x: 0, y: 0, z: 9.8 },
    gyro: { x: 0, y: 0, z: 0 },
  },
  state: "active",
}];

const timeline = buildTwinTimelineFromTelemetry("rover-1", snapshots);
console.log(`states: ${timeline.states.length}`);
