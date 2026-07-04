import type { ArtifactWriteResult, CustomEvidenceArtifactExportInput } from "./artifactTypes.js";
/**
 * Writes deterministic, indexed evidence for an application-defined mission.
 *
 * This Node-only helper uses the existing artifact bundle and writer formats
 * but does not require SDK scenario or fleet result objects.
 */
export declare const exportCustomEvidenceArtifacts: (input: CustomEvidenceArtifactExportInput) => ArtifactWriteResult;
