import type { Robot } from "./model.js";
import type { RobotState } from "./robotState.js";
import type { Scene } from "./scene.js";
import type { TwinTimeline } from "./twinTimeline.js";

export interface PlatformAdapterInfo {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly capabilities: readonly string[];
}

export interface DigitalTwinContext {
  readonly robot: Robot;
  readonly scene?: Scene;
}

export interface Renderer {
  readonly info: PlatformAdapterInfo;
  render(context: DigitalTwinContext, state: RobotState): void | Promise<void>;
}

export interface PhysicsEngine {
  readonly info: PlatformAdapterInfo;
  step(
    context: DigitalTwinContext,
    state: RobotState,
    durationMs: number,
  ): RobotState | Promise<RobotState>;
}

export interface SimulationRuntime {
  readonly info: PlatformAdapterInfo;
  run(
    context: DigitalTwinContext,
    timeline: TwinTimeline,
  ): void | Promise<void>;
}

export interface RoboticsPlatformAdapter {
  readonly info: PlatformAdapterInfo;
  load(context: DigitalTwinContext): void | Promise<void>;
  publish(state: RobotState): void | Promise<void>;
  close(): void | Promise<void>;
}

export interface UnityAdapter extends RoboticsPlatformAdapter {
  readonly platform: "unity";
}

export interface UnrealAdapter extends RoboticsPlatformAdapter {
  readonly platform: "unreal";
}

export interface ROSAdapter extends RoboticsPlatformAdapter {
  readonly platform: "ros";
}

export interface GazeboAdapter extends RoboticsPlatformAdapter {
  readonly platform: "gazebo";
}

export interface NVIDIAIsaacAdapter extends RoboticsPlatformAdapter {
  readonly platform: "nvidia-isaac";
}

export interface FleetVisualization {
  readonly info: PlatformAdapterInfo;
  render(
    contexts: readonly DigitalTwinContext[],
    states: readonly RobotState[],
  ): void | Promise<void>;
}
