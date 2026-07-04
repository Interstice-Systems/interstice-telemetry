/**
 * Simulator and telemetry lifecycle status.
 *
 * Public consumers should import this type as `RobotOperatingMode`. The
 * package-root `RobotState` name refers to the canonical digital-twin state.
 */
export type RobotState =
  | "idle"
  | "active"
  | "returning"
  | "charging"
  | "faulted"
  | "offline";

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface ImuTelemetry {
  acceleration: Vector3;
  gyro: Vector3;
}

export interface TelemetrySnapshot {
  timestamp: string;
  robotId: string;
  batteryPercentage: number;
  batteryVoltage: number;
  leftMotorRpm: number;
  rightMotorRpm: number;
  leftMotorTemperature: number;
  rightMotorTemperature: number;
  cpuUsage: number;
  memoryUsage: number;
  signalStrength: number;
  imu: ImuTelemetry;
  state: RobotState;
  provenance?: EvidenceProvenance;
}
import type { EvidenceProvenance } from "./provenance/provenanceTypes.js";
