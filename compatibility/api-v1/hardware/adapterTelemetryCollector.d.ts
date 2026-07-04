import type { RobotState, TelemetrySnapshot } from "../types.js";
import type { HardwareAdapter } from "./hardwareAdapter.js";
import type { BatteryReading, ImuReading, MotorReading, SystemReading } from "./hardwareTypes.js";
export interface AdapterTelemetryCollectorOptions {
    robotId: string;
    battery: HardwareAdapter<BatteryReading>;
    motor: HardwareAdapter<MotorReading>;
    imu: HardwareAdapter<ImuReading>;
    system: HardwareAdapter<SystemReading>;
    initialState?: RobotState;
}
export type TelemetryCollectionTimestamp = Date | string | number;
export declare class AdapterTelemetryCollector {
    readonly robotId: string;
    private readonly battery;
    private readonly motor;
    private readonly imu;
    private readonly system;
    private state;
    constructor(options: AdapterTelemetryCollectorOptions);
    getState(): RobotState;
    setState(state: RobotState): void;
    collect(timestamp: TelemetryCollectionTimestamp): TelemetrySnapshot;
}
