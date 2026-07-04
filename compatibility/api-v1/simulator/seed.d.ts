export type RandomSource = () => number;
/**
 * Creates a compact deterministic pseudo-random number generator.
 * This is intended for simulation repeatability, not cryptography.
 */
export declare function createSeededRandom(seed: number | string): RandomSource;
