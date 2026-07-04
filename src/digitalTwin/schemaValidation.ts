import {
  Ajv2020,
  type ErrorObject,
  type ValidateFunction,
} from "ajv/dist/2020.js";

import robotStateSchemaDocument from "./schemas/robot-state.schema.json" with { type: "json" };
import sceneModelSchemaDocument from "./schemas/scene-model.schema.json" with { type: "json" };
import twinTimelineSchemaDocument from "./schemas/twin-timeline.schema.json" with { type: "json" };
import { toImmutableJson, type JsonValue } from "./deterministicJson.js";

export type DigitalTwinSchemaName =
  | "robot-state"
  | "scene-model"
  | "twin-timeline";

export interface SchemaValidationIssue {
  readonly instancePath: string;
  readonly schemaPath: string;
  readonly keyword: string;
  readonly message: string;
}

export interface SchemaValidationResult {
  readonly valid: boolean;
  readonly issues: readonly SchemaValidationIssue[];
}

export const robotStateSchema = toImmutableJson(
  robotStateSchemaDocument,
  "robotStateSchema",
) as JsonValue;
export const sceneModelSchema = toImmutableJson(
  sceneModelSchemaDocument,
  "sceneModelSchema",
) as JsonValue;
export const twinTimelineSchema = toImmutableJson(
  twinTimelineSchemaDocument,
  "twinTimelineSchema",
) as JsonValue;

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  strictNumbers: true,
});

ajv.addSchema(robotStateSchemaDocument);
const validators: Readonly<Record<DigitalTwinSchemaName, ValidateFunction>> = {
  "robot-state": ajv.getSchema(robotStateSchemaDocument.$id)!,
  "scene-model": ajv.compile(sceneModelSchemaDocument),
  "twin-timeline": ajv.compile(twinTimelineSchemaDocument),
};

const compareIssues = (
  left: SchemaValidationIssue,
  right: SchemaValidationIssue,
): number =>
  left.instancePath.localeCompare(right.instancePath) ||
  left.schemaPath.localeCompare(right.schemaPath) ||
  left.keyword.localeCompare(right.keyword) ||
  left.message.localeCompare(right.message);

const toIssue = (error: ErrorObject): SchemaValidationIssue => ({
  instancePath: error.instancePath,
  schemaPath: error.schemaPath,
  keyword: error.keyword,
  message: error.message ?? "schema validation failed",
});

export const validateDigitalTwinSchema = (
  schema: DigitalTwinSchemaName,
  value: unknown,
): SchemaValidationResult => {
  const validator = validators[schema];
  const valid = validator(value);
  const issues = valid
    ? []
    : (validator.errors ?? []).map(toIssue).sort(compareIssues);

  return toImmutableJson({ valid, issues }, "schemaValidationResult");
};

export const validateRobotStateSchema = (
  value: unknown,
): SchemaValidationResult => validateDigitalTwinSchema("robot-state", value);

export const validateSceneModelSchema = (
  value: unknown,
): SchemaValidationResult => validateDigitalTwinSchema("scene-model", value);

export const validateTwinTimelineSchema = (
  value: unknown,
): SchemaValidationResult => validateDigitalTwinSchema("twin-timeline", value);
