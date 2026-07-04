import type { HardwareAdapter } from "./hardwareAdapter.js";
import type { HardwareAdapterInfo, HardwareAdapterStatus, MotorReading } from "./hardwareTypes.js";
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
export declare class VirtualMotorAdapter implements HardwareAdapter<MotorReading> {
    private readonly id;
    private readonly name;
    private readonly metadata;
    private reading;
    constructor(options?: VirtualMotorAdapterOptions);
    getInfo(): HardwareAdapterInfo;
    read(): MotorReading;
    setStatus(status: HardwareAdapterStatus): void;
    setReading(reading: Partial<Omit<MotorReading, "status">>): void;
}
