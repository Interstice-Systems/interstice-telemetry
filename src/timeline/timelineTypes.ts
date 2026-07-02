import type { TelemetryEventType } from "../events/eventTypes.js";

export const FLEET_EVENT_TIMELINE_VERSION = "0.11.0";

export interface GlobalFleetEvent {
  fleetSequence: number;
  robotId: string;
  robotSequence: number;
  timestamp: number;
  type: TelemetryEventType;
  eventId: string;
  payload: unknown;
}

export interface FleetEventTimeline {
  version: string;
  fleetId: string;
  createdAt: string;
  clockKind?: string;
  eventCount: number;
  events: GlobalFleetEvent[];
  metadata?: Record<string, unknown>;
}

export interface FleetTimelineBuildOptions {
  fleetId?: string;
  createdAt?: string;
  clockKind?: string;
  metadata?: Record<string, unknown>;
}

export interface FleetTimelineValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

