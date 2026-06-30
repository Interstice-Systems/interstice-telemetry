import type { ScenarioProfile } from "./scenarioTypes.js";

export const BUILT_IN_SCENARIOS = [
  {
    id: "basic-patrol",
    name: "Basic Patrol",
    description: "A healthy rover performing a short routine patrol.",
    seed: 101,
    robotId: "patrol-rover",
    initialState: "active",
    durationMs: 10_000,
    stepMs: 1_000,
  },
  {
    id: "battery-drain",
    name: "Battery Drain",
    description: "An active rover that reports a low-battery condition.",
    seed: 202,
    robotId: "battery-rover",
    initialState: "active",
    durationMs: 12_000,
    stepMs: 1_000,
    faults: [
      { atMs: 7_000, fault: { type: "low_battery", severity: 0.9 } },
    ],
  },
  {
    id: "motor-overheat",
    name: "Motor Overheat",
    description: "A patrol interrupted by rising motor temperatures.",
    seed: 303,
    robotId: "thermal-rover",
    initialState: "active",
    durationMs: 10_000,
    stepMs: 1_000,
    faults: [
      {
        atMs: 5_000,
        fault: { type: "motor_overheating", severity: 0.8 },
      },
    ],
  },
  {
    id: "signal-loss",
    name: "Signal Loss",
    description: "A moving rover that loses its communications link.",
    seed: 404,
    robotId: "comms-rover",
    initialState: "active",
    durationMs: 8_000,
    stepMs: 1_000,
    faults: [{ atMs: 4_000, fault: { type: "signal_loss" } }],
  },
  {
    id: "sensor-noise",
    name: "Sensor Noise",
    description: "A patrol with deterministic noise applied to IMU readings.",
    seed: 505,
    robotId: "sensor-rover",
    initialState: "active",
    durationMs: 8_000,
    stepMs: 500,
    faults: [
      { atMs: 2_000, fault: { type: "sensor_noise", severity: 0.7 } },
    ],
  },
  {
    id: "stalled-motor",
    name: "Stalled Motor",
    description: "A moving rover whose drive motors stall during patrol.",
    seed: 606,
    robotId: "drive-rover",
    initialState: "active",
    durationMs: 8_000,
    stepMs: 1_000,
    faults: [
      { atMs: 3_000, fault: { type: "stalled_motor", severity: 0.9 } },
    ],
  },
] as const satisfies readonly ScenarioProfile[];

export type BuiltInScenarioId = (typeof BUILT_IN_SCENARIOS)[number]["id"];

export const BUILT_IN_SCENARIO_IDS: readonly BuiltInScenarioId[] =
  BUILT_IN_SCENARIOS.map(({ id }) => id);

export const getBuiltInScenario = (
  id: BuiltInScenarioId | string,
): ScenarioProfile | undefined => {
  const scenario = BUILT_IN_SCENARIOS.find((candidate) => candidate.id === id);
  return scenario === undefined ? undefined : structuredClone(scenario);
};
