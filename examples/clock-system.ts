import {
  FleetClock,
  LogicalClock,
  ReplayClock,
  ReplayRecorder,
  RobotSimulator,
  SimulationClock,
  TelemetryStream,
} from "../src/index.js";

const simulationClock = new SimulationClock({
  id: "simulation-main",
  metadata: { experiment: "clock-example" },
});
simulationClock.step(250);

const logicalClock = new LogicalClock({
  id: "event-order",
  tickSizeMs: 10,
});
logicalClock.tick();
logicalClock.tick();

const streamClock = new SimulationClock({ id: "stream-main" });
const stream = new TelemetryStream(
  new RobotSimulator({ robotId: "clock-rover", seed: 10 }),
  streamClock,
);
const recorder = new ReplayRecorder({
  robotId: "clock-rover",
  createdAt: 0,
});
const unsubscribe = stream.subscribe(recorder.record);
recorder.start();
stream.start();
stream.step(100);
stream.step(150);
stream.stop();
recorder.stop();
unsubscribe();

const replayClock = new ReplayClock(recorder.getEvents(), {
  id: "replay-main",
});
replayClock.advanceToNextEvent();

const fleetClock = new FleetClock({ id: "fleet-main" });
fleetClock.step(500);

for (const info of [
  simulationClock.getInfo(),
  logicalClock.getInfo(),
  streamClock.getInfo(),
  replayClock.getInfo(),
  fleetClock.getInfo(),
]) {
  console.log(
    `${info.id}: kind=${info.kind} time=${info.currentTimeMs}ms steps=${info.stepCount}`,
  );
}
