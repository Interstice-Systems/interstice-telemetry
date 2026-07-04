import type { RobotState } from "./robotState.js";
import type { TwinTimeline } from "./twinTimeline.js";
import type { EvidenceProvenance } from "../provenance/provenanceTypes.js";
export declare const TWIN_DIAGNOSTIC_SEVERITIES: readonly ["info", "warning", "error"];
export type TwinDiagnosticSeverity = (typeof TWIN_DIAGNOSTIC_SEVERITIES)[number];
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
/**
 * Renders a deterministic, human-readable diagnostic report.
 *
 * The renderer is pure, does not mutate the report, and does not write to the
 * console. Diagnostics are sorted with the same canonical ordering used by
 * `createTwinDiagnosticReport`.
 */
export declare const renderTwinDiagnosticReport: (report: TwinDiagnosticReport) => string;
export declare const createTwinDiagnosticReport: (diagnostics: readonly TwinDiagnostic[], provenance?: EvidenceProvenance) => TwinDiagnosticReport;
export declare const validateRobotState: (state: RobotState | unknown) => TwinDiagnosticReport;
export declare const runTwinDiagnostics: (timeline: TwinTimeline | unknown, options?: TwinDiagnosticOptions) => TwinDiagnosticReport;
export declare const validateTwinTimeline: (timeline: TwinTimeline | unknown) => TwinDiagnosticReport;
