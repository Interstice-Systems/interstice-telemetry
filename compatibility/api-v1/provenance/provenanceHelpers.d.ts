export declare const toImmutableProvenanceValue: <T>(value: T, name?: string) => T;
export declare const deterministicProvenanceStringify: (value: unknown) => string;
/** Small deterministic identifier hash. This is not a cryptographic digest. */
export declare const createDeterministicProvenanceId: (prefix: "prov" | "step", value: unknown) => string;
export declare const provenanceTimestampToIso: (timestamp: number) => string;
