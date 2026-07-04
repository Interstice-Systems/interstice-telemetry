import { renderEventTimeline } from "../console/eventTimeline.js";
import { renderFaultReport } from "../console/faultReport.js";
import { renderReplayReport } from "../console/replayReport.js";
import { renderScenarioReport } from "../console/scenarioReport.js";
import { renderTelemetrySnapshot } from "../console/telemetryReport.js";
import type { ScenarioRunResult } from "../scenarios/scenarioTypes.js";
import { buildScenarioEvidenceManifest } from "../evidence/evidenceManifestBuilder.js";
import { renderProvenanceCoverageReport } from "../evidence/evidenceCoverage.js";
import { renderEvidenceManifestReport } from "../evidence/evidenceManifestReport.js";
import {
  createArtifactMetadataDocument,
  createExperimentArtifactBundle,
} from "./artifactBundle.js";
import type {
  ArtifactExportOptions,
  ArtifactFileContents,
  ArtifactWriteResult,
  ExperimentArtifactFile,
  ExperimentMetadata,
  TelemetrySummary,
} from "./artifactTypes.js";
import { writeExperimentArtifacts } from "./artifactWriter.js";

const SCENARIO_FILES: ExperimentArtifactFile[] = [
  { path: "metadata.json", kind: "metadata", format: "json" },
  { path: "scenario.json", kind: "scenario", format: "json" },
  { path: "replay-log.json", kind: "replay-log", format: "json" },
  { path: "validation.json", kind: "validation", format: "json" },
  {
    path: "telemetry-summary.json",
    kind: "telemetry-summary",
    format: "json",
  },
  { path: "reports/scenario-report.txt", kind: "report", format: "txt" },
  { path: "reports/telemetry-report.txt", kind: "report", format: "txt" },
  { path: "reports/event-timeline.txt", kind: "report", format: "txt" },
  { path: "reports/fault-report.txt", kind: "report", format: "txt" },
  { path: "reports/replay-report.txt", kind: "report", format: "txt" },
  {
    path: "evidence/evidence-manifest.json",
    kind: "evidence-manifest",
    format: "json",
  },
  {
    path: "evidence/evidence-manifest-report.txt",
    kind: "evidence-manifest-report",
    format: "txt",
  },
  {
    path: "evidence/provenance-coverage-report.txt",
    kind: "provenance-coverage-report",
    format: "txt",
  },
];

export const createScenarioTelemetrySummary = (
  result: ScenarioRunResult,
): TelemetrySummary => {
  const robotId = result.finalSnapshot.robotId;

  return {
    robotIds: [robotId],
    eventCount: result.summary.eventCount,
    faultCount: result.summary.faultCount,
    finalStates: { [robotId]: result.summary.finalState },
    durationMs: result.summary.durationMs,
  };
};

export const exportScenarioRunArtifacts = (
  result: ScenarioRunResult,
  options: ArtifactExportOptions = {},
): ArtifactWriteResult => {
  const robotId = result.finalSnapshot.robotId;
  const metadata: ExperimentMetadata = {
    name: result.scenario.name,
    description: result.scenario.description,
    scenarioId: result.scenario.id,
    robotIds: [robotId],
    ...structuredClone(options.metadata ?? {}),
  };
  const bundle = createExperimentArtifactBundle({
    experimentId: options.experimentId ?? result.scenario.id,
    kind: "scenario",
    createdAt: options.createdAt ?? result.replayLog.createdAt,
    metadata,
    files: SCENARIO_FILES,
  });
  const contents: Record<string, unknown> = {
    "metadata.json": createArtifactMetadataDocument(bundle),
    "scenario.json": result.scenario,
    "replay-log.json": result.replayLog,
    "validation.json": {
      scenario: result.scenarioValidation,
      replay: result.replayValidation,
    },
    "telemetry-summary.json": createScenarioTelemetrySummary(result),
    "reports/scenario-report.txt": renderScenarioReport(result),
    "reports/telemetry-report.txt": renderTelemetrySnapshot(
      result.finalSnapshot,
    ),
    "reports/event-timeline.txt": renderEventTimeline(result.events, {
      includePayloadSummary: true,
    }),
    "reports/fault-report.txt": renderFaultReport(result.events),
    "reports/replay-report.txt": renderReplayReport(result.replayLog),
  };
  const manifest = buildScenarioEvidenceManifest(bundle, contents);
  contents["evidence/evidence-manifest.json"] = manifest;
  contents["evidence/evidence-manifest-report.txt"] =
    renderEvidenceManifestReport(manifest);
  contents["evidence/provenance-coverage-report.txt"] =
    renderProvenanceCoverageReport(manifest);

  return writeExperimentArtifacts(
    bundle,
    contents satisfies ArtifactFileContents,
    options,
  );
};
