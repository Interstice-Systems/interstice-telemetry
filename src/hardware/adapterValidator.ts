import type {
  HardwareAdapterInfo,
  HardwareAdapterValidationResult,
} from "./hardwareTypes.js";
import { HARDWARE_ADAPTER_STATUSES } from "./hardwareTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validateInfo = (
  info: unknown,
  errors: string[],
  warnings: string[],
): void => {
  if (!isRecord(info)) {
    errors.push("getInfo() must return an object");
    return;
  }

  for (const field of ["id", "kind", "name"] satisfies Array<
    keyof HardwareAdapterInfo
  >) {
    if (!isNonEmptyString(info[field])) {
      errors.push(`adapter info ${field} must be a non-empty string`);
    }
  }

  if (
    typeof info.status !== "string" ||
    !HARDWARE_ADAPTER_STATUSES.includes(
      info.status as (typeof HARDWARE_ADAPTER_STATUSES)[number],
    )
  ) {
    errors.push("adapter info status must be a known hardware adapter status");
  }

  if (info.metadata !== undefined && !isRecord(info.metadata)) {
    warnings.push("adapter info metadata should be an object when provided");
  }
};

export const validateHardwareAdapter = (
  adapter: unknown,
): HardwareAdapterValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isRecord(adapter)) {
    return {
      valid: false,
      errors: ["adapter must be a non-null object"],
      warnings,
    };
  }

  if (typeof adapter.getInfo !== "function") {
    errors.push("adapter must provide getInfo()");
  } else {
    try {
      validateInfo(adapter.getInfo(), errors, warnings);
    } catch {
      errors.push("getInfo() must not throw");
    }
  }

  if (typeof adapter.read !== "function") {
    errors.push("adapter must provide read()");
  } else {
    try {
      if (!isRecord(adapter.read())) {
        errors.push("read() must return a non-null object");
      }
    } catch {
      errors.push("read() must not throw");
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};
