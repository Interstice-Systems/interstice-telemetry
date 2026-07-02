import {
  assertNonNegativeFinite,
  cloneMetadata,
  type ClockInfo,
  type ClockOptions,
  type DeterministicClock,
} from "./clockTypes.js";

export type FleetClockOptions = ClockOptions;

export class FleetClock implements DeterministicClock {
  private readonly id: string;
  private readonly initialTimeMs: number;
  private readonly metadata: Record<string, unknown> | undefined;
  private currentTimeMs: number;
  private stepCount = 0;

  constructor(options: FleetClockOptions = {}) {
    const startTimeMs = options.startTimeMs ?? 0;
    assertNonNegativeFinite(startTimeMs, "startTimeMs");
    this.id = options.id ?? "fleet-clock";
    this.initialTimeMs = startTimeMs;
    this.currentTimeMs = startTimeMs;
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

  reset(): void {
    this.currentTimeMs = this.initialTimeMs;
    this.stepCount = 0;
  }

  getInfo(): ClockInfo {
    return {
      id: this.id,
      kind: "fleet",
      currentTimeMs: this.currentTimeMs,
      stepCount: this.stepCount,
      ...(this.metadata === undefined
        ? {}
        : { metadata: structuredClone(this.metadata) }),
    };
  }
}
