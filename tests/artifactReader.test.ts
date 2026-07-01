import {
  mkdtempSync,
  rmSync,
  unlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  createArtifactMetadataDocument,
  createExperimentArtifactBundle,
  readExperimentArtifacts,
  writeExperimentArtifacts,
} from "../src/index.js";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const path of temporaryDirectories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const writeFixture = () => {
  const rootDir = mkdtempSync(join(tmpdir(), "interstice-artifact-reader-"));
  temporaryDirectories.push(rootDir);
  const bundle = createExperimentArtifactBundle({
    experimentId: "reader-test",
    kind: "scenario",
    metadata: { name: "Reader Test", robotIds: ["robot-1"] },
    files: [
      { path: "metadata.json", kind: "metadata", format: "json" },
      { path: "scenario.json", kind: "scenario", format: "json" },
      { path: "reports/report.txt", kind: "report", format: "txt" },
    ],
  });

  return writeExperimentArtifacts(
    bundle,
    {
      "metadata.json": createArtifactMetadataDocument(bundle),
      "scenario.json": { id: "reader-scenario" },
      "reports/report.txt": "report",
    },
    { rootDir },
  );
};

describe("readExperimentArtifacts", () => {
  it("loads written metadata, index, JSON, and text", () => {
    const written = writeFixture();
    const loaded = readExperimentArtifacts(written.experimentPath);

    expect(loaded.metadata.name).toBe("Reader Test");
    expect(loaded.bundle.experimentId).toBe("reader-test");
    expect(loaded.files).toHaveLength(3);
    expect(loaded.validation.valid).toBe(true);
    expect(loaded.warnings).toEqual([]);
  });

  it("discovers known files without an index", () => {
    const written = writeFixture();
    unlinkSync(join(written.experimentPath, "artifact-index.json"));

    const loaded = readExperimentArtifacts(written.experimentPath);

    expect(loaded.bundle.files.map(({ path }) => path)).toEqual([
      "metadata.json",
      "reports/report.txt",
      "scenario.json",
    ]);
    expect(loaded.warnings[0]).toContain("index");
  });

  it("tolerates a missing optional report with a warning", () => {
    const written = writeFixture();
    unlinkSync(join(written.experimentPath, "reports/report.txt"));

    const loaded = readExperimentArtifacts(written.experimentPath);

    expect(loaded.files).toHaveLength(2);
    expect(loaded.warnings).toContain(
      "Artifact file is missing: reports/report.txt",
    );
  });
});
