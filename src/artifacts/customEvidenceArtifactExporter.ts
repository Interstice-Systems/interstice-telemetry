import { extname, posix } from "node:path";

import {
  createArtifactMetadataDocument,
  createExperimentArtifactBundle,
} from "./artifactBundle.js";
import type {
  ArtifactFileContents,
  ArtifactWriteResult,
  CustomEvidenceArtifactExportInput,
  CustomEvidenceReport,
  ExperimentArtifactFile,
  ExperimentArtifactFileKind,
  ExperimentArtifactFormat,
} from "./artifactTypes.js";
import { isSafeRelativeArtifactPath } from "./artifactValidator.js";
import { writeExperimentArtifacts } from "./artifactWriter.js";

const fixedEvidence = [
  ["replayLog", "replay-log.json", "replay-log"],
  ["replayValidation", "replay-validation.json", "replay-validation"],
  ["twinTimeline", "twin-timeline.json", "twin-timeline"],
  ["diagnostics", "diagnostics.json", "diagnostics"],
  ["provenance", "provenance.json", "provenance"],
  [
    "evidenceManifest",
    "evidence/evidence-manifest.json",
    "evidence-manifest",
  ],
] as const satisfies readonly [
  keyof CustomEvidenceArtifactExportInput,
  string,
  ExperimentArtifactFileKind,
][];

const reportDefinition = (
  name: string,
  input: string | CustomEvidenceReport,
): { file: ExperimentArtifactFile; content: unknown } => {
  if (!isSafeRelativeArtifactPath(name)) {
    throw new TypeError(`Unsafe custom report path "${name}".`);
  }

  const path = posix.join("reports", name.replaceAll("\\", "/"));
  const format: ExperimentArtifactFormat =
    typeof input === "string"
      ? "txt"
      : (input.format ?? (extname(name) === ".txt" ? "txt" : "json"));
  const content = typeof input === "string" ? input : input.content;

  return {
    file: {
      path,
      kind: "report",
      format,
      ...(typeof input === "string" || input.description === undefined
        ? {}
        : { description: input.description }),
    },
    content,
  };
};

/**
 * Writes deterministic, indexed evidence for an application-defined mission.
 *
 * This Node-only helper uses the existing artifact bundle and writer formats
 * but does not require SDK scenario or fleet result objects.
 */
export const exportCustomEvidenceArtifacts = (
  input: CustomEvidenceArtifactExportInput,
): ArtifactWriteResult => {
  const files: ExperimentArtifactFile[] = [
    { path: "metadata.json", kind: "metadata", format: "json" },
  ];
  const contents: Record<string, unknown> = {};

  for (const [key, path, kind] of fixedEvidence) {
    const content = input[key];
    if (content !== undefined) {
      files.push({ path, kind, format: "json" });
      contents[path] = content;
    }
  }

  for (const [name, report] of Object.entries(input.reports ?? {}).sort(
    ([left], [right]) => left.localeCompare(right),
  )) {
    const definition = reportDefinition(name, report);
    if (files.some(({ path }) => path === definition.file.path)) {
      throw new TypeError(`Duplicate custom artifact path "${definition.file.path}".`);
    }
    files.push(definition.file);
    contents[definition.file.path] = definition.content;
  }

  const bundle = createExperimentArtifactBundle({
    experimentId: input.experimentId,
    kind: "custom",
    metadata: input.metadata,
    ...(input.createdAt === undefined ? {} : { createdAt: input.createdAt }),
    files,
  });
  contents["metadata.json"] = createArtifactMetadataDocument(bundle);

  return writeExperimentArtifacts(
    bundle,
    contents satisfies ArtifactFileContents,
    {
      ...(input.rootDir === undefined ? {} : { rootDir: input.rootDir }),
      ...(input.overwrite === undefined ? {} : { overwrite: input.overwrite }),
    },
  );
};
