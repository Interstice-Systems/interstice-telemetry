import type { EvidenceManifest } from "../evidence/evidenceManifestTypes.js";
import type { ReplayLog } from "../replay/replayLog.js";

export interface CustomExperimentMetadata {
  readonly name: string;
  readonly description?: string;
  readonly robotIds?: readonly string[];
  readonly tags?: readonly string[];
  readonly source?: string;
  readonly [key: string]: unknown;
}

export interface CustomExperimentEvidence {
  readonly replayLog?: ReplayLog;
  readonly replayValidation?: unknown;
  readonly twinTimeline?: unknown;
  readonly diagnostics?: unknown;
  readonly provenance?: unknown;
  readonly evidenceManifest?: EvidenceManifest;
  readonly telemetrySummary?: unknown;
}

export interface CustomExperimentBundleInput {
  readonly experimentId: string;
  readonly metadata: CustomExperimentMetadata;
  readonly createdAt?: Date | string | number;
  readonly evidence?: CustomExperimentEvidence;
  readonly customJson?: Readonly<Record<string, unknown>>;
  readonly reports?: Readonly<Record<string, string>>;
  /**
   * Derive a minimal evidence manifest when evidence is present and no
   * manifest was supplied. Defaults to true.
   */
  readonly deriveEvidenceManifest?: boolean;
}

export interface CustomExperimentBundle {
  readonly experimentId: string;
  readonly metadata: CustomExperimentMetadata;
  readonly createdAt: string;
  readonly deriveEvidenceManifest: boolean;
  readonly evidence?: CustomExperimentEvidence;
  readonly customJson?: Readonly<Record<string, unknown>>;
  readonly reports?: Readonly<Record<string, string>>;
}

export interface CustomExperimentBundleValidationResult {
  readonly valid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

export interface CustomExperimentExportOptions {
  readonly rootDir?: string;
  readonly overwrite?: boolean;
}
