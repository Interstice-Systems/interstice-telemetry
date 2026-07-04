import type { ArtifactFileContents, ArtifactWriteOptions, ArtifactWriteResult, ExperimentArtifactBundle } from "./artifactTypes.js";
export declare const DEFAULT_ARTIFACT_ROOT = "artifacts";
export declare const sanitizeArtifactPathSegment: (value: string) => string;
export declare const writeExperimentArtifacts: (bundle: ExperimentArtifactBundle, contents: ArtifactFileContents, options?: ArtifactWriteOptions) => ArtifactWriteResult;
