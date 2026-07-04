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
  exportCustomEvidenceArtifacts,
  readExperimentArtifacts,
} from "../src/index.js";

const directories: string[] = [];

afterEach(() => {
  for (const path of directories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const createRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "interstice-custom-export-"));
  directories.push(root);
  return root;
};

const evidence = {
  experimentId: "rover-0-mission",
  metadata: {
    name: "Rover-0 deterministic mission",
    robotIds: ["rover-0"],
  },
  createdAt: 0,
  replayLog: { version: "1.0.0", events: [{ sequence: 1 }] },
  replayValidation: { valid: true, errors: [], warnings: [] },
  twinTimeline: { version: "1.0.0", states: [{ timestamp: 1_000 }] },
  diagnostics: { valid: true, diagnostics: [] },
  provenance: { source: "adapter" },
  evidenceManifest: { version: "1.0.0", entries: [] },
  reports: {
    "mission-report.txt": "Mission complete",
    "metrics.json": { content: { distanceMeters: 3 }, format: "json" as const },
  },
};

describe("exportCustomEvidenceArtifacts", () => {
  it("writes the expected indexed layout and round-trips JSON", () => {
    const rootDir = createRoot();
    const inputSnapshot = structuredClone(evidence);

    const written = exportCustomEvidenceArtifacts({ ...evidence, rootDir });
    const expected = [
      "artifact-index.json",
      "diagnostics.json",
      "evidence/evidence-manifest.json",
      "metadata.json",
      "provenance.json",
      "replay-log.json",
      "replay-validation.json",
      "reports/metrics.json",
      "reports/mission-report.txt",
      "twin-timeline.json",
    ];

    expect(written.files).toEqual(expected);
    for (const path of expected) {
      expect(existsSync(join(written.experimentPath, path))).toBe(true);
    }
    expect(JSON.parse(readFileSync(
      join(written.experimentPath, "replay-log.json"),
      "utf8",
    ))).toEqual(evidence.replayLog);
    expect(JSON.parse(readFileSync(
      join(written.experimentPath, "reports/metrics.json"),
      "utf8",
    ))).toEqual({ distanceMeters: 3 });
    expect(readExperimentArtifacts(written.experimentPath)).toMatchObject({
      validation: { valid: true },
      bundle: { kind: "custom", experimentId: evidence.experimentId },
    });
    expect(evidence).toEqual(inputSnapshot);
  });

  it("refuses overwrite by default", () => {
    const rootDir = createRoot();
    exportCustomEvidenceArtifacts({ ...evidence, rootDir });

    expect(() =>
      exportCustomEvidenceArtifacts({ ...evidence, rootDir }),
    ).toThrow(/already exists/);
  });

  it("overwrites only when explicitly allowed", () => {
    const rootDir = createRoot();
    const first = exportCustomEvidenceArtifacts({ ...evidence, rootDir });

    exportCustomEvidenceArtifacts({
      ...evidence,
      rootDir,
      overwrite: true,
      diagnostics: { valid: false, diagnostics: [{ id: "updated" }] },
    });

    expect(JSON.parse(readFileSync(
      join(first.experimentPath, "diagnostics.json"),
      "utf8",
    ))).toEqual({
      valid: false,
      diagnostics: [{ id: "updated" }],
    });
  });
});
