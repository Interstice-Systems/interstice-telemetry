import type { EvidenceKind, EvidenceManifest, EvidenceManifestEntry } from "./evidenceManifestTypes.js";
export declare const traceEvidenceAncestors: (manifest: EvidenceManifest, evidenceId: string) => readonly EvidenceManifestEntry[];
export declare const traceEvidenceDescendants: (manifest: EvidenceManifest, evidenceId: string) => readonly EvidenceManifestEntry[];
export declare const findEvidenceByKind: (manifest: EvidenceManifest, kind: EvidenceKind) => readonly EvidenceManifestEntry[];
export declare const findEvidenceByRobot: (manifest: EvidenceManifest, robotId: string) => readonly EvidenceManifestEntry[];
export declare const findEvidenceByProvenance: (manifest: EvidenceManifest, provenanceId: string) => readonly EvidenceManifestEntry[];
