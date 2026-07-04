export declare const EVIDENCE_PROVENANCE_VERSION = "1.0.0";
export declare const PROVENANCE_VERSION = "1.0.0";
export declare const PROVENANCE_SOURCE_TYPES: readonly ["simulation", "telemetry", "replay", "adapter", "importer", "manual", "derived"];
export declare const PROVENANCE_CONFIDENCE_LEVELS: readonly ["exact", "measured", "estimated", "derived"];
export declare const EVIDENCE_OWNER_TYPES: readonly ["local", "organization", "competition", "research", "public"];
export declare const EVIDENCE_VISIBILITIES: readonly ["private", "organization", "competition", "public"];
export type ProvenanceSourceType = (typeof PROVENANCE_SOURCE_TYPES)[number];
export type ProvenanceConfidence = (typeof PROVENANCE_CONFIDENCE_LEVELS)[number];
export type EvidenceOwnerType = (typeof EVIDENCE_OWNER_TYPES)[number];
export type EvidenceVisibility = (typeof EVIDENCE_VISIBILITIES)[number];
export interface EvidenceOwnership {
    readonly ownerType: EvidenceOwnerType;
    readonly ownerId?: string;
    readonly visibility: EvidenceVisibility;
}
export interface ProvenanceStep {
    readonly transformationId: string;
    readonly name: string;
    readonly timestamp: number;
    readonly inputProvenanceIds: readonly string[];
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface EvidenceProvenance {
    readonly version: string;
    readonly provenanceId: string;
    readonly sourceType: ProvenanceSourceType;
    readonly sourceName: string;
    readonly robotId?: string;
    readonly timestamp: number;
    readonly createdAt: string;
    readonly confidence: ProvenanceConfidence;
    readonly transformationHistory: readonly ProvenanceStep[];
    readonly ownership: EvidenceOwnership;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface ProvenanceValidationResult {
    readonly valid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
}
