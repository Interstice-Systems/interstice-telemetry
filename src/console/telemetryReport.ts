import type { TelemetrySnapshot, Vector3 } from "../types.js";
import type { ConsoleReport } from "./consoleTypes.js";
import {
  formatPercent,
  formatRobotState,
  formatTelemetryNumber,
  formatTemperature,
  formatVoltage,
} from "./formatters.js";

const formatVector = ({ x, y, z }: Vector3): string =>
  `x=${formatTelemetryNumber(x)}, y=${formatTelemetryNumber(y)}, z=${formatTelemetryNumber(z)}`;

export const renderTelemetrySnapshot = (
  snapshot: TelemetrySnapshot,
): ConsoleReport =>
  [
    "TELEMETRY SNAPSHOT",
    `Robot: ${snapshot.robotId}`,
    `State: ${formatRobotState(snapshot.state)}`,
    `Battery: ${formatPercent(snapshot.batteryPercentage)}`,
    `Voltage: ${formatVoltage(snapshot.batteryVoltage)}`,
    "Motors:",
    `  Left RPM: ${formatTelemetryNumber(snapshot.leftMotorRpm)}`,
    `  Right RPM: ${formatTelemetryNumber(snapshot.rightMotorRpm)}`,
    `  Left Temp: ${formatTemperature(snapshot.leftMotorTemperature)}`,
    `  Right Temp: ${formatTemperature(snapshot.rightMotorTemperature)}`,
    "System:",
    `  CPU: ${formatPercent(snapshot.cpuUsage)}`,
    `  Memory: ${formatPercent(snapshot.memoryUsage)}`,
    `  Signal: ${formatTelemetryNumber(snapshot.signalStrength)} dBm`,
    "IMU:",
    `  Accel: ${formatVector(snapshot.imu.acceleration)}`,
    `  Gyro: ${formatVector(snapshot.imu.gyro)}`,
  ].join("\n");
