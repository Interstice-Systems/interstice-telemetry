import type { FleetReplayLog } from "../fleet/fleetTypes.js";
import { type FleetEventTimeline, type FleetTimelineBuildOptions } from "./timelineTypes.js";
export declare const buildFleetEventTimeline: (fleetReplayLog: FleetReplayLog, options?: FleetTimelineBuildOptions) => FleetEventTimeline;
