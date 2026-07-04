import type { ScenarioProfile } from "./scenarioTypes.js";
export declare const BUILT_IN_SCENARIOS: readonly [{
    readonly id: "basic-patrol";
    readonly name: "Basic Patrol";
    readonly description: "A healthy rover performing a short routine patrol.";
    readonly seed: 101;
    readonly robotId: "patrol-rover";
    readonly initialState: "active";
    readonly durationMs: 10000;
    readonly stepMs: 1000;
}, {
    readonly id: "battery-drain";
    readonly name: "Battery Drain";
    readonly description: "An active rover that reports a low-battery condition.";
    readonly seed: 202;
    readonly robotId: "battery-rover";
    readonly initialState: "active";
    readonly durationMs: 12000;
    readonly stepMs: 1000;
    readonly faults: [{
        readonly atMs: 7000;
        readonly fault: {
            readonly type: "low_battery";
            readonly severity: 0.9;
        };
    }];
}, {
    readonly id: "motor-overheat";
    readonly name: "Motor Overheat";
    readonly description: "A patrol interrupted by rising motor temperatures.";
    readonly seed: 303;
    readonly robotId: "thermal-rover";
    readonly initialState: "active";
    readonly durationMs: 10000;
    readonly stepMs: 1000;
    readonly faults: [{
        readonly atMs: 5000;
        readonly fault: {
            readonly type: "motor_overheating";
            readonly severity: 0.8;
        };
    }];
}, {
    readonly id: "signal-loss";
    readonly name: "Signal Loss";
    readonly description: "A moving rover that loses its communications link.";
    readonly seed: 404;
    readonly robotId: "comms-rover";
    readonly initialState: "active";
    readonly durationMs: 8000;
    readonly stepMs: 1000;
    readonly faults: [{
        readonly atMs: 4000;
        readonly fault: {
            readonly type: "signal_loss";
        };
    }];
}, {
    readonly id: "sensor-noise";
    readonly name: "Sensor Noise";
    readonly description: "A patrol with deterministic noise applied to IMU readings.";
    readonly seed: 505;
    readonly robotId: "sensor-rover";
    readonly initialState: "active";
    readonly durationMs: 8000;
    readonly stepMs: 500;
    readonly faults: [{
        readonly atMs: 2000;
        readonly fault: {
            readonly type: "sensor_noise";
            readonly severity: 0.7;
        };
    }];
}, {
    readonly id: "stalled-motor";
    readonly name: "Stalled Motor";
    readonly description: "A moving rover whose drive motors stall during patrol.";
    readonly seed: 606;
    readonly robotId: "drive-rover";
    readonly initialState: "active";
    readonly durationMs: 8000;
    readonly stepMs: 1000;
    readonly faults: [{
        readonly atMs: 3000;
        readonly fault: {
            readonly type: "stalled_motor";
            readonly severity: 0.9;
        };
    }];
}];
export type BuiltInScenarioId = (typeof BUILT_IN_SCENARIOS)[number]["id"];
export declare const BUILT_IN_SCENARIO_IDS: readonly BuiltInScenarioId[];
export declare const getBuiltInScenario: (id: BuiltInScenarioId | string) => ScenarioProfile | undefined;
