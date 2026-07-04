import type { ScenarioRunResult } from "../scenarios/scenarioTypes.js";
import type { ArtifactExportOptions, ArtifactWriteResult, TelemetrySummary } from "./artifactTypes.js";
export declare const createScenarioTelemetrySummary: (result: ScenarioRunResult) => TelemetrySummary;
export declare const exportScenarioRunArtifacts: (result: ScenarioRunResult, options?: ArtifactExportOptions) => ArtifactWriteResult;
