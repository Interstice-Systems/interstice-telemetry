import type { HardwareAdapter } from "./hardwareAdapter.js";
import type {
  HardwareAdapterInfo,
  HardwareAdapterStatus,
  SystemReading,
} from "./hardwareTypes.js";

export interface VirtualSystemAdapterOptions {
  id?: string;
  name?: string;
  status?: HardwareAdapterStatus;
  metadata?: Record<string, unknown>;
  cpuUsage?: number;
  memoryUsage?: number;
  signalStrength?: number;
}

export class VirtualSystemAdapter implements HardwareAdapter<SystemReading> {
  private readonly id: string;
  private readonly name: string;
  private readonly metadata: Record<string, unknown> | undefined;
  private reading: SystemReading;

  constructor(options: VirtualSystemAdapterOptions = {}) {
    this.id = options.id ?? "virtual-system";
    this.name = options.name ?? "Virtual System";
    this.metadata =
      options.metadata === undefined ? undefined : { ...options.metadata };
    this.reading = {
      cpuUsage: options.cpuUsage ?? 0,
      memoryUsage: options.memoryUsage ?? 0,
      signalStrength: options.signalStrength ?? -50,
      status: options.status ?? "ready",
    };
  }

  getInfo(): HardwareAdapterInfo {
    return {
      id: this.id,
      kind: "system",
      name: this.name,
      status: this.reading.status,
      ...(this.metadata === undefined ? {} : { metadata: { ...this.metadata } }),
    };
  }

  read(): SystemReading {
    return { ...this.reading };
  }

  setStatus(status: HardwareAdapterStatus): void {
    this.reading = { ...this.reading, status };
  }

  setReading(reading: Partial<Omit<SystemReading, "status">>): void {
    this.reading = { ...this.reading, ...reading };
  }
}
