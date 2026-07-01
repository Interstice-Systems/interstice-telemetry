import {
  existsSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";

import type {
  ArtifactFileContents,
  ArtifactWriteOptions,
  ArtifactWriteResult,
  ExperimentArtifactBundle,
  ExperimentArtifactFile,
} from "./artifactTypes.js";
import {
  isSafeRelativeArtifactPath,
  validateExperimentArtifactBundle,
} from "./artifactValidator.js";

export const DEFAULT_ARTIFACT_ROOT = "artifacts";

export const sanitizeArtifactPathSegment = (value: string): string => {
  const sanitized = value
    .trim()
    .replaceAll(/[^a-zA-Z0-9._-]+/g, "-")
    .replaceAll(/^[.-]+|[.-]+$/g, "")
    .replaceAll(/-+/g, "-");

  if (sanitized.length === 0) {
    throw new TypeError("Artifact path segment must contain safe characters.");
  }

  return sanitized;
};

const serializeContent = (
  file: ExperimentArtifactFile,
  content: unknown,
): string => {
  if (file.format === "txt") {
    if (typeof content !== "string") {
      throw new TypeError(`Text artifact "${file.path}" must be a string.`);
    }
    return content.endsWith("\n") ? content : `${content}\n`;
  }

  if (content === undefined) {
    throw new TypeError(`JSON artifact "${file.path}" has no content.`);
  }

  const serialized = JSON.stringify(content, undefined, 2);

  if (serialized === undefined) {
    throw new TypeError(`JSON artifact "${file.path}" is not serializable.`);
  }

  return `${serialized}\n`;
};

export const writeExperimentArtifacts = (
  bundle: ExperimentArtifactBundle,
  contents: ArtifactFileContents,
  options: ArtifactWriteOptions = {},
): ArtifactWriteResult => {
  const validation = validateExperimentArtifactBundle(bundle);

  if (!validation.valid) {
    throw new TypeError(
      `Invalid experiment artifact bundle: ${validation.errors.join(" ")}`,
    );
  }

  const declaredPaths = new Set(bundle.files.map(({ path }) => path));
  for (const path of Object.keys(contents)) {
    if (!declaredPaths.has(path)) {
      throw new TypeError(`Artifact content path "${path}" is not declared.`);
    }
  }

  const serializedFiles = bundle.files.map((file) => {
    if (!isSafeRelativeArtifactPath(file.path)) {
      throw new TypeError(`Unsafe artifact path "${file.path}".`);
    }
    if (!Object.hasOwn(contents, file.path)) {
      throw new TypeError(`Missing content for artifact "${file.path}".`);
    }

    return {
      file,
      content: serializeContent(file, contents[file.path]),
    };
  });
  const rootDir = resolve(options.rootDir ?? DEFAULT_ARTIFACT_ROOT);
  const folderName = sanitizeArtifactPathSegment(bundle.experimentId);
  const experimentPath = join(rootDir, folderName);

  if (existsSync(experimentPath)) {
    if (options.overwrite !== true) {
      throw new Error(
        `Experiment artifact folder already exists: ${experimentPath}`,
      );
    }
    rmSync(experimentPath, { recursive: true, force: true });
  }

  mkdirSync(experimentPath, { recursive: true });

  for (const { file, content } of serializedFiles) {
    const destination = join(experimentPath, file.path);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, content, "utf8");
  }

  writeFileSync(
    join(experimentPath, "artifact-index.json"),
    `${JSON.stringify(bundle, undefined, 2)}\n`,
    "utf8",
  );

  return {
    experimentPath,
    bundle: structuredClone(bundle),
    files: [
      "artifact-index.json",
      ...bundle.files.map(({ path }) => path),
    ].sort(),
  };
};
