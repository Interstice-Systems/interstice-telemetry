import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  createArtifactMetadataDocument,
  createExperimentArtifactBundle,
  writeExperimentArtifacts,
} from "../src/index.js";

const temporaryDirectories: string[] = [];

const temporaryDirectory = (): string => {
  const path = mkdtempSync(join(tmpdir(), "interstice-artifact-writer-"));
  temporaryDirectories.push(path);
  return path;
};

afterEach(() => {
  for (const path of temporaryDirectories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const bundle = () =>
  createExperimentArtifactBundle({
    experimentId: "../Unsafe Experiment",
    kind: "scenario",
    metadata: { name: "Writer Test", robotIds: ["robot-1"] },
    files: [
      { path: "metadata.json", kind: "metadata", format: "json" },
      { path: "reports/report.txt", kind: "report", format: "txt" },
    ],
  });

describe("writeExperimentArtifacts", () => {
  it("creates sanitized directories, pretty JSON, text, and an index", () => {
    const artifactBundle = bundle();
    const result = writeExperimentArtifacts(
      artifactBundle,
      {
        "metadata.json": createArtifactMetadataDocument(artifactBundle),
        "reports/report.txt": "report",
      },
      { rootDir: temporaryDirectory() },
    );

    expect(result.experimentPath).toMatch(/Unsafe-Experiment$/);
    expect(existsSync(join(result.experimentPath, "artifact-index.json"))).toBe(
      true,
    );
    expect(existsSync(join(result.experimentPath, "reports/report.txt"))).toBe(
      true,
    );
    expect(readFileSync(join(result.experimentPath, "metadata.json"), "utf8"))
      .toContain('\n  "version": "0.8.0"');
  });

  it("refuses overwrite by default and allows explicit overwrite", () => {
    const artifactBundle = bundle();
    const rootDir = temporaryDirectory();
    const contents = {
      "metadata.json": createArtifactMetadataDocument(artifactBundle),
      "reports/report.txt": "first",
    };

    writeExperimentArtifacts(artifactBundle, contents, { rootDir });
    expect(() =>
      writeExperimentArtifacts(artifactBundle, contents, { rootDir }),
    ).toThrow(/already exists/);

    const result = writeExperimentArtifacts(
      artifactBundle,
      { ...contents, "reports/report.txt": "second" },
      { rootDir, overwrite: true },
    );
    expect(
      readFileSync(join(result.experimentPath, "reports/report.txt"), "utf8"),
    ).toBe("second\n");
  });
});
