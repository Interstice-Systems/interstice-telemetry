export const CLOCK_KINDS = [
  "simulation",
  "logical",
  "replay",
  "fleet",
] as const;

export type ClockKind = (typeof CLOCK_KINDS)[number];

export interface ClockInfo {
  id: string;
  kind: ClockKind;
  currentTimeMs: number;
  stepCount: number;
  metadata?: Record<string, unknown>;
}

export interface DeterministicClock {
  now(): number;
  step(deltaMs: number): number;
  reset(): void;
  getInfo(): ClockInfo;
}

export interface ClockOptions {
  id?: string;
  startTimeMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ClockValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export const assertNonNegativeFinite = (
  value: number,
  name: string,
): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative finite number`);
  }
};

export const cloneMetadata = (
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined =>
  metadata === undefined ? undefined : structuredClone(metadata);
