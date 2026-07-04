import type { TelemetryEvent } from "../events/eventTypes.js";
import { cloneTelemetryEvent } from "../events/cloneEvent.js";
import { deriveProvenance } from "../provenance/provenanceBuilder.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
import {
  REPLAY_LOG_VERSION,
  type ReplayLog,
} from "./replayLog.js";

export type ReplayRecorderStatus = "active" | "inactive";

export interface ReplayRecorderOptions {
  robotId?: string;
  version?: string;
  createdAt?: Date | string | number;
  seed?: number | string;
  provenance?: EvidenceProvenance;
}

const toIsoString = (value: Date | string | number): string => {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("createdAt must be a valid date");
  }

  return date.toISOString();
};

export class ReplayRecorder {
  private readonly events: TelemetryEvent[] = [];
  private readonly options: ReplayRecorderOptions;
  private status: ReplayRecorderStatus = "inactive";

  constructor(options: ReplayRecorderOptions = {}) {
    this.options = { ...options };

    if (options.createdAt !== undefined) {
      toIsoString(options.createdAt);
    }
  }

  start(): void {
    this.status = "active";
  }

  stop(): void {
    this.status = "inactive";
  }

  record = (event: TelemetryEvent): void => {
    if (this.status === "active") {
      this.events.push(cloneTelemetryEvent(event));
    }
  };

  clear(): void {
    this.events.length = 0;
  }

  toLog(metadata?: Record<string, unknown>): ReplayLog {
    const robotId = this.options.robotId ?? this.events[0]?.robotId;

    if (robotId === undefined || robotId.length === 0) {
      throw new Error(
        "robotId is required when creating a replay log with no events",
      );
    }

    const createdAt =
      this.options.createdAt === undefined
        ? new Date(this.events[0]?.timestamp ?? 0).toISOString()
        : toIsoString(this.options.createdAt);

    return {
      version: this.options.version ?? REPLAY_LOG_VERSION,
      robotId,
      createdAt,
      ...(this.options.seed === undefined ? {} : { seed: this.options.seed }),
      eventCount: this.events.length,
      events: this.events.map(cloneTelemetryEvent),
      ...(metadata === undefined
        ? {}
        : { metadata: structuredClone(metadata) }),
      ...((this.options.provenance ?? this.events[0]?.provenance) === undefined
        ? {}
        : {
            provenance: deriveProvenance(
              (this.options.provenance ??
                this.events[0]?.provenance) as EvidenceProvenance,
              {
                name: "Replay Recorder",
                timestamp: Math.max(
                  (this.options.provenance ?? this.events[0]?.provenance)!
                    .timestamp,
                  Date.parse(createdAt),
                ),
              },
            ),
          }),
    };
  }

  getEvents(): TelemetryEvent[] {
    return this.events.map(cloneTelemetryEvent);
  }

  getStatus(): ReplayRecorderStatus {
    return this.status;
  }
}
