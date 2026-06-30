export const FAULT_TYPES = [
  "low_battery",
  "motor_overheating",
  "signal_loss",
  "sensor_noise",
  "stalled_motor",
] as const;

export type FaultType = (typeof FAULT_TYPES)[number];

export interface Fault {
  type: FaultType;
  severity?: number;
}
