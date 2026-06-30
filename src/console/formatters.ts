import type { RobotState } from "../types.js";

const formatDecimal = (value: number, fractionDigits: number): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }

  const fixed = value.toFixed(fractionDigits);
  return fractionDigits === 0 ? fixed : fixed.replace(/\.?0+$/, "");
};

export const formatPercent = (value: number): string =>
  `${formatDecimal(value, 1)}%`;

export const formatVoltage = (value: number): string =>
  `${formatDecimal(value, 1)}V`;

export const formatTemperature = (value: number): string =>
  `${formatDecimal(value, 1)}C`;

export const formatTimestampMs = (value: number): string =>
  `${formatDecimal(value, 0)} ms`;

export const formatRobotState = (state: RobotState): string => state;

export const formatTelemetryNumber = (value: number): string =>
  formatDecimal(value, 4);
