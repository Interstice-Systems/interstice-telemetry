import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  createExperimentArtifactBundle,
  deserializeEvidenceManifest,
  deserializeFleetEventTimeline,
  deserializeReplayLog,
  deserializeRobotState,
  deserializeTwinTimeline,
  deterministicProvenanceStringify,
  serializeEvidenceManifest,
  serializeFleetEventTimeline,
  serializeReplayLog,
  serializeRobotState,
  serializeTwinTimeline,
  validateEvidenceManifest,
  validateEvidenceProvenance,
  validateExperimentArtifactBundle,
  validateFleetEventTimeline,
  validateReplayLog,
  validateRobotStateSchema,
  validateTwinTimelineSchema,
  type EvidenceProvenance,
  type ExperimentArtifactBundle,
} from "../src/index.js";

const fixture = (name: string): string =>
  readFileSync(
    fileURLToPath(
      new URL(`../fixtures/compatibility/${name}`, import.meta.url),
    ),
    "utf8",
  );

describe("serialized v1 compatibility fixtures", () => {
  it("loads, validates, and deterministically round-trips replay logs", () => {
    const value = deserializeReplayLog(fixture("replay-log.v1.json"));
    expect(validateReplayLog(value).valid).toBe(true);
    const serialized = serializeReplayLog(value);
    expect(serializeReplayLog(deserializeReplayLog(serialized))).toBe(serialized);
  });

  it("loads, validates, and deterministically round-trips fleet timelines", () => {
    const value = deserializeFleetEventTimeline(
      fixture("fleet-timeline.v1.json"),
    );
    expect(validateFleetEventTimeline(value).valid).toBe(true);
    const serialized = serializeFleetEventTimeline(value);
    expect(
      serializeFleetEventTimeline(deserializeFleetEventTimeline(serialized)),
    ).toBe(serialized);
  });

  it("loads, validates, and deterministically round-trips robot state", () => {
    const value = deserializeRobotState(fixture("robot-state.v1.json"));
    expect(validateRobotStateSchema(value).valid).toBe(true);
    const serialized = serializeRobotState(value);
    expect(serializeRobotState(deserializeRobotState(serialized))).toBe(
      serialized,
    );
  });

  it("loads, validates, and deterministically round-trips twin timelines", () => {
    const value = deserializeTwinTimeline(fixture("twin-timeline.v1.json"));
    expect(validateTwinTimelineSchema(value).valid).toBe(true);
    const serialized = serializeTwinTimeline(value);
    expect(serializeTwinTimeline(deserializeTwinTimeline(serialized))).toBe(
      serialized,
    );
  });

  it("loads, validates, and deterministically serializes provenance", () => {
    const value = JSON.parse(
      fixture("evidence-provenance.v1.json"),
    ) as EvidenceProvenance;
    expect(validateEvidenceProvenance(value).valid).toBe(true);
    expect(deterministicProvenanceStringify(value)).toBe(
      deterministicProvenanceStringify(
        JSON.parse(deterministicProvenanceStringify(value)),
      ),
    );
  });

  it("loads, validates, and deterministically round-trips manifests", () => {
    const value = deserializeEvidenceManifest(
      fixture("evidence-manifest.v1.json"),
    );
    expect(validateEvidenceManifest(value).valid).toBe(true);
    const serialized = serializeEvidenceManifest(value);
    expect(
      serializeEvidenceManifest(deserializeEvidenceManifest(serialized)),
    ).toBe(serialized);
  });

  it("loads, validates, and deterministically rebuilds artifact indexes", () => {
    const value = JSON.parse(
      fixture("experiment-artifact.v1.json"),
    ) as ExperimentArtifactBundle;
    expect(validateExperimentArtifactBundle(value).valid).toBe(true);
    const rebuilt = createExperimentArtifactBundle({
      experimentId: value.experimentId,
      createdAt: value.createdAt,
      kind: value.kind,
      metadata: value.metadata,
      files: value.files,
      version: value.version,
    });
    expect(rebuilt).toEqual(value);
    expect(JSON.stringify(rebuilt)).toBe(
      JSON.stringify(createExperimentArtifactBundle({
        experimentId: value.experimentId,
        createdAt: value.createdAt,
        kind: value.kind,
        metadata: value.metadata,
        files: value.files,
        version: value.version,
      })),
    );
  });
});
