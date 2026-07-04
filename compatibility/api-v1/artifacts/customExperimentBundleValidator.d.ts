import type { CustomExperimentBundleValidationResult } from "./customExperimentBundle.js";
/**
 * Custom entry keys are portable file names, not paths. The exporter adds the
 * `custom/` or `reports/` directory and the default extension.
 */
export declare const isSafeCustomExperimentFileName: (value: string) => boolean;
export declare const validateCustomExperimentBundle: (bundle: unknown) => CustomExperimentBundleValidationResult;
