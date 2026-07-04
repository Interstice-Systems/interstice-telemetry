export declare const EVIDENCE_MANIFEST_VERSION = "1.0.0";
export declare const EVIDENCE_KINDS: readonly ["telemetry", "event", "replay-log", "fleet-timeline", "artifact", "robot-state", "twin-timeline", "diagnostic-report", "provenance", "scene", "manifest"];
export declare const EVIDENCE_RELATIONSHIP_TYPES: readonly ["produced", "derived-from", "validated-by", "reported-by", "contains", "describes"];
export declare const EVIDENCE_FORMATS: readonly ["json", "txt", "schema", "unknown"];
export type EvidenceKind = (typeof EVIDENCE_KINDS)[number];
export type EvidenceRelationshipType = (typeof EVIDENCE_RELATIONSHIP_TYPES)[number];
export type EvidenceFormat = (typeof EVIDENCE_FORMATS)[number];
export interface EvidenceManifestEntry {
    readonly evidenceId: string;
    readonly kind: EvidenceKind;
    readonly path?: string;
    readonly robotId?: string;
    readonly timestamp?: number;
    readonly provenanceId?: string;
    readonly format?: EvidenceFormat;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface EvidenceRelationship {
    readonly relationshipId: string;
    readonly fromEvidenceId: string;
    readonly toEvidenceId: string;
    readonly type: EvidenceRelationshipType;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface EvidenceManifest {
    readonly version: string;
    readonly manifestId: string;
    readonly experimentId: string;
    readonly createdAt: string;
    readonly evidence: readonly EvidenceManifestEntry[];
    readonly relationships: readonly EvidenceRelationship[];
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface EvidenceManifestValidationResult {
    readonly valid: boolean;
    readonly errors: readonly string[];
    readonly warnings: readonly string[];
}
export interface ProvenanceCoverageSummary {
    readonly totalEvidence: number;
    readonly evidenceWithProvenance: number;
    readonly evidenceWithoutProvenance: number;
    readonly coverageRatio: number;
    readonly missingProvenanceEvidenceIds: readonly string[];
}
