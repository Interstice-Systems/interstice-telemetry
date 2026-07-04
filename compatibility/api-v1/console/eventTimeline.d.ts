import type { TelemetryEvent } from "../events/eventTypes.js";
import type { ConsoleReport, EventTimelineOptions } from "./consoleTypes.js";
export declare const renderEventTimeline: (events: TelemetryEvent[], options?: EventTimelineOptions) => ConsoleReport;
