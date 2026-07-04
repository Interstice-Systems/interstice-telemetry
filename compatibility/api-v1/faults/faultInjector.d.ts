import type { TelemetrySnapshot } from "../types.js";
import type { Fault, FaultType } from "./faultTypes.js";
export declare class FaultInjector {
    private readonly faults;
    inject(fault: Fault): void;
    remove(type: FaultType): void;
    clear(): void;
    has(type: FaultType): boolean;
    apply(snapshot: TelemetrySnapshot): TelemetrySnapshot;
}
