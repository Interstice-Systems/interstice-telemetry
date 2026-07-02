import {
  assertNonNegativeFinite,
  cloneMetadata,
  type ClockInfo,
  type ClockOptions,
  type DeterministicClock,
} from "./clockTypes.js";

export interface LogicalClockOptions extends ClockOptions {
  tickSizeMs?: number;
}

export class LogicalClock implements DeterministicClock {
  private readonly id: string;
  private readonly initialTimeMs: number;
  private readonly tickSizeMs: number;
  private readonly metadata: Record<string, unknown> | undefined;
  private currentTimeMs: number;
  private stepCount = 0;

  constructor(options: LogicalClockOptions = {}) {
    const startTimeMs = options.startTimeMs ?? 0;
    const tickSizeMs = options.tickSizeMs ?? 1;
    assertNonNegativeFinite(startTimeMs, "startTimeMs");
    if (!Number.isFinite(tickSizeMs) || tickSizeMs <= 0) {
      throw new RangeError("tickSizeMs must be a positive finite number");
    }
    this.id = options.id ?? "logical-clock";
    this.initialTimeMs = startTimeMs;
    this.currentTimeMs = startTimeMs;
    this.tickSizeMs = tickSizeMs;
    this.metadata = cloneMetadata(options.metadata);
  }

  now(): number {
    return this.currentTimeMs;
  }

  tick(): number {
    return this.step(this.tickSizeMs);
  }

  step(deltaMs: number): number {
    assertNonNegativeFinite(deltaMs, "deltaMs");
    this.currentTimeMs += deltaMs;
    this.stepCount += 1;
    return this.currentTimeMs;
  }

  reset(): void {
    this.currentTimeMs = this.initialTimeMs;
    this.stepCount = 0;
  }

  getInfo(): ClockInfo {
    return {
      id: this.id,
      kind: "logical",
      currentTimeMs: this.currentTimeMs,
      stepCount: this.stepCount,
      metadata: {
        ...structuredClone(this.metadata ?? {}),
        tickSizeMs: this.tickSizeMs,
      },
    };
  }
}
