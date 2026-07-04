import {
  toImmutableJson,
  type JsonValue,
} from "./deterministicJson.js";
import type { RobotState } from "./robotState.js";
import {
  createTwinDiagnosticReport,
  type TwinDiagnostic,
  type TwinDiagnosticReport,
} from "./twinDiagnostics.js";
import type { TwinTimeline } from "./twinTimeline.js";

export const MULTI_ROBOT_TWIN_VIEW_VERSION = "1.0.0";

export interface MultiRobotTwinViewSummary {
  readonly robotCount: number;
  readonly firstTimestamp: number | null;
  readonly lastTimestamp: number | null;
  readonly totalRecords: number;
}

export interface MultiRobotTwinView {
  readonly version: string;
  readonly viewId: string;
  readonly createdAt: string;
  readonly robotIds: readonly string[];
  readonly timelines: Readonly<Record<string, TwinTimeline>>;
  readonly summary: MultiRobotTwinViewSummary;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

export interface MultiRobotTwinViewOptions {
  readonly version?: string;
  readonly viewId?: string;
  readonly createdAt?: string | number | Date;
  readonly metadata?: Readonly<Record<string, JsonValue>>;
}

const summarizeTimelines = (
  timelines: Readonly<Record<string, TwinTimeline>>,
): MultiRobotTwinViewSummary => {
  const validTimelines = Object.values(timelines).filter(
    (timeline): timeline is TwinTimeline =>
      typeof timeline === "object" &&
      timeline !== null &&
      Array.isArray(timeline.states),
  );
  const timestamps = validTimelines.flatMap((timeline) =>
    timeline.states
      .map((state) => state.timestamp)
      .filter((timestamp) => Number.isFinite(timestamp)),
  );
  return {
    robotCount: Object.keys(timelines).length,
    firstTimestamp: timestamps.length === 0 ? null : Math.min(...timestamps),
    lastTimestamp: timestamps.length === 0 ? null : Math.max(...timestamps),
    totalRecords: validTimelines.reduce(
      (total, timeline) => total + timeline.states.length,
      0,
    ),
  };
};

const normalizeCreatedAt = (
  value: string | number | Date | undefined,
): string => {
  const date = new Date(value ?? 0);
  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("multi-robot view createdAt must be a valid date");
  }
  return date.toISOString();
};

export const createMultiRobotTwinView = (
  timelines: readonly TwinTimeline[],
  options: MultiRobotTwinViewOptions = {},
): MultiRobotTwinView => {
  const robotIds = timelines.map(({ robotId }) => robotId);
  if (robotIds.some((robotId) => robotId.length === 0)) {
    throw new TypeError("multi-robot timelines must have non-empty robotIds");
  }
  if (new Set(robotIds).size !== robotIds.length) {
    throw new TypeError("multi-robot view may contain only one timeline per robotId");
  }

  const orderedRobotIds = [...robotIds].sort((left, right) =>
    left.localeCompare(right),
  );
  const byRobotId = Object.fromEntries(
    orderedRobotIds.map((robotId) => [
      robotId,
      timelines.find((timeline) => timeline.robotId === robotId)!,
    ]),
  );
  const viewId = options.viewId ?? "multi-robot-twin-view";
  if (viewId.length === 0) {
    throw new TypeError("multi-robot viewId must not be empty");
  }

  return toImmutableJson(
    {
      version: options.version ?? MULTI_ROBOT_TWIN_VIEW_VERSION,
      viewId,
      createdAt: normalizeCreatedAt(options.createdAt),
      robotIds: orderedRobotIds,
      timelines: byRobotId,
      summary: summarizeTimelines(byRobotId),
      ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
    },
    "multiRobotTwinView",
  );
};

export const summarizeMultiRobotTwinView = (
  view: MultiRobotTwinView,
): MultiRobotTwinViewSummary =>
  toImmutableJson(summarizeTimelines(view.timelines), "multiRobotTwinViewSummary");

export const getRobotTwinTimeline = (
  view: MultiRobotTwinView,
  robotId: string,
): TwinTimeline | undefined => view.timelines[robotId];

