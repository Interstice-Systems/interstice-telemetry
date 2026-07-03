# RobotState

`RobotState` is the complete deterministic state of one robot at one
timestamp. Unlike `TelemetrySnapshot`, which is an observation contract,
`RobotState` is the normalized state reconstructed from one or more
observations.

The state contains a global pose (position, quaternion orientation, and frame),
linear and angular velocity, keyed joint states, keyed actuator outputs, keyed
sensor values, optional battery status, health indicators, and metadata.
Sensor and actuator values are intentionally JSON-valued because different
robot classes require different measurements. Stable identifiers connect
these maps to `Robot.sensors`, `Robot.actuators`, and `Robot.joints`.

```ts
import {
  createRobotState,
  serializeRobotState,
} from "interstice-telemetry";

const state = createRobotState({
  timestamp: 1_000,
  robotId: "rover-1",
  globalPose: {
    frameId: "world",
    position: { x: 1, y: 0, z: 0 },
    orientation: { x: 0, y: 0, z: 0, w: 1 },
  },
  linearVelocity: { x: 1, y: 0, z: 0 },
  angularVelocity: { x: 0, y: 0, z: 0 },
  jointStates: { left_wheel: { position: 2, velocity: 1 } },
  actuatorOutputs: { left_motor: 0.4 },
  sensorValues: { imu: { yawRate: 0 } },
  batteryStatus: { charge: 0.9, voltage: 24 },
  healthIndicators: [{ id: "system", level: "nominal" }],
  metadata: { mode: "autonomous" },
});

const canonicalJson = serializeRobotState(state, true);
```

Factories enforce finite JSON values, non-negative integer timestamps, valid
battery charge, an explicit robot identifier, ownership isolation, and deep
runtime immutability. `robotStatesEqual` compares canonical serialized values;
it does not depend on object identity or map insertion order.

Health levels are machine-oriented and ordered only by application policy.
Metadata may enrich inspection, but values required to reproduce behavior
belong in named state fields or versioned application schemas—not informal
metadata conventions.
