import type { FleetEventTimeline } from "./timelineTypes.js";
export declare const serializeFleetEventTimeline: (timeline: FleetEventTimeline) => string;
export declare const deserializeFleetEventTimeline: (json: string) => FleetEventTimeline;
