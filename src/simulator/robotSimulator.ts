import { FaultInjector } from "../faults/faultInjector.js";
import type { Fault } from "../faults/faultTypes.js";
import type { RobotState, TelemetrySnapshot, Vector3 } from "../types.js";
import { createSeededRandom, type RandomSource } from "./seed.js";

export interface RobotSimulatorOptions {
  robotId?: string;
  seed?: number;
  startTime?: Date | string | number;
  initialState?: RobotState;
  faultInjector?: FaultInjector;
}

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

export class RobotSimulator {
  readonly robotId: string;
  readonly faults: FaultInjector;

  private readonly random: RandomSource;
  private timestampMs: number;
  private state: RobotState;
  private batteryPercentage = 100;
  private leftMotorTemperature = 24;
  private rightMotorTemperature = 24;
  private snapshot: TelemetrySnapshot;

  constructor(options: RobotSimulatorOptions = {}) {
    this.robotId = options.robotId ?? "robot-001";
    this.random = createSeededRandom(options.seed ?? 1);
    this.timestampMs = new Date(options.startTime ?? 0).getTime();
    if (!Number.isFinite(this.timestampMs)) {
      throw new TypeError("startTime must be a valid date");
    }
    this.state = options.initialState ?? "idle";
    this.faults = options.faultInjector ?? new FaultInjector();
    this.snapshot = this.buildSnapshot();
  }

  setState(state: RobotState): void {
    this.state = state;
    this.snapshot = this.buildSnapshot();
  }

  injectFault(fault: Fault): void {
    this.faults.inject(fault);
  }

  clearFault(type: Fault["type"]): void {
    this.faults.remove(type);
  }

  getSnapshot(): TelemetrySnapshot {
    return this.faults.apply(this.snapshot);
  }

  step(milliseconds: number): TelemetrySnapshot {
    if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
      throw new RangeError("step duration must be a positive number");
    }

    const seconds = milliseconds / 1_000;
    this.timestampMs += milliseconds;
    this.updateBattery(seconds);
    this.updateTemperatures(seconds);
    this.snapshot = this.buildSnapshot();
    return this.getSnapshot();
  }

  private updateBattery(seconds: number): void {
    const rates: Record<RobotState, number> = {
      idle: -0.002,
      active: -0.02,
      returning: -0.015,
      charging: 0.08,
      faulted: -0.005,
      offline: -0.0002,
    };
    this.batteryPercentage = clamp(
      this.batteryPercentage + rates[this.state] * seconds,
      0,
      100,
    );
  }

  private updateTemperatures(seconds: number): void {
    const target =
      this.state === "active" || this.state === "returning" ? 52 : 25;
    const adjustment = clamp(seconds * 0.03, 0, 1);
    this.leftMotorTemperature +=
      (target - this.leftMotorTemperature) * adjustment;
    this.rightMotorTemperature +=
      (target - this.rightMotorTemperature) * adjustment;
  }

  private buildSnapshot(): TelemetrySnapshot {
    const moving = this.state === "active" || this.state === "returning";
    const baseRpm = moving ? (this.state === "returning" ? 85 : 120) : 0;
    const jitter = (): number => (this.random() - 0.5) * 8;

    return {
      timestamp: new Date(this.timestampMs).toISOString(),
      robotId: this.robotId,
      batteryPercentage: round(this.batteryPercentage),
      batteryVoltage: round(20 + this.batteryPercentage * 0.052),
      leftMotorRpm: round(moving ? baseRpm + jitter() : 0),
      rightMotorRpm: round(moving ? baseRpm + jitter() : 0),
      leftMotorTemperature: round(
        this.leftMotorTemperature + (this.random() - 0.5) * 0.4,
      ),
      rightMotorTemperature: round(
        this.rightMotorTemperature + (this.random() - 0.5) * 0.4,
      ),
      cpuUsage: round(
        clamp((moving ? 42 : 14) + (this.random() - 0.5) * 6, 0, 100),
      ),
      memoryUsage: round(
        clamp(31 + (this.random() - 0.5) * 2, 0, 100),
      ),
      signalStrength: round(-52 + (this.random() - 0.5) * 5),
      imu: {
        acceleration: this.vector(moving ? 0.12 : 0.015, 9.81),
        gyro: this.vector(moving ? 0.05 : 0.005, 0),
      },
      state: this.state,
    };
  }

  private vector(amplitude: number, zBase: number): Vector3 {
    const sample = (): number => (this.random() - 0.5) * 2 * amplitude;
    return {
      x: round(sample(), 4),
      y: round(sample(), 4),
      z: round(zBase + sample(), 4),
    };
  }
}
