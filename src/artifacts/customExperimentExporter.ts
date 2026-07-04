import { posix } from "node:path";

import {
  createEvidenceManifest,
  createEvidenceManifestEntry,
  createEvidenceRelationship,
  type EvidenceManifestEntryInput,
} from "../evidence/evidenceManifestBuilder.js";
import type {
  EvidenceKind,
  EvidenceManifest,
} from "../evidence/evidenceManifestTypes.js";
import {
  createArtifactMetadataDocument,
  createExperimentArtifactBundle,
} from "./artifactBundle.js";
import type {
  CustomExperimentBundle,
  CustomExperimentBundleInput,
  CustomExperimentEvidence,
  CustomExperimentExportOptions,
} from "./customExperimentBundle.js";
import { validateCustomExperimentBundle } from "./customExperimentBundleValidator.js";
import type {
  ArtifactFileContents,
  ArtifactWriteResult,
  ExperimentArtifactFile,
  ExperimentArtifactFileKind,
  ExperimentMetadata,
} from "./artifactTypes.js";
import { writeExperimentArtifacts } from "./artifactWriter.js";

const evidenceFiles = [
  ["replayLog", "replay-log.json", "replay-log", "replay-log"],
  [
    "replayValidation",
    "replay-validation.json",
    "replay-validation",
    "artifact",
  ],
  ["twinTimeline", "twin-timeline.json", "twin-timeline", "twin-timeline"],
  ["diagnostics", "diagnostics.json", "diagnostics", "diagnostic-report"],
  ["provenance", "provenance.json", "provenance", "provenance"],
  [
    "telemetrySummary",
    "telemetry-summary.json",
    "telemetry-summary",
    "telemetry",
  ],
] as const satisfies readonly [
  Exclude<keyof CustomExperimentEvidence, "evidenceManifest">,
  string,
  ExperimentArtifactFileKind,
  EvidenceKind,
][];

const toIsoString = (value: Date | string | number): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("Custom experiment createdAt must be a valid date.");
  }
  return date.toISOString();
};

const sortedRecord = <T>(
  value: Readonly<Record<string, T>> | undefined,
): Readonly<Record<string, T>> | undefined => {
  if (value === undefined) return undefined;
  return Object.fromEntries(
    Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, structuredClone(entry)]),
  );
};

const derivedManifest = (
  experimentId: string,
  createdAt: string,
  evidence: CustomExperimentEvidence,
): EvidenceManifest | undefined => {
  const entries = evidenceFiles.flatMap(([key, path, , kind]) => {
    if (evidence[key] === undefined) return [];
    const input: EvidenceManifestEntryInput = {
      evidenceId: `custom-experiment:${experimentId}:${key}`,
      kind,
      path,
      format: "json",
    };
    return [createEvidenceManifestEntry(input)];
  });
  if (entries.length === 0) return undefined;

  const replay = entries.find(({ path }) => path === "replay-log.json");
  const replayValidation = entries.find(
    ({ path }) => path === "replay-validation.json",
  );
  const twinTimeline = entries.find(
    ({ path }) => path === "twin-timeline.json",
  );
  const relationships = [
    ...(replay === undefined || replayValidation === undefined
      ? []
      : [
          createEvidenceRelationship({
            fromEvidenceId: replay.evidenceId,
            toEvidenceId: replayValidation.evidenceId,
            type: "validated-by",
          }),
        ]),
    ...(replay === undefined || twinTimeline === undefined
      ? []
      : [
          createEvidenceRelationship({
            fromEvidenceId: twinTimeline.evidenceId,
            toEvidenceId: replay.evidenceId,
            type: "derived-from",
          }),
        ]),
  ];

  return createEvidenceManifest({
    experimentId,
    createdAt,
    evidence: entries,
    relationships,
    metadata: { source: "custom-experiment-bundle" },
  });
};

