import { type EvidenceOwnership, type EvidenceProvenance, type ProvenanceConfidence, type ProvenanceSourceType, type ProvenanceStep } from "./provenanceTypes.js";
export interface CreateProvenanceInput {
    readonly provenanceId?: string;
    readonly sourceName: string;
    readonly robotId?: string;
    readonly timestamp: number;
    readonly createdAt?: string;
    readonly confidence?: ProvenanceConfidence;
    readonly ownership?: EvidenceOwnership;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface CreateTypedProvenanceInput extends CreateProvenanceInput {
    readonly sourceType: ProvenanceSourceType;
    readonly transformationHistory?: readonly ProvenanceStep[];
}
export interface ProvenanceStepInput {
    readonly transformationId?: string;
    readonly name: string;
    readonly timestamp?: number;
    readonly inputProvenanceIds?: readonly string[];
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export interface DeriveProvenanceOptions {
    readonly provenanceId?: string;
    readonly sourceName?: string;
    readonly robotId?: string;
    readonly confidence?: ProvenanceConfidence;
    readonly ownership?: EvidenceOwnership;
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export declare const createProvenance: (input: CreateTypedProvenanceInput) => EvidenceProvenance;
export declare const createSimulationProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const createTelemetryProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const createReplayProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const createAdapterProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const createImporterProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const createManualProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const createDerivedProvenance: (input: CreateProvenanceInput) => EvidenceProvenance;
export declare const appendTransformation: (provenance: EvidenceProvenance, transformation: ProvenanceStepInput) => EvidenceProvenance;
export declare const deriveProvenance: (provenance: EvidenceProvenance, transformation: ProvenanceStepInput, options?: DeriveProvenanceOptions) => EvidenceProvenance;
