export declare const CLOCK_KINDS: readonly ["simulation", "logical", "replay", "fleet"];
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
export declare const assertNonNegativeFinite: (value: number, name: string) => void;
export declare const cloneMetadata: (metadata: Record<string, unknown> | undefined) => Record<string, unknown> | undefined;
