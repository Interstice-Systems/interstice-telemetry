import type { FleetScenarioProfile, FleetValidationResult } from "./fleetTypes.js";
export declare const validateFleetScenario: (profile: unknown) => FleetValidationResult;
export declare const assertValidFleetScenario: (profile: FleetScenarioProfile) => FleetValidationResult;
