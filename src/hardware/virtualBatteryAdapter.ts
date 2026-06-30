import type { SteppableHardwareAdapter } from "./hardwareAdapter.js";
import type {
  BatteryReading,
  HardwareAdapterInfo,
  HardwareAdapterStatus,
} from "./hardwareTypes.js";

export interface VirtualBatteryAdapterOptions {
  id?: string;
  name?: string;
  status?: HardwareAdapterStatus;
  metadata?: Record<string, unknown>;
  percentage?: number;
  voltage?: number;
  percentageChangePerSecond?: number;
  voltageChangePerSecond?: number;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export class VirtualBatteryAdapter
  implements SteppableHardwareAdapter<BatteryReading>
{
  private readonly id: string;
  private readonly name: string;
  private readonly metadata: Record<string, unknown> | undefined;
  private readonly percentageChangePerSecond: number;
  private readonly voltageChangePerSecond: number;
  private reading: BatteryReading;

  constructor(options: VirtualBatteryAdapterOptions = {}) {
    this.id = options.id ?? "virtual-battery";
    this.name = options.name ?? "Virtual Battery";
    this.metadata =
      options.metadata === undefined ? undefined : { ...options.metadata };
    this.percentageChangePerSecond = options.percentageChangePerSecond ?? 0;
    this.voltageChangePerSecond = options.voltageChangePerSecond ?? 0;
    this.reading = {
      percentage: options.percentage ?? 100,
      voltage: options.voltage ?? 25.2,
      status: options.status ?? "ready",
    };
  }

  getInfo(): HardwareAdapterInfo {
    return {
      id: this.id,
      kind: "battery",
      name: this.name,
      status: this.reading.status,
      ...(this.metadata === undefined ? {} : { metadata: { ...this.metadata } }),
    };
  }

  read(): BatteryReading {
    return { ...this.reading };
  }

  setStatus(status: HardwareAdapterStatus): void {
    this.reading = { ...this.reading, status };
  }

  setReading(reading: Partial<Omit<BatteryReading, "status">>): void {
    this.reading = { ...this.reading, ...reading };
  }

  step(deltaMs: number): void {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      throw new RangeError("step duration must be a positive number");
    }

    const seconds = deltaMs / 1_000;
    this.reading = {
      ...this.reading,
      percentage: clamp(
        this.reading.percentage + this.percentageChangePerSecond * seconds,
        0,
        100,
      ),
      voltage: Math.max(
        0,
        this.reading.voltage + this.voltageChangePerSecond * seconds,
      ),
    };
  }
}
