import type { FleetScenarioRunResult } from "../fleet/fleetTypes.js";
import type { ArtifactExportOptions, ArtifactWriteResult, TelemetrySummary } from "./artifactTypes.js";
export declare const createFleetTelemetrySummary: (result: FleetScenarioRunResult) => TelemetrySummary;
export declare const exportFleetRunArtifacts: (result: FleetScenarioRunResult, options?: ArtifactExportOptions) => ArtifactWriteResult;
