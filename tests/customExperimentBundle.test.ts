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
  createCustomExperimentBundle,
  createEvidenceManifest,
  exportCustomExperimentBundle,
  readExperimentArtifacts,
  renderCustomExperimentSummary,
  validateCustomExperimentBundle,
  validateExperimentArtifactBundle,
  type CustomExperimentBundleInput,
  type ReplayLog,
} from "../src/index.js";

const directories: string[] = [];

afterEach(() => {
  for (const path of directories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const createRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "interstice-custom-bundle-"));
  directories.push(root);
  return root;
};

const replayLog: ReplayLog = {
  version: "0.3.0",
  robotId: "rover-0",
  createdAt: "1970-01-01T00:00:00.000Z",
  eventCount: 0,
  events: [],
};

const input = (): CustomExperimentBundleInput => ({
  experimentId: "rover-0-experiment",
  createdAt: 0,
  metadata: {
    name: "Rover-0 experiment",
    description: "External application evidence",
    robotIds: ["rover-0"],
    tags: ["dogfood"],
    applicationVersion: 1,
  },
  evidence: {
    replayLog,
    replayValidation: { valid: true, errors: [], warnings: [] },
    twinTimeline: { version: "1.0.0", entries: [] },
    diagnostics: { valid: true, diagnostics: [] },
    provenance: { provenanceId: "rover-0-source" },
    telemetrySummary: { eventCount: 0 },
  },
  customJson: {
    metrics: { distanceMeters: 3 },
    "mission-profile.json": { id: "square-patrol" },
  },
  reports: {
    summary: "Mission complete",
    "diagnostics.txt": "No diagnostics",
  },
});

describe("custom experiment bundles", () => {
  it("validates a complete bundle", () => {
    const bundle = createCustomExperimentBundle(input());

    expect(validateCustomExperimentBundle(bundle)).toMatchObject({
      valid: true,
      errors: [],
    });
    expect(renderCustomExperimentSummary(bundle)).toContain(
      "Custom experiment: Rover-0 experiment",
    );
  });

  it("rejects missing required identity and metadata", () => {
    expect(
      validateCustomExperimentBundle({
        experimentId: "",
        metadata: { name: "" },
      }),
    ).toMatchObject({
      valid: false,
      errors: expect.arrayContaining([
        "Custom experiment experimentId is required.",
        "Custom experiment metadata name is required.",
      ]),
    });
    expect(validateCustomExperimentBundle({ experimentId: "test" })).toMatchObject(
      {
        valid: false,
        errors: expect.arrayContaining([
          "Custom experiment metadata is required.",
        ]),
      },
    );
  });

  it.each([
    ["custom JSON", { customJson: { "../escape": {} } }, "Custom JSON"],
    ["report", { reports: { "/absolute": "unsafe" } }, "Report"],
  ])("rejects an unsafe %s key", (_label, addition, errorLabel) => {
    const value = { ...input(), ...addition };

    expect(validateCustomExperimentBundle(value)).toMatchObject({
      valid: false,
      errors: [
        expect.stringContaining(`${errorLabel} key`),
      ],
    });
  });

  it("validates replay logs and evidence manifests", () => {
    const value = input();
    const invalidManifest = createEvidenceManifest({
      experimentId: "different-experiment",
    });

    expect(
      validateCustomExperimentBundle({
        ...value,
        evidence: {
          ...value.evidence,
          replayLog: { ...replayLog, eventCount: 1 },
          evidenceManifest: invalidManifest,
        },
      }),
    ).toMatchObject({
      valid: false,
      errors: expect.arrayContaining([
        expect.stringContaining("Replay log:"),
        "Evidence manifest experimentId must match the custom experiment.",
      ]),
    });
  });

  it("derives a deterministic minimal evidence manifest without mutating input", () => {
    const value = input();
    const snapshot = structuredClone(value);
    const first = createCustomExperimentBundle(value);
    const second = createCustomExperimentBundle(value);

    expect(first.evidence?.evidenceManifest).toEqual(
      second.evidence?.evidenceManifest,
    );
    expect(first.evidence?.evidenceManifest?.evidence).toHaveLength(6);
    expect(first.evidence?.evidenceManifest?.relationships).toHaveLength(2);
    expect(
      first.evidence?.evidenceManifest?.evidence.map(
        ({ evidenceId }) => evidenceId,
      ),
    ).toContain("custom-experiment:rover-0-experiment:replayLog");
    expect(value).toEqual(snapshot);
  });

  it("preserves a user-provided evidence manifest", () => {
    const manifest = createEvidenceManifest({
      experimentId: "rover-0-experiment",
      manifestId: "caller-manifest",
      createdAt: 123,
    });
    const value = input();
    const bundle = createCustomExperimentBundle({
      ...value,
      evidence: { ...value.evidence, evidenceManifest: manifest },
    });

    expect(bundle.evidence?.evidenceManifest).toEqual(manifest);
    expect(bundle.evidence?.evidenceManifest?.manifestId).toBe(
      "caller-manifest",
    );
  });

  it("warns when evidence has no provenance", () => {
    const result = validateCustomExperimentBundle({
      experimentId: "no-provenance",
      metadata: { name: "No provenance" },
      evidence: { diagnostics: {} },
    });

    expect(result.valid).toBe(true);
    expect(result.warnings).toContain(
      "Custom experiment evidence has no provenance.",
    );
  });
});

