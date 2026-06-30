import type { Fault } from "../faults/faultTypes.js";
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
] as const;

export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

export interface TelemetryEvent {
  id: string;
  type: TelemetryEventType;
  timestamp: number;
  robotId: string;
  sequence: number;
  payload: unknown;
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
