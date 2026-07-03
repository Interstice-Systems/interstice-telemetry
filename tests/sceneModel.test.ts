import { describe, expect, it } from "vitest";

import {
  createScene,
  deserializeScene,
  SCENE_MODEL_VERSION,
  serializeScene,
  type SceneInput,
} from "../src/index.js";

const pose = {
  translation: { x: 1, y: 2, z: 0 },
  rotation: { x: 0, y: 0, z: 0, w: 1 },
} as const;

const input: SceneInput = {
  id: "warehouse-1",
  name: "Warehouse",
  type: "warehouse",
  coordinateSystem: {
    frameId: "world",
    handedness: "right",
    lengthUnit: "meter",
    upAxis: "z",
  },
  landmarks: [
    {
      id: "dock",
      name: "Loading Dock",
      pose,
      semanticLabels: ["loading"],
    },
  ],
  staticObstacles: [
    {
      id: "shelf",
      name: "Shelf",
      pose,
      shape: { type: "box", size: [2, 1, 3] },
      semanticLabels: ["storage"],
    },
  ],
  annotations: [],
  regions: [
    {
      id: "aisle",
      name: "Aisle",
      boundary: [
        { x: 0, y: 0, z: 0 },
        { x: 5, y: 0, z: 0 },
        { x: 5, y: 2, z: 0 },
      ],
      semanticLabels: ["driveable"],
    },
  ],
  semanticLabels: ["indoor"],
  metadata: {},
};

describe("scene model", () => {
  it("serializes and deserializes deterministic metadata", () => {
    const scene = createScene(input);
    const json = serializeScene(scene);
    const restored = deserializeScene(json);

    expect(scene.schemaVersion).toBe(SCENE_MODEL_VERSION);
    expect(restored).toEqual(scene);
    expect(serializeScene(restored)).toBe(json);
    expect(Object.isFrozen(restored.regions[0]?.boundary)).toBe(true);
  });

  it("rejects identifiers reused across scene element kinds", () => {
    expect(() =>
      createScene({
        ...input,
        annotations: [
          {
            id: "dock",
            position: { x: 0, y: 0, z: 0 },
            text: "duplicate",
            semanticLabels: [],
          },
        ],
      }),
    ).toThrow(/unique/);
  });
});
