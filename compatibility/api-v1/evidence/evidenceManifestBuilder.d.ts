import type { ArtifactFileContents, ExperimentArtifactBundle } from "../artifacts/artifactTypes.js";
import { type EvidenceManifest, type EvidenceManifestEntry, type EvidenceRelationship } from "./evidenceManifestTypes.js";
export type EvidenceManifestEntryInput = Omit<EvidenceManifestEntry, "evidenceId"> & {
    readonly evidenceId?: string;
};
export type EvidenceRelationshipInput = Omit<EvidenceRelationship, "relationshipId"> & {
    readonly relationshipId?: string;
};
export interface CreateEvidenceManifestInput {
    readonly version?: string;
    readonly manifestId?: string;
    readonly experimentId: string;
    readonly createdAt?: Date | string | number;
    readonly evidence?: readonly EvidenceManifestEntryInput[];
    readonly relationships?: readonly EvidenceRelationshipInput[];
    readonly metadata?: Readonly<Record<string, unknown>>;
}
export declare const createEvidenceManifestEntry: (input: EvidenceManifestEntryInput) => EvidenceManifestEntry;
export declare const createEvidenceRelationship: (input: EvidenceRelationshipInput) => EvidenceRelationship;
export declare const createEvidenceManifest: (input: CreateEvidenceManifestInput) => EvidenceManifest;
export declare const addEvidenceEntry: (manifest: EvidenceManifest, entry: EvidenceManifestEntryInput) => EvidenceManifest;
export declare const addEvidenceRelationship: (manifest: EvidenceManifest, relationship: EvidenceRelationshipInput) => EvidenceManifest;
export declare const buildEvidenceManifestFromArtifactBundle: (bundle: ExperimentArtifactBundle, contents?: ArtifactFileContents) => EvidenceManifest;
export declare const buildScenarioEvidenceManifest: (bundle: ExperimentArtifactBundle, contents?: ArtifactFileContents) => EvidenceManifest;
export declare const buildFleetEvidenceManifest: (bundle: ExperimentArtifactBundle, contents?: ArtifactFileContents) => EvidenceManifest;
export declare const serializeEvidenceManifest: (manifest: EvidenceManifest, pretty?: boolean) => string;
export declare const deserializeEvidenceManifest: (json: string) => EvidenceManifest;
