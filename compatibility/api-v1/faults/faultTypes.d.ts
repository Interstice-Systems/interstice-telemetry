export declare const FAULT_TYPES: readonly ["low_battery", "motor_overheating", "signal_loss", "sensor_noise", "stalled_motor"];
export type FaultType = (typeof FAULT_TYPES)[number];
export interface Fault {
    type: FaultType;
    severity?: number;
}
