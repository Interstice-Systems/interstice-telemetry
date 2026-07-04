import type { HardwareAdapter } from "./hardwareAdapter.js";
import type { HardwareAdapterInfo, HardwareAdapterStatus, SystemReading } from "./hardwareTypes.js";
export interface VirtualSystemAdapterOptions {
    id?: string;
    name?: string;
    status?: HardwareAdapterStatus;
    metadata?: Record<string, unknown>;
    cpuUsage?: number;
    memoryUsage?: number;
    signalStrength?: number;
}
export declare class VirtualSystemAdapter implements HardwareAdapter<SystemReading> {
    private readonly id;
    private readonly name;
    private readonly metadata;
    private reading;
    constructor(options?: VirtualSystemAdapterOptions);
    getInfo(): HardwareAdapterInfo;
    read(): SystemReading;
    setStatus(status: HardwareAdapterStatus): void;
    setReading(reading: Partial<Omit<SystemReading, "status">>): void;
}
