import {
  deterministicStringify,
  parseImmutableJson,
  toImmutableJson,
  type JsonValue,
} from "./deterministicJson.js";
import type {
  Transform,
  Vector3,
} from "./model.js";

export const SCENE_MODEL_VERSION = "1.0.0";

export const STANDARD_SCENE_TYPES = [
  "warehouse",
  "factory",
  "race-track",
  "outdoor-field",
  "laboratory",
  "custom",
] as const;

export type StandardSceneType = (typeof STANDARD_SCENE_TYPES)[number];

export interface SceneCoordinateSystem {
  readonly frameId: string;
  readonly handedness: "left" | "right";
  readonly lengthUnit: "millimeter" | "centimeter" | "meter" | "kilometer";
  readonly upAxis: "x" | "y" | "z";
}

export interface Landmark {
  readonly id: string;
  readonly name: string;
  readonly pose: Transform;
  readonly semanticLabels: readonly string[];
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export interface StaticObstacle {
  readonly id: string;
  readonly name: string;
  readonly pose: Transform;
  /** Descriptive shape data only; no collision semantics are implied. */
  readonly shape: Readonly<Record<string, JsonValue>>;
  readonly semanticLabels: readonly string[];
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export interface SceneAnnotation {
  readonly id: string;
  readonly position: Vector3;
  readonly text: string;
  readonly semanticLabels: readonly string[];
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export interface SceneRegion {
  readonly id: string;
  readonly name: string;
  /** Ordered boundary points expressed in the scene coordinate system. */
  readonly boundary: readonly Vector3[];
  readonly semanticLabels: readonly string[];
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export interface Scene {
  readonly schemaVersion: string;
  readonly id: string;
  readonly name: string;
  /** Standard values are listed in `STANDARD_SCENE_TYPES`; extensions are allowed. */
  readonly type: string;
  readonly coordinateSystem: SceneCoordinateSystem;
  readonly landmarks: readonly Landmark[];
  readonly staticObstacles: readonly StaticObstacle[];
  readonly annotations: readonly SceneAnnotation[];
  readonly regions: readonly SceneRegion[];
  readonly semanticLabels: readonly string[];
  readonly metadata: Readonly<Record<string, JsonValue>>;
}

export type SceneInput = Omit<Scene, "schemaVersion"> & {
  readonly schemaVersion?: string;
};

export const createScene = (input: SceneInput): Scene => {
  if (input.id.length === 0 || input.name.length === 0 || input.type.length === 0) {
    throw new TypeError("scene id, name, and type must not be empty");
  }

  const ids = [
    ...input.landmarks,
    ...input.staticObstacles,
    ...input.annotations,
    ...input.regions,
  ].map((item) => item.id);
  if (new Set(ids).size !== ids.length) {
    throw new TypeError("scene element ids must be unique");
  }

  return toImmutableJson(
    {
      ...input,
      schemaVersion: input.schemaVersion ?? SCENE_MODEL_VERSION,
    },
    "scene",
  );
};

export const serializeScene = (scene: Scene, pretty = false): string =>
  deterministicStringify(scene, pretty);

export const deserializeScene = (json: string): Scene =>
  createScene(parseImmutableJson<SceneInput>(json, "scene"));
