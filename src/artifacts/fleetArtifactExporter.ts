import { renderEventTimeline } from "../console/eventTimeline.js";
import { renderFaultReport } from "../console/faultReport.js";
import { renderReplayReport } from "../console/replayReport.js";
import { renderScenarioReport } from "../console/scenarioReport.js";
import { renderTelemetrySnapshot } from "../console/telemetryReport.js";
import { validateFleetReplayLog } from "../fleet/fleetReplay.js";
import {
  renderFleetReplayReport,
  renderFleetScenarioReport,
} from "../fleet/fleetReport.js";
import type { FleetScenarioRunResult } from "../fleet/fleetTypes.js";
import { buildFleetEventTimeline } from "../timeline/timelineBuilder.js";
import {
  renderFleetTimelineReport,
  renderFleetTimelineSummary,
} from "../timeline/timelineReport.js";
import { validateFleetEventTimeline } from "../timeline/timelineValidator.js";
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
import {
  sanitizeArtifactPathSegment,
  writeExperimentArtifacts,
} from "./artifactWriter.js";

export const createFleetTelemetrySummary = (
  result: FleetScenarioRunResult,
): TelemetrySummary => ({
  robotIds: Object.keys(result.robotResults).sort(),
  eventCount: result.summary.totalEvents,
  faultCount: result.summary.totalFaults,
  finalStates: structuredClone(result.summary.finalStates),
  durationMs: result.summary.durationMs,
});

const robotFiles = (
  robotId: string,
  folder: string,
): ExperimentArtifactFile[] => {
  const root = `robots/${folder}`;

  return [
    {
      path: `${root}/replay-log.json`,
      kind: "replay-log",
      format: "json",
      description: `Replay log for ${robotId}.`,
    },
    {
      path: `${root}/validation.json`,
      kind: "validation",
      format: "json",
      description: `Validation results for ${robotId}.`,
    },
    ...[
      "scenario-report",
      "telemetry-report",
      "event-timeline",
      "fault-report",
      "replay-report",
    ].map(
      (name): ExperimentArtifactFile => ({
        path: `${root}/reports/${name}.txt`,
        kind: "report",
        format: "txt",
        description: `${name.replaceAll("-", " ")} for ${robotId}.`,
      }),
    ),
  ];
};

export const exportFleetRunArtifacts = (
  result: FleetScenarioRunResult,
  options: ArtifactExportOptions = {},
): ArtifactWriteResult => {
  const robotIds = Object.keys(result.robotResults).sort();
  const folders = new Map(
    robotIds.map((robotId) => [
      robotId,
      sanitizeArtifactPathSegment(robotId),
    ]),
  );

  if (new Set(folders.values()).size !== folders.size) {
    throw new TypeError("Fleet robot IDs produce duplicate artifact folders.");
  }

  const files: ExperimentArtifactFile[] = [
    { path: "metadata.json", kind: "metadata", format: "json" },
    {
      path: "fleet-scenario.json",
      kind: "fleet-scenario",
      format: "json",
    },
    {
      path: "fleet-replay-log.json",
      kind: "fleet-replay-log",
      format: "json",
    },
    { path: "validation.json", kind: "validation", format: "json" },
    {
      path: "telemetry-summary.json",
      kind: "telemetry-summary",
      format: "json",
    },
    { path: "reports/fleet-report.txt", kind: "report", format: "txt" },
    {
      path: "reports/fleet-replay-report.txt",
      kind: "report",
      format: "txt",
    },
    {
      path: "timeline/fleet-event-timeline.json",
      kind: "fleet-event-timeline",
      format: "json",
    },
    {
      path: "timeline/fleet-timeline-report.txt",
      kind: "timeline-report",
      format: "txt",
    },
    {
      path: "timeline/fleet-timeline-summary.txt",
      kind: "timeline-summary",
      format: "txt",
    },
    ...robotIds.flatMap((robotId) =>
      robotFiles(robotId, folders.get(robotId)!),
    ),
  ];
  const metadata: ExperimentMetadata = {
    name: result.scenario.name,
    description: result.scenario.description,
    fleetId: result.scenario.id,
    robotIds,
    ...structuredClone(options.metadata ?? {}),
  };
  const bundle = createExperimentArtifactBundle({
    experimentId: options.experimentId ?? result.scenario.id,
    kind: "fleet",
    createdAt: options.createdAt ?? result.fleetReplayLog.createdAt,
    metadata,
    files,
  });
  const timeline = buildFleetEventTimeline(
    result.fleetReplayLog,
    metadata.clock === undefined
      ? {}
      : { clockKind: metadata.clock.kind },
  );
  const contents: Record<string, unknown> = {
    "metadata.json": createArtifactMetadataDocument(bundle),
    "fleet-scenario.json": result.scenario,
    "fleet-replay-log.json": result.fleetReplayLog,
    "validation.json": {
      fleet: result.fleetValidation,
      fleetReplay: validateFleetReplayLog(result.fleetReplayLog),
      timeline: validateFleetEventTimeline(timeline),
    },
    "telemetry-summary.json": createFleetTelemetrySummary(result),
    "reports/fleet-report.txt": renderFleetScenarioReport(result),
    "reports/fleet-replay-report.txt": renderFleetReplayReport(
      result.fleetReplayLog,
    ),
    "timeline/fleet-event-timeline.json": timeline,
    "timeline/fleet-timeline-report.txt":
      renderFleetTimelineReport(timeline),
    "timeline/fleet-timeline-summary.txt":
      renderFleetTimelineSummary(timeline),
  };

  for (const robotId of robotIds) {
    const robotResult = result.robotResults[robotId]!;
    const root = `robots/${folders.get(robotId)!}`;

    contents[`${root}/replay-log.json`] = robotResult.replayLog;
    contents[`${root}/validation.json`] = {
      scenario: robotResult.scenarioValidation,
      replay: robotResult.replayValidation,
    };
    contents[`${root}/reports/scenario-report.txt`] =
      renderScenarioReport(robotResult);
    contents[`${root}/reports/telemetry-report.txt`] =
      renderTelemetrySnapshot(robotResult.finalSnapshot);
    contents[`${root}/reports/event-timeline.txt`] = renderEventTimeline(
      robotResult.events,
      { includePayloadSummary: true },
    );
    contents[`${root}/reports/fault-report.txt`] = renderFaultReport(
      robotResult.events,
    );
    contents[`${root}/reports/replay-report.txt`] = renderReplayReport(
      robotResult.replayLog,
    );
  }

  return writeExperimentArtifacts(
    bundle,
    contents satisfies ArtifactFileContents,
    options,
  );
};
