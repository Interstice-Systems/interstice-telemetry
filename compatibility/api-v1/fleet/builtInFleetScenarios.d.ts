import type { ScenarioProfile } from "../scenarios/scenarioTypes.js";
import type { FleetScenarioProfile } from "./fleetTypes.js";
export declare const BUILT_IN_FLEET_SCENARIOS: {
    id: string;
    name: string;
    description: string;
    durationMs: number;
    stepMs: number;
    robots: {
        robotId: string;
        scenario: ScenarioProfile;
    }[];
}[];
export type BuiltInFleetScenarioId = (typeof BUILT_IN_FLEET_SCENARIOS)[number]["id"];
export declare const BUILT_IN_FLEET_SCENARIO_IDS: readonly BuiltInFleetScenarioId[];
export declare const getBuiltInFleetScenario: (id: BuiltInFleetScenarioId | string) => FleetScenarioProfile | undefined;
