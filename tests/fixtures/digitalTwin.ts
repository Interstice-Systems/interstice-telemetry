import type { RobotStateInput } from "../../src/index.js";

export const stateInput = (
  timestamp = 1_000,
  charge = 0.8,
): RobotStateInput => ({
  timestamp,
  robotId: "rover-1",
  globalPose: {
    frameId: "world",
    position: { x: timestamp / 1_000, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 0, w: 1 },
  },
  linearVelocity: { x: 1, y: 0, z: 0 },
  angularVelocity: { x: 0, y: 0, z: 0.1 },
  jointStates: {
    right_wheel: { position: 2, velocity: 1 },
    left_wheel: { position: 2, velocity: 1 },
  },
  actuatorOutputs: { right_motor: 0.5, left_motor: 0.5 },
  sensorValues: { imu: { yawRate: 0.1 }, gps: [1, 2, 3] },
  batteryStatus: { charge, voltage: 24 },
  healthIndicators: [{ id: "system", level: "nominal" }],
  metadata: { mode: "autonomous" },
});
