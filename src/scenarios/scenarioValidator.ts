import { FAULT_TYPES } from "../faults/faultTypes.js";
import type {
  ScenarioValidationResult,
} from "./scenarioTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const validateScenarioProfile = (
  profile: unknown,
): ScenarioValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(profile)) {
    return {
      valid: false,
      errors: ["Scenario profile must be an object."],
      warnings,
    };
  }

  if (!isNonEmptyString(profile.id)) {
    errors.push("Scenario id is required.");
  }

  if (!isNonEmptyString(profile.name)) {
    errors.push("Scenario name is required.");
  }

  if (
    typeof profile.durationMs !== "number" ||
    !Number.isFinite(profile.durationMs) ||
    profile.durationMs <= 0
  ) {
    errors.push("Scenario durationMs must be a positive number.");
  }

  if (
    typeof profile.stepMs !== "number" ||
    !Number.isFinite(profile.stepMs) ||
    profile.stepMs <= 0
  ) {
    errors.push("Scenario stepMs must be a positive number.");
  }

  if (
    typeof profile.stepMs === "number" &&
    Number.isFinite(profile.stepMs) &&
    typeof profile.durationMs === "number" &&
    Number.isFinite(profile.durationMs) &&
    profile.stepMs > profile.durationMs
  ) {
    errors.push("Scenario stepMs must not be greater than durationMs.");
  }

  if (
    profile.robotId !== undefined &&
    !isNonEmptyString(profile.robotId)
  ) {
    errors.push("Scenario robotId must not be empty.");
  }

  if (profile.faults !== undefined && !Array.isArray(profile.faults)) {
    errors.push("Scenario faults must be an array.");
  } else if (Array.isArray(profile.faults)) {
    profile.faults.forEach((scheduledFault, index) => {
      const label = `Scheduled fault at index ${index}`;

      if (!isRecord(scheduledFault)) {
        errors.push(`${label} must be an object.`);
        return;
      }

      if (
        typeof scheduledFault.atMs !== "number" ||
        !Number.isFinite(scheduledFault.atMs) ||
        scheduledFault.atMs < 0
      ) {
        errors.push(`${label} atMs must be a non-negative number.`);
      } else if (
        typeof profile.durationMs === "number" &&
        Number.isFinite(profile.durationMs) &&
        scheduledFault.atMs > profile.durationMs
      ) {
        errors.push(`${label} must not occur after durationMs.`);
      }

      if (
        !isRecord(scheduledFault.fault) ||
        typeof scheduledFault.fault.type !== "string" ||
        !(FAULT_TYPES as readonly string[]).includes(
          scheduledFault.fault.type,
        )
      ) {
        errors.push(`${label} must contain a known fault type.`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};
