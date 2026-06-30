import type { HardwareAdapterInfo } from "./hardwareTypes.js";

export interface HardwareAdapter<TReading> {
  getInfo(): HardwareAdapterInfo;
  read(): TReading;
}

export interface SteppableHardwareAdapter<TReading>
  extends HardwareAdapter<TReading> {
  step(deltaMs: number): void;
}
