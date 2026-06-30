import type { TelemetrySnapshot } from "../types.js";
import type { Fault, FaultType } from "./faultTypes.js";

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export class FaultInjector {
  private readonly faults = new Map<FaultType, Fault>();

  inject(fault: Fault): void {
    this.faults.set(fault.type, {
      ...fault,
      severity: clamp(fault.severity ?? 1, 0, 1),
    });
  }

  remove(type: FaultType): void {
    this.faults.delete(type);
  }

  clear(): void {
    this.faults.clear();
  }

  has(type: FaultType): boolean {
    return this.faults.has(type);
  }

  apply(snapshot: TelemetrySnapshot): TelemetrySnapshot {
    const result = structuredClone(snapshot);

    for (const fault of this.faults.values()) {
      const severity = fault.severity ?? 1;

      switch (fault.type) {
        case "low_battery":
          result.batteryPercentage = Math.min(
            result.batteryPercentage,
            12 - severity * 7,
          );
          result.batteryVoltage = Math.min(
            result.batteryVoltage,
            21.5 - severity,
          );
          result.state = "faulted";
          break;
        case "motor_overheating":
          result.leftMotorTemperature = Math.max(
            result.leftMotorTemperature,
            75 + severity * 30,
          );
          result.rightMotorTemperature = Math.max(
            result.rightMotorTemperature,
            75 + severity * 30,
          );
          result.state = "faulted";
          break;
        case "signal_loss":
          result.signalStrength = -100 - severity * 20;
          result.state = "offline";
          break;
        case "sensor_noise": {
          const phase = Date.parse(result.timestamp) / 1_000;
          const noise = Math.sin(phase * 12.9898) * severity;
          result.imu.acceleration.x += noise * 2;
          result.imu.acceleration.y -= noise * 1.5;
          result.imu.acceleration.z += noise;
          result.imu.gyro.x += noise * 0.4;
          result.imu.gyro.y -= noise * 0.3;
          result.imu.gyro.z += noise * 0.5;
          break;
        }
        case "stalled_motor":
          result.leftMotorRpm = 0;
          result.rightMotorRpm = 0;
          result.leftMotorTemperature += severity * 12;
          result.rightMotorTemperature += severity * 12;
          result.state = "faulted";
          break;
      }
    }

    return result;
  }
}
