import type { CustomExperimentBundle, CustomExperimentBundleInput, CustomExperimentExportOptions } from "./customExperimentBundle.js";
import type { ArtifactWriteResult } from "./artifactTypes.js";
export declare const createCustomExperimentBundle: (input: CustomExperimentBundleInput) => CustomExperimentBundle;
export declare const exportCustomExperimentBundle: (input: CustomExperimentBundleInput | CustomExperimentBundle, options?: CustomExperimentExportOptions) => ArtifactWriteResult;
export declare const renderCustomExperimentSummary: (bundle: CustomExperimentBundle) => string;
