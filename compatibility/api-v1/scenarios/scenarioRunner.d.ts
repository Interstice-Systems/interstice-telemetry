import type { DeterministicClock } from "../clock/clockTypes.js";
import type { ScenarioProfile, ScenarioRunResult } from "./scenarioTypes.js";
export declare class ScenarioRunner {
    private readonly clock?;
    private readonly profile;
    constructor(profile: ScenarioProfile, clock?: DeterministicClock | undefined);
    run(): ScenarioRunResult;
}
export declare const runScenario: (profile: ScenarioProfile, clock?: DeterministicClock) => ScenarioRunResult;
