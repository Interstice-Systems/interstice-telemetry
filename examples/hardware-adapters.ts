import {
  AdapterTelemetryCollector,
  renderTelemetrySnapshot,
  validateHardwareAdapter,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
} from "../src/index.js";

const battery = new VirtualBatteryAdapter({
  id: "battery-main",
  percentage: 87.5,
  voltage: 24.6,
});
const motor = new VirtualMotorAdapter({
  id: "drive-motors",
  leftRpm: 122,
  rightRpm: 120,
  leftTemperatureC: 39.2,
  rightTemperatureC: 39.8,
});
const imu = new VirtualImuAdapter({
  id: "imu-main",
  acceleration: { x: 0.08, y: -0.03, z: 9.81 },
  gyro: { x: 0.01, y: 0.02, z: -0.01 },
});
const system = new VirtualSystemAdapter({
  id: "compute-main",
  cpuUsage: 38,
  memoryUsage: 52,
  signalStrength: -59,
});

const adapters = [battery, motor, imu, system];

console.log("HARDWARE ADAPTER VALIDATION");
for (const adapter of adapters) {
  const info = adapter.getInfo();
  console.log(`${info.id}: ${JSON.stringify(validateHardwareAdapter(adapter))}`);
}

const collector = new AdapterTelemetryCollector({
  robotId: "virtual-rover-006",
  battery,
  motor,
  imu,
  system,
  initialState: "active",
});

const readySnapshot = collector.collect("2026-01-01T00:00:00.000Z");
console.log(`\n${renderTelemetrySnapshot(readySnapshot)}`);

motor.setStatus("faulted");
const faultedSnapshot = collector.collect("2026-01-01T00:00:01.000Z");
console.log(`\n${renderTelemetrySnapshot(faultedSnapshot)}`);
console.log(`\nFinal inferred state: ${faultedSnapshot.state}`);
