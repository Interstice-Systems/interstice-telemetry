import type { HardwareAdapter } from "./hardwareAdapter.js";
import type {
  HardwareAdapterInfo,
  HardwareAdapterStatus,
  ImuReading,
} from "./hardwareTypes.js";

export interface VirtualImuAdapterOptions {
  id?: string;
  name?: string;
  status?: HardwareAdapterStatus;
  metadata?: Record<string, unknown>;
  acceleration?: { x: number; y: number; z: number };
  gyro?: { x: number; y: number; z: number };
}

export class VirtualImuAdapter implements HardwareAdapter<ImuReading> {
  private readonly id: string;
  private readonly name: string;
  private readonly metadata: Record<string, unknown> | undefined;
  private reading: ImuReading;

  constructor(options: VirtualImuAdapterOptions = {}) {
    this.id = options.id ?? "virtual-imu";
    this.name = options.name ?? "Virtual IMU";
    this.metadata =
      options.metadata === undefined ? undefined : { ...options.metadata };
    this.reading = {
      acceleration: { ...(options.acceleration ?? { x: 0, y: 0, z: 9.81 }) },
      gyro: { ...(options.gyro ?? { x: 0, y: 0, z: 0 }) },
      status: options.status ?? "ready",
    };
  }

  getInfo(): HardwareAdapterInfo {
    return {
      id: this.id,
      kind: "imu",
      name: this.name,
      status: this.reading.status,
      ...(this.metadata === undefined ? {} : { metadata: { ...this.metadata } }),
    };
  }

  read(): ImuReading {
    return {
      acceleration: { ...this.reading.acceleration },
      gyro: { ...this.reading.gyro },
      status: this.reading.status,
    };
  }

  setStatus(status: HardwareAdapterStatus): void {
    this.reading = { ...this.reading, status };
  }

  setReading(reading: Partial<Omit<ImuReading, "status">>): void {
    this.reading = {
      acceleration:
        reading.acceleration === undefined
          ? this.reading.acceleration
          : { ...reading.acceleration },
      gyro: reading.gyro === undefined ? this.reading.gyro : { ...reading.gyro },
      status: this.reading.status,
    };
  }
}
