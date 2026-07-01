import {
  existsSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { basename, extname, join, relative, resolve } from "node:path";

import {
  EXPERIMENT_ARTIFACT_VERSION,
  type ExperimentArtifactBundle,
  type ExperimentArtifactFile,
  type ExperimentArtifactFileKind,
  type ExperimentArtifactKind,
  type ExperimentArtifactMetadataDocument,
  type ExperimentMetadata,
  type LoadedExperimentArtifactFile,
  type LoadedExperimentArtifacts,
} from "./artifactTypes.js";
import {
  isSafeRelativeArtifactPath,
  validateExperimentArtifactBundle,
} from "./artifactValidator.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const readJson = (path: string): unknown =>
  JSON.parse(readFileSync(path, "utf8")) as unknown;

const listFiles = (directory: string, root = directory): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return listFiles(entryPath, root);
    }

    return entry.isFile()
      ? [relative(root, entryPath).replaceAll("\\", "/")]
      : [];
  });

const inferFileKind = (
  path: string,
): ExperimentArtifactFileKind | undefined => {
  const name = basename(path);

  if (path === "metadata.json") return "metadata";
  if (path === "scenario.json") return "scenario";
  if (path === "fleet-scenario.json") return "fleet-scenario";
  if (path === "fleet-replay-log.json") return "fleet-replay-log";
  if (name === "replay-log.json") return "replay-log";
  if (name === "validation.json") return "validation";
  if (path === "telemetry-summary.json") return "telemetry-summary";
  if (extname(path) === ".txt" && path.includes("reports/")) return "report";
  return undefined;
};

const isMetadataDocument = (
  value: unknown,
): value is ExperimentArtifactMetadataDocument =>
  isRecord(value) &&
  typeof value.version === "string" &&
  typeof value.experimentId === "string" &&
  typeof value.createdAt === "string" &&
  (value.kind === "scenario" || value.kind === "fleet") &&
  isRecord(value.metadata);

const toMetadata = (value: unknown): ExperimentMetadata => {
  if (!isRecord(value)) {
    throw new TypeError("metadata.json must contain an object.");
  }

  return value as unknown as ExperimentMetadata;
};

const discoverBundle = (
  experimentPath: string,
  metadataValue: unknown,
  warnings: string[],
): ExperimentArtifactBundle => {
  const paths = listFiles(experimentPath)
    .filter((path) => path !== "artifact-index.json")
    .sort();
  const files: ExperimentArtifactFile[] = paths.flatMap((path) => {
    const kind = inferFileKind(path);

    return kind === undefined
      ? []
      : [
          {
            path,
            kind,
            format: extname(path) === ".txt" ? "txt" : "json",
          },
        ];
  });
  const hasFleetScenario = paths.includes("fleet-scenario.json");
  const document = isMetadataDocument(metadataValue)
    ? metadataValue
    : undefined;

  warnings.push(
    "artifact-index.json is missing; known artifact files were discovered.",
  );

  return {
    version: document?.version ?? EXPERIMENT_ARTIFACT_VERSION,
    experimentId: document?.experimentId ?? basename(experimentPath),
    createdAt: document?.createdAt ?? new Date(0).toISOString(),
    kind:
      document?.kind ??
      (hasFleetScenario ? "fleet" : "scenario" satisfies ExperimentArtifactKind),
    metadata: toMetadata(document?.metadata ?? metadataValue),
    files,
  };
};

export const readExperimentArtifacts = (
  experimentPath: string,
): LoadedExperimentArtifacts => {
  const resolvedPath = resolve(experimentPath);
  const metadataPath = join(resolvedPath, "metadata.json");
  const indexPath = join(resolvedPath, "artifact-index.json");

  if (!existsSync(metadataPath)) {
    throw new Error(`Experiment metadata was not found: ${metadataPath}`);
  }

  const metadataValue = readJson(metadataPath);
  const warnings: string[] = [];
  const indexedValue = existsSync(indexPath) ? readJson(indexPath) : undefined;
  if (indexedValue !== undefined && !isRecord(indexedValue)) {
    throw new TypeError("artifact-index.json must contain an object.");
  }
  const bundle =
    indexedValue === undefined
      ? discoverBundle(resolvedPath, metadataValue, warnings)
      : (indexedValue as unknown as ExperimentArtifactBundle);
  const validation = validateExperimentArtifactBundle(bundle);
  const metadata = isMetadataDocument(metadataValue)
    ? toMetadata(metadataValue.metadata)
    : toMetadata(metadataValue);
  const files: LoadedExperimentArtifactFile[] = [];

  if (isMetadataDocument(metadataValue)) {
    if (metadataValue.experimentId !== bundle.experimentId) {
      warnings.push(
        "metadata.json experimentId does not match artifact-index.json.",
      );
    }
    if (metadataValue.kind !== bundle.kind) {
      warnings.push("metadata.json kind does not match artifact-index.json.");
    }
  }

  for (const file of Array.isArray(bundle.files) ? bundle.files : []) {
    if (!isSafeRelativeArtifactPath(file.path)) {
      warnings.push(`Skipped unsafe artifact path "${file.path}".`);
      continue;
    }

    const path = join(resolvedPath, file.path);
    if (!existsSync(path)) {
      warnings.push(`Artifact file is missing: ${file.path}`);
      continue;
    }

    try {
      files.push({
        ...structuredClone(file),
        content:
          file.format === "json"
            ? readJson(path)
            : readFileSync(path, "utf8"),
      });
    } catch (error) {
      warnings.push(
        `Could not read artifact "${file.path}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return {
    experimentPath: resolvedPath,
    bundle: structuredClone(bundle),
    metadata: structuredClone(metadata),
    files,
    validation,
    warnings: [...validation.warnings, ...warnings],
  };
};
