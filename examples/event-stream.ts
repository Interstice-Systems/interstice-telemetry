import {
  RobotSimulator,
  TelemetryStream,
  type TelemetryEvent,
} from "../src/index.js";

const simulator = new RobotSimulator({
  robotId: "stream-demo-rover",
  seed: 2025,
  initialState: "active",
});
const stream = new TelemetryStream(simulator);

stream.subscribe((event: TelemetryEvent) => {
  console.log(JSON.stringify(event));
});

stream.start();
stream.step(1_000);
stream.step(1_000);
stream.step(1_000);
stream.injectFault({ type: "low_battery", severity: 0.8 });
stream.step(1_000);
stream.stop();
