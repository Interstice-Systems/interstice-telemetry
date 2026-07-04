import type { HardwareAdapter } from "./hardwareAdapter.js";
import type { HardwareAdapterInfo, HardwareAdapterStatus, ImuReading } from "./hardwareTypes.js";
export interface VirtualImuAdapterOptions {
    id?: string;
    name?: string;
    status?: HardwareAdapterStatus;
    metadata?: Record<string, unknown>;
    acceleration?: {
        x: number;
        y: number;
        z: number;
    };
    gyro?: {
        x: number;
        y: number;
        z: number;
    };
}
export declare class VirtualImuAdapter implements HardwareAdapter<ImuReading> {
    private readonly id;
    private readonly name;
    private readonly metadata;
    private reading;
    constructor(options?: VirtualImuAdapterOptions);
    getInfo(): HardwareAdapterInfo;
    read(): ImuReading;
    setStatus(status: HardwareAdapterStatus): void;
    setReading(reading: Partial<Omit<ImuReading, "status">>): void;
}
