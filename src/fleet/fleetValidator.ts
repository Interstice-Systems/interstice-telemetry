import type {
  FleetScenarioProfile,
  FleetValidationResult,
} from "./fleetTypes.js";
import { validateScenarioProfile } from "../scenarios/scenarioValidator.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const validateFleetScenario = (
  profile: unknown,
): FleetValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(profile)) {
    return {
      valid: false,
      errors: ["Fleet scenario profile must be an object."],
      warnings,
    };
  }

  if (!isNonEmptyString(profile.id)) {
    errors.push("Fleet scenario id is required.");
  }

  if (!isNonEmptyString(profile.name)) {
    errors.push("Fleet scenario name is required.");
  }

  if (
    typeof profile.durationMs !== "number" ||
    !Number.isFinite(profile.durationMs) ||
    profile.durationMs <= 0
  ) {
    errors.push("Fleet scenario durationMs must be a positive number.");
  }

  if (
    typeof profile.stepMs !== "number" ||
    !Number.isFinite(profile.stepMs) ||
    profile.stepMs <= 0
  ) {
    errors.push("Fleet scenario stepMs must be a positive number.");
  }

  if (
    typeof profile.stepMs === "number" &&
    Number.isFinite(profile.stepMs) &&
    typeof profile.durationMs === "number" &&
    Number.isFinite(profile.durationMs) &&
    profile.stepMs > profile.durationMs
  ) {
    errors.push("Fleet scenario stepMs must not be greater than durationMs.");
  }

  if (!Array.isArray(profile.robots) || profile.robots.length === 0) {
    errors.push("Fleet scenario robots must be a non-empty array.");
    return { valid: false, errors, warnings };
  }

  const robotIds = new Set<string>();

  profile.robots.forEach((robot, index) => {
    const label = `Fleet robot at index ${index}`;

    if (!isRecord(robot)) {
      errors.push(`${label} must be an object.`);
      return;
    }

    if (!isNonEmptyString(robot.robotId)) {
      errors.push(`${label} robotId is required.`);
      return;
    }

    if (robotIds.has(robot.robotId)) {
      errors.push(`Fleet robotId "${robot.robotId}" must be unique.`);
    }
    robotIds.add(robot.robotId);

    if (!isRecord(robot.scenario)) {
      errors.push(`${label} scenario must be an object.`);
      return;
    }

    const scenarioValidation = validateScenarioProfile({
      ...robot.scenario,
      robotId: robot.robotId,
    });

    for (const error of scenarioValidation.errors) {
      errors.push(`${label} scenario: ${error}`);
    }
    for (const warning of scenarioValidation.warnings) {
      warnings.push(`${label} scenario: ${warning}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

export const assertValidFleetScenario = (
  profile: FleetScenarioProfile,
): FleetValidationResult => {
  const validation = validateFleetScenario(profile);

  if (!validation.valid) {
    throw new TypeError(
      `Invalid fleet scenario profile: ${validation.errors.join(" ")}`,
    );
  }

  return validation;
};
