import type { EvidenceManifest, ProvenanceCoverageSummary } from "./evidenceManifestTypes.js";
export declare const summarizeProvenanceCoverage: (manifest: EvidenceManifest) => ProvenanceCoverageSummary;
export declare const renderProvenanceCoverageReport: (manifest: EvidenceManifest) => string;
