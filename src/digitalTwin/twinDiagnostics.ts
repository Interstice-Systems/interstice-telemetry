import { toImmutableJson } from "./deterministicJson.js";
import { validateRobotStateSchema, validateTwinTimelineSchema } from "./schemaValidation.js";
import type { RobotState } from "./robotState.js";
import { ROBOT_OPERATING_MODES } from "./robotState.js";
import type { TwinTimeline } from "./twinTimeline.js";
import { deriveProvenance } from "../provenance/provenanceBuilder.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
import { validateEvidenceProvenance } from "../provenance/provenanceValidator.js";

export const TWIN_DIAGNOSTIC_SEVERITIES = [
  "info",
  "warning",
  "error",
] as const;

export type TwinDiagnosticSeverity =
  (typeof TWIN_DIAGNOSTIC_SEVERITIES)[number];

export interface TwinDiagnostic {
  readonly id: string;
  readonly severity: TwinDiagnosticSeverity;
  readonly category: string;
  readonly message: string;
  readonly robotId?: string;
  readonly timestamp?: number;
  readonly recordIndex?: number;
  readonly evidence?: Readonly<Record<string, unknown>>;
}

export interface TwinDiagnosticReport {
  readonly valid: boolean;
  readonly diagnostics: readonly TwinDiagnostic[];
  readonly summary: {
    readonly info: number;
    readonly warnings: number;
    readonly errors: number;
  };
  readonly provenance?: EvidenceProvenance;
}

export interface TwinDiagnosticOptions {
  readonly expectedSceneId?: string;
  readonly includeSchemaIssues?: boolean;
}

const operatingModes = new Set<string>(ROBOT_OPERATING_MODES);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const compareDiagnostics = (
  left: TwinDiagnostic,
  right: TwinDiagnostic,
): number =>
  (left.recordIndex ?? -1) - (right.recordIndex ?? -1) ||
  (left.timestamp ?? -1) - (right.timestamp ?? -1) ||
  left.category.localeCompare(right.category) ||
  left.id.localeCompare(right.id) ||
  left.message.localeCompare(right.message);

export const createTwinDiagnosticReport = (
  diagnostics: readonly TwinDiagnostic[],
  provenance?: EvidenceProvenance,
): TwinDiagnosticReport => {
  const sorted = [...diagnostics].sort(compareDiagnostics);
  const summary = {
    info: sorted.filter(({ severity }) => severity === "info").length,
    warnings: sorted.filter(({ severity }) => severity === "warning").length,
    errors: sorted.filter(({ severity }) => severity === "error").length,
  };
  return toImmutableJson(
    {
      valid: summary.errors === 0,
      diagnostics: sorted,
      summary,
      ...(provenance === undefined ? {} : { provenance }),
    },
    "twinDiagnosticReport",
  );
};

const schemaDiagnostics = (
  value: unknown,
  kind: "robot-state" | "twin-timeline",
  recordIndex?: number,
): TwinDiagnostic[] => {
  const result =
    kind === "robot-state"
      ? validateRobotStateSchema(value)
      : validateTwinTimelineSchema(value);
  return result.issues.map((issue) => ({
    id: `schema.${issue.keyword}`,
    severity: "error",
    category: "schema",
    message: `${issue.instancePath || "/"} ${issue.message}`,
    ...(recordIndex === undefined ? {} : { recordIndex }),
    evidence: {
      instancePath: issue.instancePath,
      schemaPath: issue.schemaPath,
    },
  }));
};

