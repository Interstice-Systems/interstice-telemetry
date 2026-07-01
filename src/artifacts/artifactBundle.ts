import {
  EXPERIMENT_ARTIFACT_VERSION,
  type ExperimentArtifactBundle,
  type ExperimentArtifactBundleInput,
  type ExperimentArtifactMetadataDocument,
} from "./artifactTypes.js";
import { validateExperimentArtifactBundle } from "./artifactValidator.js";

const toIsoString = (value: Date | string | number): string => {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("createdAt must be a valid date");
  }

  return date.toISOString();
};

export const createExperimentArtifactBundle = (
  input: ExperimentArtifactBundleInput,
): ExperimentArtifactBundle => {
  const bundle: ExperimentArtifactBundle = {
    version: input.version ?? EXPERIMENT_ARTIFACT_VERSION,
    experimentId: input.experimentId,
    createdAt: toIsoString(input.createdAt ?? 0),
    kind: input.kind,
    metadata: structuredClone(input.metadata),
    files: structuredClone(input.files),
  };
  const validation = validateExperimentArtifactBundle(bundle);

  if (!validation.valid) {
    throw new TypeError(
      `Invalid experiment artifact bundle: ${validation.errors.join(" ")}`,
    );
  }

  return bundle;
};

export const createArtifactMetadataDocument = (
  bundle: ExperimentArtifactBundle,
): ExperimentArtifactMetadataDocument => ({
  version: bundle.version,
  experimentId: bundle.experimentId,
  createdAt: bundle.createdAt,
  kind: bundle.kind,
  metadata: structuredClone(bundle.metadata),
});
