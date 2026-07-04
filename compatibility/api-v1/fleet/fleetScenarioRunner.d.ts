import type { DeterministicClock } from "../clock/clockTypes.js";
import type { FleetScenarioProfile, FleetScenarioRunResult } from "./fleetTypes.js";
export declare class FleetScenarioRunner {
    private readonly clock?;
    private readonly profile;
    constructor(profile: FleetScenarioProfile, clock?: DeterministicClock | undefined);
    run(): FleetScenarioRunResult;
}
export declare const runFleetScenario: (profile: FleetScenarioProfile, clock?: DeterministicClock) => FleetScenarioRunResult;
