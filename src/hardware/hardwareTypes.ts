import type { Vector3 } from "../types.js";

export const HARDWARE_ADAPTER_STATUSES = [
  "ready",
  "degraded",
  "faulted",
  "offline",
] as const;

export type HardwareAdapterStatus =
  (typeof HARDWARE_ADAPTER_STATUSES)[number];

export interface HardwareAdapterInfo {
  id: string;
  kind: string;
  name: string;
  status: HardwareAdapterStatus;
  metadata?: Record<string, unknown>;
}

export interface BatteryReading {
  percentage: number;
  voltage: number;
  status: HardwareAdapterStatus;
}

export interface MotorReading {
  leftRpm: number;
  rightRpm: number;
  leftTemperatureC: number;
  rightTemperatureC: number;
  status: HardwareAdapterStatus;
}

export interface ImuReading {
  acceleration: Vector3;
  gyro: Vector3;
  status: HardwareAdapterStatus;
}

export interface SystemReading {
  cpuUsage: number;
  memoryUsage: number;
  signalStrength: number;
  status: HardwareAdapterStatus;
}

export interface HardwareAdapterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
