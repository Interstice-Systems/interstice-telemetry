import { isAbsolute, posix, win32 } from "node:path";

import {
  EXPERIMENT_ARTIFACT_FILE_KINDS,
  EXPERIMENT_ARTIFACT_FORMATS,
  EXPERIMENT_ARTIFACT_KINDS,
  EXPERIMENT_ARTIFACT_VERSION,
  type ExperimentArtifactValidationResult,
} from "./artifactTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isSafeRelativeArtifactPath = (value: string): boolean => {
  const normalized = value.replaceAll("\\", "/");

  return (
    isNonEmptyString(value) &&
    !isAbsolute(value) &&
    !posix.isAbsolute(normalized) &&
    !win32.isAbsolute(value) &&
    normalized.split("/").every((segment) => segment !== "..") &&
    normalized !== "."
  );
};

export const validateExperimentArtifactBundle = (
  bundle: unknown,
): ExperimentArtifactValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(bundle)) {
    return {
      valid: false,
      errors: ["Experiment artifact bundle must be an object."],
      warnings,
    };
  }

  if (!isNonEmptyString(bundle.version)) {
    errors.push("Experiment artifact bundle version is required.");
  } else if (bundle.version !== EXPERIMENT_ARTIFACT_VERSION) {
    errors.push(
      `Unsupported experiment artifact version "${bundle.version}"; expected "${EXPERIMENT_ARTIFACT_VERSION}".`,
    );
  }

  if (!isNonEmptyString(bundle.experimentId)) {
    errors.push("Experiment artifact bundle experimentId is required.");
  }

  if (
    typeof bundle.kind !== "string" ||
    !(EXPERIMENT_ARTIFACT_KINDS as readonly string[]).includes(bundle.kind)
  ) {
    errors.push(`Unknown experiment artifact kind "${String(bundle.kind)}".`);
  }

  if (!isRecord(bundle.metadata)) {
    errors.push("Experiment artifact bundle metadata is required.");
  } else {
    if (!isNonEmptyString(bundle.metadata.name)) {
      errors.push("Experiment metadata name is required.");
    }

    if (
      !Array.isArray(bundle.metadata.robotIds) ||
      (bundle.kind !== "custom" && bundle.metadata.robotIds.length === 0)
    ) {
      errors.push(
        bundle.kind === "custom"
          ? "Experiment metadata robotIds must be an array."
          : "Experiment metadata robotIds must not be empty.",
      );
    } else if (!bundle.metadata.robotIds.every(isNonEmptyString)) {
      errors.push("Experiment metadata robotIds must contain only strings.");
    }
  }

  if (!Array.isArray(bundle.files) || bundle.files.length === 0) {
    errors.push("Experiment artifact bundle files must not be empty.");
  } else {
    const paths = new Set<string>();

    bundle.files.forEach((file, index) => {
      const label = `Artifact file at index ${index}`;

      if (!isRecord(file)) {
        errors.push(`${label} must be an object.`);
        return;
      }

      if (!isNonEmptyString(file.path)) {
        errors.push(`${label} path is required.`);
      } else {
        if (!isSafeRelativeArtifactPath(file.path)) {
          errors.push(`${label} path must be a safe relative path.`);
        }
        if (paths.has(file.path)) {
          errors.push(`${label} path "${file.path}" is duplicated.`);
        }
        paths.add(file.path);
      }

      if (
        typeof file.kind !== "string" ||
        !(EXPERIMENT_ARTIFACT_FILE_KINDS as readonly string[]).includes(
          file.kind,
        )
      ) {
        errors.push(`${label} has unknown kind "${String(file.kind)}".`);
      }

      if (
        typeof file.format !== "string" ||
        !(EXPERIMENT_ARTIFACT_FORMATS as readonly string[]).includes(
          file.format,
        )
      ) {
        errors.push(`${label} has unknown format "${String(file.format)}".`);
      }
    });
  }

  return { valid: errors.length === 0, errors, warnings };
};
