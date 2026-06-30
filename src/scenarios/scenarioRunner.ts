import { ReplayRecorder } from "../replay/replayRecorder.js";
import { validateReplayLog } from "../replay/replayValidator.js";
import { RobotSimulator } from "../simulator/robotSimulator.js";
import { TelemetryStream } from "../events/telemetryStream.js";
import type {
  ScenarioProfile,
  ScenarioRunResult,
} from "./scenarioTypes.js";
import { validateScenarioProfile } from "./scenarioValidator.js";

export class ScenarioRunner {
  private readonly profile: ScenarioProfile;

  constructor(profile: ScenarioProfile) {
    this.profile = structuredClone(profile);
  }

  run(): ScenarioRunResult {
    const scenarioValidation = validateScenarioProfile(this.profile);

    if (!scenarioValidation.valid) {
      throw new TypeError(
        `Invalid scenario profile: ${scenarioValidation.errors.join(" ")}`,
      );
    }

    const scenario = structuredClone(this.profile);
    const simulator = new RobotSimulator({
      robotId: scenario.robotId ?? `scenario-${scenario.id}`,
      seed: scenario.seed ?? 1,
      initialState: scenario.initialState ?? "idle",
      startTime: 0,
    });
    const stream = new TelemetryStream(simulator);
    const recorder = new ReplayRecorder({
      robotId: simulator.robotId,
      createdAt: 0,
      ...(scenario.seed === undefined ? {} : { seed: scenario.seed }),
    });
    const unsubscribe = stream.subscribe(recorder.record);
    const scheduledFaults = (scenario.faults ?? [])
      .map((scheduledFault, index) => ({ scheduledFault, index }))
      .sort(
        (left, right) =>
          left.scheduledFault.atMs - right.scheduledFault.atMs ||
          left.index - right.index,
      );
    let elapsedMs = 0;
    let stepCount = 0;
    let nextFaultIndex = 0;

    const injectReachedFaults = (): void => {
      while (
        nextFaultIndex < scheduledFaults.length &&
        scheduledFaults[nextFaultIndex]!.scheduledFault.atMs <= elapsedMs
      ) {
        stream.injectFault(
          structuredClone(
            scheduledFaults[nextFaultIndex]!.scheduledFault.fault,
          ),
        );
        nextFaultIndex += 1;
      }
    };

    recorder.start();
    stream.start();
    injectReachedFaults();

    while (elapsedMs < scenario.durationMs) {
      const deltaMs = Math.min(
        scenario.stepMs,
        scenario.durationMs - elapsedMs,
      );
      stream.step(deltaMs);
      elapsedMs += deltaMs;
      stepCount += 1;
      injectReachedFaults();
    }

    stream.stop();
    recorder.stop();
    unsubscribe();

    const events = recorder.getEvents();
    const replayLog = recorder.toLog({
      scenarioId: scenario.id,
      ...(scenario.metadata === undefined
        ? {}
        : { scenarioMetadata: structuredClone(scenario.metadata) }),
    });
    const replayValidation = validateReplayLog(replayLog);
    const finalSnapshot = simulator.getSnapshot();

    return {
      scenario,
      finalSnapshot,
      events,
      replayLog,
      scenarioValidation,
      replayValidation,
      summary: {
        durationMs: elapsedMs,
        stepCount,
        eventCount: events.length,
        faultCount: nextFaultIndex,
        finalState: finalSnapshot.state,
      },
    };
  }
}

export const runScenario = (profile: ScenarioProfile): ScenarioRunResult =>
  new ScenarioRunner(profile).run();
