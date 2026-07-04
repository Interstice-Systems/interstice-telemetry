import { validateEvidenceManifest } from "../evidence/evidenceManifestValidator.js";
import { validateReplayLog } from "../replay/replayValidator.js";
import type { CustomExperimentBundleValidationResult } from "./customExperimentBundle.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/**
 * Custom entry keys are portable file names, not paths. The exporter adds the
 * `custom/` or `reports/` directory and the default extension.
 */
export const isSafeCustomExperimentFileName = (value: string): boolean =>
  /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value) &&
  value !== "." &&
  value !== "..";

const outputName = (name: string, extension: ".json" | ".txt"): string =>
  name.endsWith(extension) ? name : `${name}${extension}`;

const validateNamedRecord = (
  value: unknown,
  label: string,
  extension: ".json" | ".txt",
  errors: string[],
  paths: Set<string>,
): value is Record<string, unknown> => {
  if (value === undefined) return false;
  if (!isRecord(value)) {
    errors.push(`${label} must be an object.`);
    return false;
  }

  for (const key of Object.keys(value)) {
    if (!isSafeCustomExperimentFileName(key)) {
      errors.push(`${label} key "${key}" must be a safe file name.`);
      continue;
    }
    const path = outputName(key, extension);
    if (paths.has(path)) {
      errors.push(`${label} keys produce duplicate file name "${path}".`);
    }
    paths.add(path);
  }
  return true;
};

export const validateCustomExperimentBundle = (
  bundle: unknown,
): CustomExperimentBundleValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(bundle)) {
    return {
      valid: false,
      errors: ["Custom experiment bundle must be an object."],
      warnings,
    };
  }

  if (!isNonEmptyString(bundle.experimentId)) {
    errors.push("Custom experiment experimentId is required.");
  }

  if (!isRecord(bundle.metadata)) {
    errors.push("Custom experiment metadata is required.");
  } else {
    if (!isNonEmptyString(bundle.metadata.name)) {
      errors.push("Custom experiment metadata name is required.");
    }
    if (bundle.metadata.robotIds !== undefined) {
      if (!Array.isArray(bundle.metadata.robotIds)) {
        errors.push("Custom experiment metadata robotIds must be an array.");
      } else if (!bundle.metadata.robotIds.every(isNonEmptyString)) {
        errors.push(
          "Custom experiment metadata robotIds must contain only non-empty strings.",
        );
      }
    }
  }

  if (
    bundle.createdAt !== undefined &&
    (!(bundle.createdAt instanceof Date) &&
      typeof bundle.createdAt !== "string" &&
      typeof bundle.createdAt !== "number" ||
      !Number.isFinite(new Date(bundle.createdAt).getTime()))
  ) {
    errors.push("Custom experiment createdAt must be a valid date.");
  }

  if (bundle.evidence !== undefined && !isRecord(bundle.evidence)) {
    errors.push("Custom experiment evidence must be an object.");
  } else if (isRecord(bundle.evidence)) {
    if (bundle.evidence.replayLog !== undefined) {
      const replayValidation = validateReplayLog(bundle.evidence.replayLog);
      errors.push(
        ...replayValidation.errors.map((error) => `Replay log: ${error}`),
      );
      warnings.push(
        ...replayValidation.warnings.map((warning) => `Replay log: ${warning}`),
      );
    }

    if (bundle.evidence.evidenceManifest !== undefined) {
      const manifestValidation = validateEvidenceManifest(
        bundle.evidence.evidenceManifest,
      );
      errors.push(
        ...manifestValidation.errors.map(
          (error) => `Evidence manifest: ${error}`,
        ),
      );
      warnings.push(
        ...manifestValidation.warnings.map(
          (warning) => `Evidence manifest: ${warning}`,
        ),
      );
      if (
        isRecord(bundle.evidence.evidenceManifest) &&
        isNonEmptyString(bundle.experimentId) &&
        bundle.evidence.evidenceManifest.experimentId !== bundle.experimentId
      ) {
        errors.push(
          "Evidence manifest experimentId must match the custom experiment.",
        );
      }
    }

    if (bundle.evidence.provenance === undefined) {
      warnings.push("Custom experiment evidence has no provenance.");
    }
  }

  const customPaths = new Set<string>();
  if (
    validateNamedRecord(
      bundle.customJson,
      "Custom JSON",
      ".json",
      errors,
      customPaths,
    )
  ) {
    for (const [key, value] of Object.entries(bundle.customJson)) {
      try {
        if (JSON.stringify(value) === undefined) {
          errors.push(`Custom JSON value "${key}" is not JSON serializable.`);
        }
      } catch {
        errors.push(`Custom JSON value "${key}" is not JSON serializable.`);
      }
    }
  }

  const reportPaths = new Set<string>();
  if (
    validateNamedRecord(
      bundle.reports,
      "Report",
      ".txt",
      errors,
      reportPaths,
    )
  ) {
    for (const [key, value] of Object.entries(bundle.reports)) {
      if (typeof value !== "string") {
        errors.push(`Report "${key}" must be a string.`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};
