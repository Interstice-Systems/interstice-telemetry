import robotStateV11Document from "./fixtures/v1_1/robot-state.valid.json" with { type: "json" };
import sceneModelV11Document from "./fixtures/v1_1/scene-model.valid.json" with { type: "json" };
import twinTimelineV11Document from "./fixtures/v1_1/twin-timeline.valid.json" with { type: "json" };
import { toImmutableJson, type JsonValue } from "./deterministicJson.js";

export const DIGITAL_TWIN_FIXTURE_VERSION_V1_1 = "v1_1";

export const robotStateFixtureV1_1 = toImmutableJson(
  robotStateV11Document,
  "robotStateFixtureV1_1",
) as JsonValue;
export const sceneModelFixtureV1_1 = toImmutableJson(
  sceneModelV11Document,
  "sceneModelFixtureV1_1",
) as JsonValue;
export const twinTimelineFixtureV1_1 = toImmutableJson(
  twinTimelineV11Document,
  "twinTimelineFixtureV1_1",
) as JsonValue;
