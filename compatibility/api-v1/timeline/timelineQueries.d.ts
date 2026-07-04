import type { TelemetryEventType } from "../events/eventTypes.js";
import type { FleetEventTimeline, GlobalFleetEvent } from "./timelineTypes.js";
export declare const filterTimelineByRobot: (timeline: FleetEventTimeline, robotId: string) => GlobalFleetEvent[];
export declare const filterTimelineByEventType: (timeline: FleetEventTimeline, type: TelemetryEventType) => GlobalFleetEvent[];
export declare const filterTimelineByTimeRange: (timeline: FleetEventTimeline, startMs: number, endMs: number) => GlobalFleetEvent[];
export declare const getTimelineEventByFleetSequence: (timeline: FleetEventTimeline, sequence: number) => GlobalFleetEvent | undefined;
export declare const summarizeTimelineByRobot: (timeline: FleetEventTimeline) => Record<string, number>;
export declare const summarizeTimelineByEventType: (timeline: FleetEventTimeline) => Record<string, number>;
