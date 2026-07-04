import type { SteppableHardwareAdapter } from "./hardwareAdapter.js";
import type { BatteryReading, HardwareAdapterInfo, HardwareAdapterStatus } from "./hardwareTypes.js";
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
export declare class VirtualBatteryAdapter implements SteppableHardwareAdapter<BatteryReading> {
    private readonly id;
    private readonly name;
    private readonly metadata;
    private readonly percentageChangePerSecond;
    private readonly voltageChangePerSecond;
    private reading;
    constructor(options?: VirtualBatteryAdapterOptions);
    getInfo(): HardwareAdapterInfo;
    read(): BatteryReading;
    setStatus(status: HardwareAdapterStatus): void;
    setReading(reading: Partial<Omit<BatteryReading, "status">>): void;
    step(deltaMs: number): void;
}
