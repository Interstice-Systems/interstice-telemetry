import {
  CLOCK_KINDS,
  type ClockInfo,
  type ClockValidationResult,
  type DeterministicClock,
} from "./clockTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const validateClock = (clock: unknown): ClockValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(clock)) {
    return {
      valid: false,
      errors: ["clock must exist and be an object"],
      warnings,
    };
  }

  if (typeof clock.now !== "function") {
    errors.push("clock.now must be a function");
  }
  if (typeof clock.step !== "function") {
    errors.push("clock.step must be a function");
  }
  if (typeof clock.reset !== "function") {
    errors.push("clock.reset must be a function");
  }
  if (typeof clock.getInfo !== "function") {
    errors.push("clock.getInfo must be a function");
  }
  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  let now: unknown;
  let info: unknown;
  try {
    now = (clock as unknown as DeterministicClock).now();
  } catch {
    errors.push("clock.now must not throw");
  }
  try {
    info = (clock as unknown as DeterministicClock).getInfo();
  } catch {
    errors.push("clock.getInfo must not throw");
  }

  if (typeof now !== "number" || !Number.isFinite(now)) {
    errors.push("clock.now must return a finite number");
  } else if (now < 0) {
    errors.push("clock current time must be non-negative");
  }

  if (!isRecord(info)) {
    errors.push("clock.getInfo must return an object");
    return { valid: false, errors, warnings };
  }

  const clockInfo = info as unknown as ClockInfo;
  if (typeof clockInfo.id !== "string" || clockInfo.id.length === 0) {
    errors.push("clock info id must be a non-empty string");
  }
  if (
    typeof clockInfo.kind !== "string" ||
    !CLOCK_KINDS.includes(clockInfo.kind)
  ) {
    errors.push("clock info kind must be a known clock kind");
  }
  if (
    typeof clockInfo.currentTimeMs !== "number" ||
    !Number.isFinite(clockInfo.currentTimeMs) ||
    clockInfo.currentTimeMs < 0
  ) {
    errors.push("clock info currentTimeMs must be a non-negative finite number");
  }
  if (
    typeof clockInfo.stepCount !== "number" ||
    !Number.isInteger(clockInfo.stepCount) ||
    clockInfo.stepCount < 0
  ) {
    errors.push("clock info stepCount must be a non-negative integer");
  }
  if (
    typeof now === "number" &&
    Number.isFinite(now) &&
    typeof clockInfo.currentTimeMs === "number" &&
    clockInfo.currentTimeMs !== now
  ) {
    errors.push("clock info currentTimeMs must match clock.now()");
  }
  if (clockInfo.metadata !== undefined && !isRecord(clockInfo.metadata)) {
    warnings.push("clock info metadata should be an object when provided");
  }

  return { valid: errors.length === 0, errors, warnings };
};