const getStateAtOrBefore = (
  timeline: TwinTimeline,
  timestamp: number,
): RobotState | undefined => {
  let low = 0;
  let high = timeline.states.length - 1;
  let match: RobotState | undefined;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    const state = timeline.states[middle];
    if (state === undefined) break;
    if (state.timestamp <= timestamp) {
      match = state;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return match;
};

export const getTwinStatesAtTime = (
  view: MultiRobotTwinView,
  timestamp: number,
): Readonly<Record<string, RobotState>> => {
  if (!Number.isFinite(timestamp)) {
    throw new TypeError("multi-robot query timestamp must be finite");
  }
  return Object.freeze(
    Object.fromEntries(
      view.robotIds.flatMap((robotId) => {
        const timeline = view.timelines[robotId];
        if (timeline === undefined) return [];
        const state = getStateAtOrBefore(timeline, timestamp);
        return state === undefined ? [] : [[robotId, state]];
      }),
    ),
  );
};

export const validateMultiRobotTwinView = (
  view: MultiRobotTwinView | unknown,
): TwinDiagnosticReport => {
  const diagnostics: TwinDiagnostic[] = [];
  if (typeof view !== "object" || view === null || Array.isArray(view)) {
    return createTwinDiagnosticReport([{
      id: "multi-robot-view.invalid",
      severity: "error",
      category: "view",
      message: "Multi-robot view must be an object",
    }]);
  }

  const candidate = view as Partial<MultiRobotTwinView>;
  const robotIds = Array.isArray(candidate.robotIds)
    ? candidate.robotIds
    : [];
  const timelines =
    typeof candidate.timelines === "object" &&
    candidate.timelines !== null &&
    !Array.isArray(candidate.timelines)
      ? candidate.timelines
      : {};

  if (new Set(robotIds).size !== robotIds.length) {
    diagnostics.push({
      id: "multi-robot-view.robot-id.duplicate",
      severity: "error",
      category: "identity",
      message: "Multi-robot view robotIds must be unique",
    });
  }
  if ([...robotIds].sort().some((id, index) => id !== robotIds[index])) {
    diagnostics.push({
      id: "multi-robot-view.robot-id.order",
      severity: "error",
      category: "determinism",
      message: "Multi-robot view robotIds must use deterministic lexical order",
    });
  }
  for (const robotId of robotIds) {
    const timeline = timelines[robotId];
    if (timeline === undefined) {
      diagnostics.push({
        id: "multi-robot-view.timeline.missing",
        severity: "error",
        category: "identity",
        message: `Timeline is missing for robotId "${robotId}"`,
        robotId,
      });
    } else if (
      typeof timeline !== "object" ||
      timeline === null ||
      !("robotId" in timeline)
    ) {
      diagnostics.push({
        id: "multi-robot-view.timeline.invalid",
        severity: "error",
        category: "view",
        message: `Timeline "${robotId}" must be a twin timeline object`,
        robotId,
      });
    } else if (timeline.robotId !== robotId) {
      diagnostics.push({
        id: "multi-robot-view.timeline.mismatch",
        severity: "error",
        category: "identity",
        message: `Timeline key "${robotId}" does not match its robotId`,
        robotId,
        evidence: { timelineRobotId: timeline.robotId },
      });
    }
  }
  for (const robotId of Object.keys(timelines)) {
    if (!robotIds.includes(robotId)) {
      diagnostics.push({
        id: "multi-robot-view.timeline.unlisted",
        severity: "error",
        category: "identity",
        message: `Timeline "${robotId}" is not listed in robotIds`,
        robotId,
      });
    }
  }

  const actualSummary = summarizeTimelines(
    timelines as Readonly<Record<string, TwinTimeline>>,
  );
  const suppliedSummary = candidate.summary;
  if (
    suppliedSummary === undefined ||
    suppliedSummary.robotCount !== actualSummary.robotCount ||
    suppliedSummary.firstTimestamp !== actualSummary.firstTimestamp ||
    suppliedSummary.lastTimestamp !== actualSummary.lastTimestamp ||
    suppliedSummary.totalRecords !== actualSummary.totalRecords
  ) {
    diagnostics.push({
      id: "multi-robot-view.summary.mismatch",
      severity: "error",
      category: "summary",
      message: "Multi-robot view summary does not match its timelines",
    });
  }
  if (robotIds.length === 0) {
    diagnostics.push({
      id: "multi-robot-view.empty",
      severity: "warning",
      category: "view",
      message: "Multi-robot view contains no timelines",
    });
  }
  return createTwinDiagnosticReport(diagnostics);
};
