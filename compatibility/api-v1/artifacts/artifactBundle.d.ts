import { type ExperimentArtifactBundle, type ExperimentArtifactBundleInput, type ExperimentArtifactMetadataDocument } from "./artifactTypes.js";
export declare const createExperimentArtifactBundle: (input: ExperimentArtifactBundleInput) => ExperimentArtifactBundle;
export declare const createArtifactMetadataDocument: (bundle: ExperimentArtifactBundle) => ExperimentArtifactMetadataDocument;
