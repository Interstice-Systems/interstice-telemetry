import type { TelemetryEvent } from "../events/eventTypes.js";
import {
  assertNonNegativeFinite,
  cloneMetadata,
  type ClockInfo,
  type DeterministicClock,
} from "./clockTypes.js";

export interface ReplayClockOptions {
  id?: string;
  metadata?: Record<string, unknown>;
}

export class ReplayClock implements DeterministicClock {
  private readonly id: string;
  private readonly timestamps: readonly number[];
  private readonly initialTimeMs: number;
  private readonly metadata: Record<string, unknown> | undefined;
  private currentTimeMs: number;
  private eventIndex: number;
  private stepCount = 0;

  constructor(
    events: readonly Pick<TelemetryEvent, "timestamp">[],
    options: ReplayClockOptions = {},
  ) {
    this.timestamps = events.map(({ timestamp }) => timestamp);
    this.timestamps.forEach((timestamp, index) => {
      assertNonNegativeFinite(timestamp, `events[${index}].timestamp`);
      if (index > 0 && timestamp < this.timestamps[index - 1]!) {
        throw new RangeError("replay event timestamps must be non-decreasing");
      }
    });
    this.id = options.id ?? "replay-clock";
    this.initialTimeMs = this.timestamps[0] ?? 0;
    this.currentTimeMs = this.initialTimeMs;
    this.eventIndex = this.timestamps.length === 0 ? -1 : 0;
    this.metadata = cloneMetadata(options.metadata);
  }

  now(): number {
    return this.currentTimeMs;
  }

  step(deltaMs: number): number {
    assertNonNegativeFinite(deltaMs, "deltaMs");
    this.currentTimeMs += deltaMs;
    this.stepCount += 1;
    return this.currentTimeMs;
  }

  advanceToNextEvent(): number {
    const nextIndex = this.eventIndex + 1;
    const nextTimestamp = this.timestamps[nextIndex];
    if (nextTimestamp === undefined) {
      return this.currentTimeMs;
    }
    this.eventIndex = nextIndex;
    this.currentTimeMs = nextTimestamp;
    this.stepCount += 1;
    return this.currentTimeMs;
  }

  reset(): void {
    this.currentTimeMs = this.initialTimeMs;
    this.eventIndex = this.timestamps.length === 0 ? -1 : 0;
    this.stepCount = 0;
  }

  getInfo(): ClockInfo {
    return {
      id: this.id,
      kind: "replay",
      currentTimeMs: this.currentTimeMs,
      stepCount: this.stepCount,
      metadata: {
        ...structuredClone(this.metadata ?? {}),
        eventCount: this.timestamps.length,
        eventIndex: this.eventIndex,
      },
    };
  }
}
