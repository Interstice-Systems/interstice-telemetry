import type { TelemetryEvent } from "../events/eventTypes.js";
import type { TelemetrySnapshot } from "../types.js";
import type { HardwareAdapterInfo, HardwareAdapterStatus } from "./hardwareTypes.js";
export declare const ADAPTER_EVENT_TYPES: readonly ["adapter.stream.started", "adapter.stream.stopped", "adapter.telemetry.snapshot", "adapter.status.changed", "adapter.reading.changed"];
export type AdapterEventType = (typeof ADAPTER_EVENT_TYPES)[number];
export interface AdapterStreamLifecyclePayload {
    status: "running" | "stopped";
}
export interface AdapterTelemetrySnapshotPayload {
    snapshot: TelemetrySnapshot;
}
export interface AdapterStatusChangedPayload {
    adapterId: string;
    adapterKind: string;
    adapter?: HardwareAdapterInfo;
    previousStatus: HardwareAdapterStatus;
    currentStatus: HardwareAdapterStatus;
}
export interface AdapterReadingChangedPayload {
    adapterId: string;
    adapterKind: string;
    adapter?: HardwareAdapterInfo;
    previousReading: Readonly<Record<string, unknown>>;
    currentReading: Readonly<Record<string, unknown>>;
}
export type AdapterEventPayload = AdapterStreamLifecyclePayload | AdapterTelemetrySnapshotPayload | AdapterStatusChangedPayload | AdapterReadingChangedPayload;
export type AdapterTelemetryEvent = TelemetryEvent & {
    type: AdapterEventType;
    payload: AdapterEventPayload;
};
export type AdapterTelemetryEventHandler = (event: AdapterTelemetryEvent) => void;
