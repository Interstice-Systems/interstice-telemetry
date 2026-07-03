import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import {
  deserializeRobot,
  deserializeScene,
  deserializeTwinTimeline,
  serializeRobot,
  serializeScene,
  serializeTwinTimeline,
} from "../src/index.js";

const load = (relativePath: string): string =>
  readFileSync(
    fileURLToPath(new URL(`../examples/digital-twin/${relativePath}`, import.meta.url)),
    "utf8",
  );

describe("digital twin JSON examples", () => {
  it.each([
    "robots/differential-drive.json",
    "robots/quadrotor.json",
    "robots/humanoid-minimal.json",
  ])("loads robot example %s", (path) => {
    const robot = deserializeRobot(load(path));
    expect(deserializeRobot(serializeRobot(robot))).toEqual(robot);
  });

  it.each([
    "scenes/warehouse.json",
    "scenes/obstacle-course.json",
    "scenes/robotics-lab.json",
  ])("loads scene example %s", (path) => {
    const scene = deserializeScene(load(path));
    expect(deserializeScene(serializeScene(scene))).toEqual(scene);
  });

  it("loads the movement, battery, sensor, and event timeline", () => {
    const timeline = deserializeTwinTimeline(
      load("timelines/rover-mission.json"),
    );

    expect(timeline.states).toHaveLength(3);
    expect(timeline.events.map((event) => event.type)).toEqual([
      "mission.started",
      "battery.warning",
      "mission.completed",
    ]);
    expect(deserializeTwinTimeline(serializeTwinTimeline(timeline))).toEqual(
      timeline,
    );
  });
});