export const createCustomExperimentBundle = (
  input: CustomExperimentBundleInput,
): CustomExperimentBundle => {
  const inputValidation = validateCustomExperimentBundle(input);
  if (!inputValidation.valid) {
    throw new TypeError(
      `Invalid custom experiment bundle: ${inputValidation.errors.join(" ")}`,
    );
  }

  const createdAt = toIsoString(input.createdAt ?? 0);
  const evidence =
    input.evidence === undefined
      ? undefined
      : structuredClone(input.evidence);
  if (
    evidence !== undefined &&
    evidence.evidenceManifest === undefined &&
    input.deriveEvidenceManifest !== false
  ) {
    const manifest = derivedManifest(input.experimentId, createdAt, evidence);
    if (manifest !== undefined) {
      (evidence as { evidenceManifest?: EvidenceManifest }).evidenceManifest =
        manifest;
    }
  }

  const customJson = sortedRecord(input.customJson);
  const reports = sortedRecord(input.reports);
  const bundle: CustomExperimentBundle = {
    experimentId: input.experimentId,
    metadata: structuredClone(input.metadata),
    createdAt,
    deriveEvidenceManifest: input.deriveEvidenceManifest !== false,
    ...(evidence === undefined ? {} : { evidence }),
    ...(customJson === undefined ? {} : { customJson }),
    ...(reports === undefined ? {} : { reports }),
  };
  const validation = validateCustomExperimentBundle(bundle);
  if (!validation.valid) {
    throw new TypeError(
      `Invalid custom experiment bundle: ${validation.errors.join(" ")}`,
    );
  }
  return bundle;
};

const withExtension = (name: string, extension: ".json" | ".txt"): string =>
  name.endsWith(extension) ? name : `${name}${extension}`;

const artifactMetadata = (
  bundle: CustomExperimentBundle,
): ExperimentMetadata =>
  ({
    ...structuredClone(bundle.metadata),
    name: bundle.metadata.name,
    robotIds: [...(bundle.metadata.robotIds ?? [])],
    ...(bundle.metadata.tags === undefined
      ? {}
      : { tags: [...bundle.metadata.tags] }),
  }) as ExperimentMetadata;

export const exportCustomExperimentBundle = (
  input: CustomExperimentBundleInput | CustomExperimentBundle,
  options: CustomExperimentExportOptions = {},
): ArtifactWriteResult => {
  const bundle = createCustomExperimentBundle(input);
  const files: ExperimentArtifactFile[] = [
    { path: "metadata.json", kind: "metadata", format: "json" },
  ];
  const contents: Record<string, unknown> = {};

  for (const [key, path, kind] of evidenceFiles) {
    const content = bundle.evidence?.[key];
    if (content !== undefined) {
      files.push({ path, kind, format: "json" });
      contents[path] = content;
    }
  }

  if (bundle.evidence?.evidenceManifest !== undefined) {
    const path = "evidence/evidence-manifest.json";
    files.push({ path, kind: "evidence-manifest", format: "json" });
    contents[path] = bundle.evidence.evidenceManifest;
  }

  for (const [name, content] of Object.entries(bundle.customJson ?? {})) {
    const path = posix.join("custom", withExtension(name, ".json"));
    files.push({ path, kind: "report", format: "json" });
    contents[path] = content;
  }
  for (const [name, content] of Object.entries(bundle.reports ?? {})) {
    const path = posix.join("reports", withExtension(name, ".txt"));
    files.push({ path, kind: "report", format: "txt" });
    contents[path] = content;
  }

  const artifactBundle = createExperimentArtifactBundle({
    experimentId: bundle.experimentId,
    kind: "custom",
    metadata: artifactMetadata(bundle),
    createdAt: bundle.createdAt,
    files,
  });
  contents["metadata.json"] = createArtifactMetadataDocument(artifactBundle);

  return writeExperimentArtifacts(
    artifactBundle,
    contents satisfies ArtifactFileContents,
    options,
  );
};

export const renderCustomExperimentSummary = (
  bundle: CustomExperimentBundle,
): string => {
  const validation = validateCustomExperimentBundle(bundle);
  const evidence: string[] = evidenceFiles
    .filter(([key]) => bundle.evidence?.[key] !== undefined)
    .map(([, path]) => path);
  if (bundle.evidence?.evidenceManifest !== undefined) {
    evidence.push("evidence/evidence-manifest.json");
  }
  return [
    `Custom experiment: ${bundle.metadata.name}`,
    `Experiment ID: ${bundle.experimentId}`,
    `Created: ${bundle.createdAt}`,
    `Valid: ${validation.valid ? "yes" : "no"}`,
    `Evidence files: ${evidence.length}`,
    ...evidence.map((path) => `- ${path}`),
    `Custom JSON files: ${Object.keys(bundle.customJson ?? {}).length}`,
    `Reports: ${Object.keys(bundle.reports ?? {}).length}`,
  ].join("\n");
};
