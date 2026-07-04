export interface ReplayValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}
export declare const validateReplayLog: (log: unknown) => ReplayValidationResult;
