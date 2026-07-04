import { type JsonValue } from "./deterministicJson.js";
export type DigitalTwinSchemaName = "robot-state" | "scene-model" | "twin-timeline";
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
export declare const robotStateSchema: JsonValue;
export declare const sceneModelSchema: JsonValue;
export declare const twinTimelineSchema: JsonValue;
export declare const validateDigitalTwinSchema: (schema: DigitalTwinSchemaName, value: unknown) => SchemaValidationResult;
export declare const validateRobotStateSchema: (value: unknown) => SchemaValidationResult;
export declare const validateSceneModelSchema: (value: unknown) => SchemaValidationResult;
export declare const validateTwinTimelineSchema: (value: unknown) => SchemaValidationResult;
