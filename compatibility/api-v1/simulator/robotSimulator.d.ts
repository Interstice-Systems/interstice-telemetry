import { FaultInjector } from "../faults/faultInjector.js";
import type { Fault } from "../faults/faultTypes.js";
import type { RobotState, TelemetrySnapshot } from "../types.js";
export interface RobotSimulatorOptions {
    robotId?: string;
    seed?: number | string;
    startTime?: Date | string | number;
    initialState?: RobotState;
    faultInjector?: FaultInjector;
}
export declare class RobotSimulator {
    readonly robotId: string;
    readonly faults: FaultInjector;
    private readonly random;
    private timestampMs;
    private state;
    private batteryPercentage;
    private leftMotorTemperature;
    private rightMotorTemperature;
    private snapshot;
    constructor(options?: RobotSimulatorOptions);
    setState(state: RobotState): void;
    injectFault(fault: Fault): void;
    clearFault(type: Fault["type"]): void;
    getSnapshot(): TelemetrySnapshot;
    step(milliseconds: number): TelemetrySnapshot;
    private updateBattery;
    private updateTemperatures;
    private buildSnapshot;
    private vector;
}
