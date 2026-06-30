import {
  deserializeReplayLog,
  ReplayPlayer,
  ReplayRecorder,
  RobotSimulator,
  serializeReplayLog,
  TelemetryStream,
  validateReplayLog,
  type TelemetryEvent,
} from "../src/index.js";

const seed = 2025;
const simulator = new RobotSimulator({
  robotId: "replay-demo-rover",
  seed,
  initialState: "active",
});
const stream = new TelemetryStream(simulator);
const recorder = new ReplayRecorder({ robotId: simulator.robotId, seed });
const unsubscribeRecorder = stream.subscribe(recorder.record);

recorder.start();
stream.start();
stream.step(1_000);
stream.step(1_000);
stream.step(1_000);
stream.injectFault({ type: "low_battery", severity: 0.8 });
stream.step(1_000);
stream.stop();
recorder.stop();
unsubscribeRecorder();

const log = recorder.toLog({ example: "replay-log" });
const validation = validateReplayLog(log);
const loadedLog = deserializeReplayLog(serializeReplayLog(log));
const player = new ReplayPlayer(loadedLog);
const replayed: TelemetryEvent[] = [];

player.subscribe((event) => replayed.push(event));
player.start();
player.playAll();

console.log(`original events: ${log.eventCount}`);
console.log(`valid replay log: ${validation.valid}`);
console.log(
  `replayed: ${replayed
    .map((event) => `${event.sequence}:${event.type}`)
    .join(", ")}`,
);