describe("exportCustomExperimentBundle", () => {
  it("writes indexed evidence, custom JSON, and text reports that round-trip", () => {
    const rootDir = createRoot();
    const value = input();
    const snapshot = structuredClone(value);
    const written = exportCustomExperimentBundle(value, { rootDir });
    const expected = [
      "artifact-index.json",
      "custom/metrics.json",
      "custom/mission-profile.json",
      "diagnostics.json",
      "evidence/evidence-manifest.json",
      "metadata.json",
      "provenance.json",
      "replay-log.json",
      "replay-validation.json",
      "reports/diagnostics.txt",
      "reports/summary.txt",
      "telemetry-summary.json",
      "twin-timeline.json",
    ];

    expect(written.files).toEqual(expected);
    expect(value).toEqual(snapshot);
    for (const path of expected) {
      expect(existsSync(join(written.experimentPath, path))).toBe(true);
    }
    expect(
      JSON.parse(
        readFileSync(
          join(written.experimentPath, "custom/metrics.json"),
          "utf8",
        ),
      ),
    ).toEqual({ distanceMeters: 3 });
    expect(
      readFileSync(
        join(written.experimentPath, "reports/summary.txt"),
        "utf8",
      ),
    ).toBe("Mission complete\n");

    const index = JSON.parse(
      readFileSync(
        join(written.experimentPath, "artifact-index.json"),
        "utf8",
      ),
    );
    expect(validateExperimentArtifactBundle(index).valid).toBe(true);
    expect(readExperimentArtifacts(written.experimentPath)).toMatchObject({
      validation: { valid: true },
      bundle: { kind: "custom", experimentId: value.experimentId },
    });
  });

  it("writes only supplied evidence plus a derived manifest", () => {
    const written = exportCustomExperimentBundle(
      {
        experimentId: "partial",
        metadata: { name: "Partial evidence" },
        evidence: {
          diagnostics: { diagnostics: [] },
          provenance: { provenanceId: "source" },
        },
      },
      { rootDir: createRoot() },
    );

    expect(written.files).toEqual([
      "artifact-index.json",
      "diagnostics.json",
      "evidence/evidence-manifest.json",
      "metadata.json",
      "provenance.json",
    ]);
  });

  it("can disable derived manifest generation", () => {
    const bundle = createCustomExperimentBundle({
        experimentId: "no-manifest",
        metadata: { name: "No manifest" },
        evidence: { diagnostics: {} },
        deriveEvidenceManifest: false,
    });
    const written = exportCustomExperimentBundle(bundle, {
      rootDir: createRoot(),
    });

    expect(written.files).not.toContain("evidence/evidence-manifest.json");
  });

  it("refuses overwrite by default and replaces only when allowed", () => {
    const rootDir = createRoot();
    exportCustomExperimentBundle(input(), { rootDir });

    expect(() => exportCustomExperimentBundle(input(), { rootDir })).toThrow(
      /already exists/,
    );

    const replacement = { ...input(), reports: { summary: "Updated" } };
    const written = exportCustomExperimentBundle(replacement, {
      rootDir,
      overwrite: true,
    });
    expect(
      readFileSync(
        join(written.experimentPath, "reports/summary.txt"),
        "utf8",
      ),
    ).toBe("Updated\n");
    expect(
      existsSync(join(written.experimentPath, "reports/diagnostics.txt")),
    ).toBe(false);
  });

  it("writes a supplied evidence manifest byte-for-structure", () => {
    const manifest = createEvidenceManifest({
      experimentId: "preserved",
      manifestId: "preserved-by-export",
      createdAt: 456,
    });
    const written = exportCustomExperimentBundle(
      {
        experimentId: "preserved",
        metadata: { name: "Preserved manifest" },
        evidence: { evidenceManifest: manifest },
      },
      { rootDir: createRoot() },
    );
    const exported = JSON.parse(
      readFileSync(
        join(written.experimentPath, "evidence/evidence-manifest.json"),
        "utf8",
      ),
    );

    expect(exported).toEqual(manifest);
  });
});
