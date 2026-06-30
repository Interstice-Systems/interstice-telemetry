import type { RobotState, TelemetrySnapshot } from "../types.js";
import type { HardwareAdapter } from "./hardwareAdapter.js";
import type {
  BatteryReading,
  ImuReading,
  MotorReading,
  SystemReading,
} from "./hardwareTypes.js";

export interface AdapterTelemetryCollectorOptions {
  robotId: string;
  battery: HardwareAdapter<BatteryReading>;
  motor: HardwareAdapter<MotorReading>;
  imu: HardwareAdapter<ImuReading>;
  system: HardwareAdapter<SystemReading>;
  initialState?: RobotState;
}

export type TelemetryCollectionTimestamp = Date | string | number;

const toIsoTimestamp = (timestamp: TelemetryCollectionTimestamp): string => {
  const date = new Date(timestamp);
  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("timestamp must be a valid date");
  }
  return date.toISOString();
};

export class AdapterTelemetryCollector {
  readonly robotId: string;

  private readonly battery: HardwareAdapter<BatteryReading>;
  private readonly motor: HardwareAdapter<MotorReading>;
  private readonly imu: HardwareAdapter<ImuReading>;
  private readonly system: HardwareAdapter<SystemReading>;
  private state: RobotState;

  constructor(options: AdapterTelemetryCollectorOptions) {
    this.robotId = options.robotId;
    this.battery = options.battery;
    this.motor = options.motor;
    this.imu = options.imu;
    this.system = options.system;
    this.state = options.initialState ?? "idle";
  }

  getState(): RobotState {
    return this.state;
  }

  setState(state: RobotState): void {
    this.state = state;
  }

  collect(timestamp: TelemetryCollectionTimestamp): TelemetrySnapshot {
    const battery = this.battery.read();
    const motor = this.motor.read();
    const imu = this.imu.read();
    const system = this.system.read();
    const statuses = [
      battery.status,
      motor.status,
      imu.status,
      system.status,
    ];

    let snapshotState = this.state;
    if (statuses.includes("faulted")) {
      snapshotState = "faulted";
    } else if (statuses.every((status) => status === "offline")) {
      snapshotState = "offline";
    }

    return {
      timestamp: toIsoTimestamp(timestamp),
      robotId: this.robotId,
      batteryPercentage: battery.percentage,
      batteryVoltage: battery.voltage,
      leftMotorRpm: motor.leftRpm,
      rightMotorRpm: motor.rightRpm,
      leftMotorTemperature: motor.leftTemperatureC,
      rightMotorTemperature: motor.rightTemperatureC,
      cpuUsage: system.cpuUsage,
      memoryUsage: system.memoryUsage,
      signalStrength: system.signalStrength,
      imu: {
        acceleration: { ...imu.acceleration },
        gyro: { ...imu.gyro },
      },
      state: snapshotState,
    };
  }
}