const numericPoseDiagnostics = (
  state: Record<string, unknown>,
  context: Pick<TwinDiagnostic, "robotId" | "timestamp" | "recordIndex">,
): TwinDiagnostic[] => {
  const diagnostics: TwinDiagnostic[] = [];
  const pose = state.globalPose;
  const values: [string, unknown][] = [];
  if (isRecord(pose)) {
    const position = pose.position;
    const orientation = pose.orientation;
    if (isRecord(position)) {
      for (const axis of ["x", "y", "z"]) {
        values.push([`globalPose.position.${axis}`, position[axis]]);
      }
    }
    if (isRecord(orientation)) {
      for (const axis of ["x", "y", "z", "w"]) {
        values.push([`globalPose.orientation.${axis}`, orientation[axis]]);
      }
    }
  }
  for (const [path, value] of values) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      diagnostics.push({
        id: "state.pose.invalid-number",
        severity: "error",
        category: "pose",
        message: `${path} must be a finite number`,
        ...context,
        evidence: { path, value: String(value) },
      });
    }
  }
  return diagnostics;
};

const inspectRobotState = (
  value: unknown,
  recordIndex?: number,
  includeSchemaIssues = true,
): TwinDiagnostic[] => {
  const diagnostics = includeSchemaIssues
    ? schemaDiagnostics(value, "robot-state", recordIndex)
    : [];
  if (!isRecord(value)) return diagnostics;

  const robotId =
    typeof value.robotId === "string" ? value.robotId : undefined;
  const timestamp =
    typeof value.timestamp === "number" && Number.isFinite(value.timestamp)
      ? value.timestamp
      : undefined;
  const context = {
    ...(robotId === undefined ? {} : { robotId }),
    ...(timestamp === undefined ? {} : { timestamp }),
    ...(recordIndex === undefined ? {} : { recordIndex }),
  };

  if (typeof value.robotId !== "string" || value.robotId.length === 0) {
    diagnostics.push({
      id: "state.robot-id.missing",
      severity: "error",
      category: "identity",
      message: "Robot state must include a non-empty robotId",
      ...context,
    });
  }

  if (
    value.operatingMode !== undefined &&
    (typeof value.operatingMode !== "string" ||
      !operatingModes.has(value.operatingMode))
  ) {
    diagnostics.push({
      id: "state.operating-mode.invalid",
      severity: "error",
      category: "operating-mode",
      message: "Robot state operatingMode is not supported",
      ...context,
      evidence: { operatingMode: String(value.operatingMode) },
    });
  }

  if (isRecord(value.batteryStatus)) {
    const charge = value.batteryStatus.charge;
    if (
      typeof charge !== "number" ||
      !Number.isFinite(charge) ||
      charge < 0 ||
      charge > 1
    ) {
      diagnostics.push({
        id: "state.battery.charge-out-of-range",
        severity: "error",
        category: "battery",
        message: "Battery charge must be a finite number between 0 and 1",
        ...context,
        evidence: { charge: String(charge) },
      });
    }
  }

  diagnostics.push(...numericPoseDiagnostics(value, context));
  return diagnostics;
};

export const validateRobotState = (
  state: RobotState | unknown,
): TwinDiagnosticReport =>
  createTwinDiagnosticReport(inspectRobotState(state));

