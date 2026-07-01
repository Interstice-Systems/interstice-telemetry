import {
  AdapterTelemetryStream,
  ReplayRecorder,
  renderEventTimeline,
  renderReplayReport,
  validateReplayLog,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
} from "../src/index.js";

const battery = new VirtualBatteryAdapter({
  id: "battery-main",
  percentage: 84,
  voltage: 24.5,
  percentageChangePerSecond: -0.5,
});
const motor = new VirtualMotorAdapter({ id: "drive-motors" });
const imu = new VirtualImuAdapter({ id: "imu-main" });
const system = new VirtualSystemAdapter({ id: "compute-main" });

const stream = new AdapterTelemetryStream({
  robotId: "adapter-stream-rover",
  battery,
  motor,
  imu,
  system,
  initialState: "active",
  startTime: "2026-01-01T00:00:00.000Z",
  emitReadingChanges: true,
});
const recorder = new ReplayRecorder();
const unsubscribe = stream.subscribe(recorder.record);

recorder.start();
stream.start();
stream.step(1_000);
motor.setReading({ leftRpm: 120, rightRpm: 118 });
stream.step(1_000);
motor.setStatus("degraded");
stream.step(1_000);
stream.stop();
recorder.stop();
unsubscribe();

const log = recorder.toLog({ source: "virtual-hardware-adapters" });
const validation = validateReplayLog(log);
if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}

console.log(
  renderEventTimeline(log.events, { includePayloadSummary: true }),
);
console.log(`\n${renderReplayReport(log)}`);
