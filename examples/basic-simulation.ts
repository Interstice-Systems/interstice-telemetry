import { RobotSimulator, snapshotToJson } from "../src/index.js";

const simulator = new RobotSimulator({
  robotId: "demo-rover",
  seed: 2025,
  initialState: "active",
});

for (let step = 0; step < 5; step += 1) {
  const snapshot = simulator.step(1_000);
  console.log(snapshotToJson(snapshot));
}
