import { TelemetryStream } from "../events/telemetryStream.js";
import { ReplayRecorder } from "../replay/replayRecorder.js";
import { validateReplayLog } from "../replay/replayValidator.js";
import { validateScenarioProfile } from "../scenarios/scenarioValidator.js";
import type {
  ScenarioProfile,
  ScenarioRunResult,
  ScheduledFault,
} from "../scenarios/scenarioTypes.js";
import { RobotSimulator } from "../simulator/robotSimulator.js";
import { createFleetReplayLog } from "./fleetReplay.js";
import type {
  FleetRobotProfile,
  FleetScenarioProfile,
  FleetScenarioRunResult,
  FleetValidationResult,
} from "./fleetTypes.js";
import { validateFleetScenario } from "./fleetValidator.js";

interface OrderedFault {
  scheduledFault: ScheduledFault;
  index: number;
}

interface RobotRuntime {
  profile: FleetRobotProfile;
  scenario: ScenarioProfile;
  simulator: RobotSimulator;
  stream: TelemetryStream;
  recorder: ReplayRecorder;
  unsubscribe: () => void;
  scheduledFaults: OrderedFault[];
  nextFaultIndex: number;
}

const compareRobotIds = (
  left: FleetRobotProfile,
  right: FleetRobotProfile,
): number =>
  left.robotId < right.robotId ? -1 : left.robotId > right.robotId ? 1 : 0;

const buildRuntime = (
  robot: FleetRobotProfile,
  fleet: FleetScenarioProfile,
): RobotRuntime => {
  const scenario: ScenarioProfile = {
    ...structuredClone(robot.scenario),
    robotId: robot.robotId,
    durationMs: fleet.durationMs,
    stepMs: fleet.stepMs,
  };
  const simulator = new RobotSimulator({
    robotId: robot.robotId,
    seed: scenario.seed ?? 1,
    initialState: scenario.initialState ?? "idle",
    startTime: 0,
  });
  const stream = new TelemetryStream(simulator);
  const recorder = new ReplayRecorder({
    robotId: robot.robotId,
    createdAt: 0,
    ...(scenario.seed === undefined ? {} : { seed: scenario.seed }),
  });

  return {
    profile: structuredClone(robot),
    scenario,
    simulator,
    stream,
    recorder,
    unsubscribe: stream.subscribe(recorder.record),
    scheduledFaults: (scenario.faults ?? [])
      .map((scheduledFault, index) => ({ scheduledFault, index }))
      .sort(
        (left, right) =>
          left.scheduledFault.atMs - right.scheduledFault.atMs ||
          left.index - right.index,
      ),
    nextFaultIndex: 0,
  };
};

const injectReachedFaults = (
  runtime: RobotRuntime,
  elapsedMs: number,
): void => {
  while (
    runtime.nextFaultIndex < runtime.scheduledFaults.length &&
    runtime.scheduledFaults[runtime.nextFaultIndex]!.scheduledFault.atMs <=
      elapsedMs
  ) {
    runtime.stream.injectFault(
      structuredClone(
        runtime.scheduledFaults[runtime.nextFaultIndex]!.scheduledFault.fault,
      ),
    );
    runtime.nextFaultIndex += 1;
  }
};

const buildRobotResult = (runtime: RobotRuntime): ScenarioRunResult => {
  const events = runtime.recorder.getEvents();
  const replayLog = runtime.recorder.toLog({
    scenarioId: runtime.scenario.id,
    ...(runtime.scenario.metadata === undefined
      ? {}
      : { scenarioMetadata: structuredClone(runtime.scenario.metadata) }),
    ...(runtime.profile.metadata === undefined
      ? {}
      : { fleetRobotMetadata: structuredClone(runtime.profile.metadata) }),
  });
  const finalSnapshot = runtime.simulator.getSnapshot();

  return {
    scenario: structuredClone(runtime.scenario),
    finalSnapshot,
    events,
    replayLog,
    scenarioValidation: validateScenarioProfile(runtime.scenario),
    replayValidation: validateReplayLog(replayLog),
    summary: {
      durationMs: runtime.scenario.durationMs,
      stepCount: Math.ceil(
        runtime.scenario.durationMs / runtime.scenario.stepMs,
      ),
      eventCount: events.length,
      faultCount: runtime.nextFaultIndex,
      finalState: finalSnapshot.state,
    },
  };
};

export class FleetScenarioRunner {
  private readonly profile: FleetScenarioProfile;

  constructor(profile: FleetScenarioProfile) {
    this.profile = structuredClone(profile);
  }

  run(): FleetScenarioRunResult {
    const fleetValidation: FleetValidationResult = validateFleetScenario(
      this.profile,
    );

    if (!fleetValidation.valid) {
      throw new TypeError(
        `Invalid fleet scenario profile: ${fleetValidation.errors.join(" ")}`,
      );
    }

    const scenario = structuredClone(this.profile);
    const runtimes = scenario.robots
      .map((robot) => structuredClone(robot))
      .sort(compareRobotIds)
      .map((robot) => buildRuntime(robot, scenario));
    let elapsedMs = 0;
    let stepCount = 0;

    for (const runtime of runtimes) {
      runtime.recorder.start();
      runtime.stream.start();
      injectReachedFaults(runtime, elapsedMs);
    }

    while (elapsedMs < scenario.durationMs) {
      const deltaMs = Math.min(
        scenario.stepMs,
        scenario.durationMs - elapsedMs,
      );

      for (const runtime of runtimes) {
        runtime.stream.step(deltaMs);
      }

      elapsedMs += deltaMs;
      stepCount += 1;

      for (const runtime of runtimes) {
        injectReachedFaults(runtime, elapsedMs);
      }
    }

    for (const runtime of runtimes) {
      runtime.stream.stop();
      runtime.recorder.stop();
      runtime.unsubscribe();
    }

    const robotResults = Object.fromEntries(
      runtimes.map((runtime) => [
        runtime.profile.robotId,
        buildRobotResult(runtime),
      ]),
    );
    const robotLogs = Object.fromEntries(
      Object.entries(robotResults).map(([robotId, result]) => [
        robotId,
        result.replayLog,
      ]),
    );
    const fleetReplayLog = createFleetReplayLog(
      scenario.id,
      robotLogs,
      {
        fleetScenarioName: scenario.name,
        ...(scenario.metadata === undefined
          ? {}
          : { fleetScenarioMetadata: structuredClone(scenario.metadata) }),
      },
      0,
    );
    const finalStates = Object.fromEntries(
      Object.entries(robotResults).map(([robotId, result]) => [
        robotId,
        result.summary.finalState,
      ]),
    );
    const totalEvents = Object.values(robotResults).reduce(
      (total, result) => total + result.summary.eventCount,
      0,
    );
    const totalFaults = Object.values(robotResults).reduce(
      (total, result) => total + result.summary.faultCount,
      0,
    );

    return {
      scenario,
      robotResults,
      fleetReplayLog,
      fleetValidation,
      summary: {
        robotCount: runtimes.length,
        durationMs: elapsedMs,
        stepCount,
        totalEvents,
        totalFaults,
        finalStates,
      },
    };
  }
}

export const runFleetScenario = (
  profile: FleetScenarioProfile,
): FleetScenarioRunResult => new FleetScenarioRunner(profile).run();
