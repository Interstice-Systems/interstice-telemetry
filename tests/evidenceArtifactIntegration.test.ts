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
  EXPERIMENT_ARTIFACT_FILE_KINDS,
  deserializeEvidenceManifest,
  exportScenarioRunArtifacts,
  getBuiltInScenario,
  readExperimentArtifacts,
  runScenario,
  validateEvidenceManifest,
} from "../src/index.js";

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe("evidence artifact integration", () => {
  it("exports and reads canonical evidence manifest files", () => {
    const profile = getBuiltInScenario("motor-overheat");
    if (profile === undefined) throw new Error("Missing scenario.");
    const rootDir = mkdtempSync(join(tmpdir(), "interstice-evidence-export-"));
    directories.push(rootDir);
    const written = exportScenarioRunArtifacts(runScenario(profile), {
      rootDir,
    });
    const manifestPath = join(
      written.experimentPath,
      "evidence/evidence-manifest.json",
    );
    expect(existsSync(manifestPath)).toBe(true);
    expect(
      existsSync(join(
        written.experimentPath,
        "evidence/evidence-manifest-report.txt",
      )),
    ).toBe(true);
    expect(
      existsSync(join(
        written.experimentPath,
        "evidence/provenance-coverage-report.txt",
      )),
    ).toBe(true);

    const manifest = deserializeEvidenceManifest(
      readFileSync(manifestPath, "utf8"),
    );
    expect(validateEvidenceManifest(manifest).valid).toBe(true);
    const loaded = readExperimentArtifacts(written.experimentPath);
    expect(
      loaded.files.find(({ kind }) => kind === "evidence-manifest")?.content,
    ).toEqual(manifest);
  });

  it("registers all evidence artifact file kinds", () => {
    expect(EXPERIMENT_ARTIFACT_FILE_KINDS).toEqual(
      expect.arrayContaining([
        "evidence-manifest",
        "evidence-manifest-report",
        "provenance-coverage-report",
      ]),
    );
  });
});
