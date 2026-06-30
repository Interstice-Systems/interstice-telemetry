import {
  getBuiltInScenario,
  type BuiltInScenarioId,
} from "../scenarios/builtInScenarios.js";
import type { ScenarioProfile } from "../scenarios/scenarioTypes.js";
import type { FleetScenarioProfile } from "./fleetTypes.js";

const scenario = (
  id: BuiltInScenarioId,
  seed: number,
): ScenarioProfile => {
  const profile = getBuiltInScenario(id);

  if (profile === undefined) {
    throw new Error(`Built-in scenario "${id}" was not found.`);
  }

  return { ...profile, seed };
};

export const BUILT_IN_FLEET_SCENARIOS = [
  {
    id: "two-robot-patrol",
    name: "Two-Robot Patrol",
    description: "Two healthy rovers execute a synchronized patrol.",
    durationMs: 10_000,
    stepMs: 1_000,
    robots: [
      {
        robotId: "patrol-alpha",
        scenario: scenario("basic-patrol", 701),
      },
      {
        robotId: "patrol-beta",
        scenario: scenario("basic-patrol", 702),
      },
    ],
  },
  {
    id: "mixed-fault-fleet",
    name: "Mixed Fault Fleet",
    description:
      "Three rovers encounter independent thermal, communications, and battery faults.",
    durationMs: 12_000,
    stepMs: 1_000,
    robots: [
      {
        robotId: "robot-alpha",
        scenario: scenario("motor-overheat", 711),
      },
      {
        robotId: "robot-beta",
        scenario: scenario("signal-loss", 712),
      },
      {
        robotId: "robot-gamma",
        scenario: scenario("battery-drain", 713),
      },
    ],
  },
  {
    id: "signal-loss-fleet",
    name: "Signal Loss Fleet",
    description:
      "Two patrol robots lose communications on deterministic schedules.",
    durationMs: 8_000,
    stepMs: 1_000,
    robots: [
      {
        robotId: "comms-alpha",
        scenario: scenario("signal-loss", 721),
      },
      {
        robotId: "comms-beta",
        scenario: {
          ...scenario("signal-loss", 722),
          faults: [{ atMs: 6_000, fault: { type: "signal_loss" } }],
        },
      },
    ],
  },
  {
    id: "overheat-and-battery-fleet",
    name: "Overheat and Battery Fleet",
    description:
      "One rover overheats while a second reports a low battery condition.",
    durationMs: 12_000,
    stepMs: 1_000,
    robots: [
      {
        robotId: "thermal-alpha",
        scenario: scenario("motor-overheat", 731),
      },
      {
        robotId: "battery-beta",
        scenario: scenario("battery-drain", 732),
      },
    ],
  },
] satisfies FleetScenarioProfile[];

export type BuiltInFleetScenarioId =
  (typeof BUILT_IN_FLEET_SCENARIOS)[number]["id"];

export const BUILT_IN_FLEET_SCENARIO_IDS: readonly BuiltInFleetScenarioId[] =
  BUILT_IN_FLEET_SCENARIOS.map(({ id }) => id);

export const getBuiltInFleetScenario = (
  id: BuiltInFleetScenarioId | string,
): FleetScenarioProfile | undefined => {
  const profile = BUILT_IN_FLEET_SCENARIOS.find(
    (candidate) => candidate.id === id,
  );
  return profile === undefined ? undefined : structuredClone(profile);
};
