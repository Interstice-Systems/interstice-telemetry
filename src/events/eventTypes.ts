import type { Fault } from "../faults/faultTypes.js";
import { ADAPTER_EVENT_TYPES } from "../hardware/adapterEventTypes.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
import type {
  RobotState,
  TelemetrySnapshot,
} from "../types.js";

export const TELEMETRY_EVENT_TYPES = [
  "stream.started",
  "stream.stopped",
  "telemetry.snapshot",
  "fault.injected",
  "state.changed",
  ...ADAPTER_EVENT_TYPES,
] as const;

export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  timestamp: number;
  robotId: string;
  sequence: number;
  payload: unknown;
  provenance?: EvidenceProvenance;
}

export interface StreamLifecyclePayload {
  status: "running" | "stopped";
}

export interface TelemetrySnapshotPayload {
  snapshot: TelemetrySnapshot;
}

export interface FaultInjectedPayload {
  fault: Fault;
}

export interface StateChangedPayload {
  previousState: RobotState;
  currentState: RobotState;
}

export type TelemetryEventHandler = (event: TelemetryEvent) => void;
