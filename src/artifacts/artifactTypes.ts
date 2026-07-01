import type { RobotState } from "../types.js";

export const EXPERIMENT_ARTIFACT_VERSION = "0.8.0";

export const EXPERIMENT_ARTIFACT_KINDS = [
  "scenario",
  "fleet",
] as const;

export type ExperimentArtifactKind =
  (typeof EXPERIMENT_ARTIFACT_KINDS)[number];

export const EXPERIMENT_ARTIFACT_FILE_KINDS = [
  "metadata",
  "scenario",
  "fleet-scenario",
  "replay-log",
  "fleet-replay-log",
  "report",
  "validation",
  "telemetry-summary",
] as const;

export type ExperimentArtifactFileKind =
  (typeof EXPERIMENT_ARTIFACT_FILE_KINDS)[number];

export const EXPERIMENT_ARTIFACT_FORMATS = ["json", "txt"] as const;

export type ExperimentArtifactFormat =
  (typeof EXPERIMENT_ARTIFACT_FORMATS)[number];

export interface ExperimentMetadata {
  name: string;
  description?: string;
  scenarioId?: string;
  fleetId?: string;
  robotIds: string[];
  tags?: string[];
  source?: string;
}

export interface ExperimentArtifactFile {
  path: string;
  kind: ExperimentArtifactFileKind;
  format: ExperimentArtifactFormat;
  description?: string;
}

export interface ExperimentArtifactBundle {
  version: string;
  experimentId: string;
  createdAt: string;
  kind: ExperimentArtifactKind;
  metadata: ExperimentMetadata;
  files: ExperimentArtifactFile[];
}

export interface ExperimentArtifactBundleInput {
  experimentId: string;
  kind: ExperimentArtifactKind;
  metadata: ExperimentMetadata;
  files: ExperimentArtifactFile[];
  createdAt?: Date | string | number;
  version?: string;
}

export interface ExperimentArtifactValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ArtifactWriteOptions {
  rootDir?: string;
  overwrite?: boolean;
}

export type ArtifactFileContents = Readonly<Record<string, unknown>>;

export interface ArtifactWriteResult {
  experimentPath: string;
  bundle: ExperimentArtifactBundle;
  files: string[];
}

export interface ExperimentArtifactMetadataDocument {
  version: string;
  experimentId: string;
  createdAt: string;
  kind: ExperimentArtifactKind;
  metadata: ExperimentMetadata;
}

export interface LoadedExperimentArtifactFile extends ExperimentArtifactFile {
  content: unknown;
}

export interface LoadedExperimentArtifacts {
  experimentPath: string;
  bundle: ExperimentArtifactBundle;
  metadata: ExperimentMetadata;
  files: LoadedExperimentArtifactFile[];
  validation: ExperimentArtifactValidationResult;
  warnings: string[];
}

export interface TelemetrySummary {
  robotIds: string[];
  eventCount: number;
  faultCount: number;
  finalStates: Record<string, RobotState>;
  durationMs: number;
}

export interface ArtifactExportOptions extends ArtifactWriteOptions {
  experimentId?: string;
  createdAt?: Date | string | number;
  metadata?: Partial<ExperimentMetadata>;
}