export const runTwinDiagnostics = (
  timeline: TwinTimeline | unknown,
  options: TwinDiagnosticOptions = {},
): TwinDiagnosticReport => {
  const provenanceValidation =
    isRecord(timeline) && timeline.provenance !== undefined
      ? validateEvidenceProvenance(timeline.provenance)
      : undefined;
  const inputProvenance =
    provenanceValidation?.valid === true
      ? (timeline as { provenance: EvidenceProvenance }).provenance
      : undefined;
  const reportProvenance =
    inputProvenance === undefined
      ? undefined
      : deriveProvenance(inputProvenance, {
          name: "Diagnostics",
          timestamp: Math.max(
            inputProvenance.timestamp,
            isRecord(timeline) && Array.isArray(timeline.states)
              ? timeline.states.reduce(
                  (latest, state) =>
                    isRecord(state) &&
                    typeof state.timestamp === "number" &&
                    Number.isSafeInteger(state.timestamp)
                      ? Math.max(latest, state.timestamp)
                      : latest,
                  0,
                )
              : 0,
          ),
        });
  const diagnostics =
    options.includeSchemaIssues === false
      ? []
      : schemaDiagnostics(timeline, "twin-timeline");
  if (provenanceValidation?.valid === false) {
    diagnostics.push(
      ...provenanceValidation.errors.map((message) => ({
        id: "provenance.invalid",
        severity: "error" as const,
        category: "provenance",
        message,
      })),
    );
  }
  if (!isRecord(timeline)) {
    return createTwinDiagnosticReport(diagnostics, reportProvenance);
  }

  const timelineRobotId =
    typeof timeline.robotId === "string" ? timeline.robotId : undefined;
  if (timelineRobotId === undefined || timelineRobotId.length === 0) {
    diagnostics.push({
      id: "timeline.robot-id.missing",
      severity: "error",
      category: "identity",
      message: "Twin timeline must include a non-empty robotId",
    });
  }

  if (!Array.isArray(timeline.states)) {
    return createTwinDiagnosticReport(diagnostics, reportProvenance);
  }
  if (timeline.states.length === 0) {
    diagnostics.push({
      id: "timeline.empty",
      severity: "warning",
      category: "timeline",
      message: "Twin timeline contains no robot states",
      ...(timelineRobotId === undefined ? {} : { robotId: timelineRobotId }),
    });
  }

  let previousTimestamp: number | undefined;
  const timestamps = new Set<number>();
  const timelineSceneId =
    options.expectedSceneId ??
    (isRecord(timeline.metadata) &&
    typeof timeline.metadata.sceneId === "string"
      ? timeline.metadata.sceneId
      : undefined);

  timeline.states.forEach((state, recordIndex) => {
    diagnostics.push(
      ...inspectRobotState(
        state,
        recordIndex,
        false,
      ),
    );
    if (!isRecord(state)) return;
    const stateRobotId =
      typeof state.robotId === "string" ? state.robotId : undefined;
    const timestamp =
      typeof state.timestamp === "number" && Number.isFinite(state.timestamp)
        ? state.timestamp
        : undefined;
    const context = {
      ...(stateRobotId === undefined ? {} : { robotId: stateRobotId }),
      ...(timestamp === undefined ? {} : { timestamp }),
      recordIndex,
    };

    if (
      timelineRobotId !== undefined &&
      stateRobotId !== undefined &&
      stateRobotId !== timelineRobotId
    ) {
      diagnostics.push({
        id: "timeline.robot-id.mismatch",
        severity: "error",
        category: "identity",
        message: "State robotId does not match its twin timeline",
        ...context,
        evidence: { timelineRobotId, stateRobotId },
      });
    }

    if (timestamp !== undefined) {
      if (
        previousTimestamp !== undefined &&
        timestamp < previousTimestamp
      ) {
        diagnostics.push({
          id: "timeline.timestamp.non-monotonic",
          severity: "error",
          category: "time",
          message: "State timestamps must be monotonically increasing",
          ...context,
          evidence: { previousTimestamp, timestamp },
        });
      }
      if (timestamps.has(timestamp)) {
        diagnostics.push({
          id: "timeline.timestamp.duplicate",
          severity: "error",
          category: "time",
          message: "Twin timeline may contain only one state per timestamp",
          ...context,
          evidence: { timestamp },
        });
      }
      timestamps.add(timestamp);
      previousTimestamp = timestamp;
    }

    const stateSceneId =
      isRecord(state.metadata) && typeof state.metadata.sceneId === "string"
        ? state.metadata.sceneId
        : undefined;
    if (
      timelineSceneId !== undefined &&
      stateSceneId !== undefined &&
      stateSceneId !== timelineSceneId
    ) {
      diagnostics.push({
        id: "timeline.scene-reference.mismatch",
        severity: "error",
        category: "scene",
        message: "State sceneId does not match the timeline scene reference",
        ...context,
        evidence: { timelineSceneId, stateSceneId },
      });
    }
  });

  return createTwinDiagnosticReport(diagnostics, reportProvenance);
};

export const validateTwinTimeline = (
  timeline: TwinTimeline | unknown,
): TwinDiagnosticReport => runTwinDiagnostics(timeline);
