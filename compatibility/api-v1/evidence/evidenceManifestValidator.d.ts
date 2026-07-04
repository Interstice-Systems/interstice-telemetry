import { type EvidenceManifestValidationResult } from "./evidenceManifestTypes.js";
export declare const isSafeRelativeEvidencePath: (value: string) => boolean;
export declare const validateEvidenceManifest: (manifest: unknown) => EvidenceManifestValidationResult;
