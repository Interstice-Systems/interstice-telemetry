import type { HardwareAdapter } from "./hardwareAdapter.js";
import type {
  HardwareAdapterInfo,
  HardwareAdapterStatus,
  MotorReading,
} from "./hardwareTypes.js";

export interface VirtualMotorAdapterOptions {
  id?: string;
  name?: string;
  status?: HardwareAdapterStatus;
  metadata?: Record<string, unknown>;
  leftRpm?: number;
  rightRpm?: number;
  leftTemperatureC?: number;
  rightTemperatureC?: number;
}

export class VirtualMotorAdapter implements HardwareAdapter<MotorReading> {
  private readonly id: string;
  private readonly name: string;
  private readonly metadata: Record<string, unknown> | undefined;
  private reading: MotorReading;

  constructor(options: VirtualMotorAdapterOptions = {}) {
    this.id = options.id ?? "virtual-motors";
    this.name = options.name ?? "Virtual Motors";
    this.metadata =
      options.metadata === undefined ? undefined : { ...options.metadata };
    this.reading = {
      leftRpm: options.leftRpm ?? 0,
      rightRpm: options.rightRpm ?? 0,
      leftTemperatureC: options.leftTemperatureC ?? 24,
      rightTemperatureC: options.rightTemperatureC ?? 24,
      status: options.status ?? "ready",
    };
  }

  getInfo(): HardwareAdapterInfo {
    return {
      id: this.id,
      kind: "motor",
      name: this.name,
      status: this.reading.status,
      ...(this.metadata === undefined ? {} : { metadata: { ...this.metadata } }),
    };
  }

  read(): MotorReading {
    return { ...this.reading };
  }

  setStatus(status: HardwareAdapterStatus): void {
    this.reading = { ...this.reading, status };
  }

  setReading(reading: Partial<Omit<MotorReading, "status">>): void {
    this.reading = { ...this.reading, ...reading };
  }
}
