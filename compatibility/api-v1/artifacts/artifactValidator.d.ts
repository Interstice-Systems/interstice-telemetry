import { type ExperimentArtifactValidationResult } from "./artifactTypes.js";
export declare const isSafeRelativeArtifactPath: (value: string) => boolean;
export declare const validateExperimentArtifactBundle: (bundle: unknown) => ExperimentArtifactValidationResult;
