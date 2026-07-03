import type { DeterministicClock } from "../clock/clockTypes.js";
import type { Fault } from "../faults/faultTypes.js";
import type { RobotSimulator } from "../simulator/robotSimulator.js";
import type { RobotState, TelemetrySnapshot } from "../types.js";
import type {
  FaultInjectedPayload,
  StateChangedPayload,
  StreamLifecyclePayload,
  TelemetryEvent,
  TelemetryEventHandler,
  TelemetryEventType,
  TelemetrySnapshotPayload,
} from "./eventTypes.js";
import { cloneTelemetryEvent } from "./cloneEvent.js";

export type TelemetryStreamStatus = "running" | "stopped";

export class TelemetryStream {
  private readonly handlers = new Set<TelemetryEventHandler>();
  private status: TelemetryStreamStatus = "stopped";
  private sequence = 0;
  private lastObservedState: RobotState;

  constructor(
    private readonly simulator: RobotSimulator,
    private readonly clock?: DeterministicClock,
  ) {
    this.lastObservedState = simulator.getSnapshot().state;
  }

  start(): void {
    if (this.status === "running") {
      return;
    }

    this.status = "running";
    this.lastObservedState = this.simulator.getSnapshot().state;
    this.emit("stream.started", { status: this.status });
  }

  stop(): void {
    if (this.status === "stopped") {
      return;
    }

    this.status = "stopped";
    this.emit("stream.stopped", { status: this.status });
  }

  step(deltaMs: number): TelemetrySnapshot | undefined {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      throw new RangeError("step duration must be a positive number");
    }

    if (this.status === "stopped") {
      return undefined;
    }

    const snapshot = this.simulator.step(deltaMs);
    this.clock?.step(deltaMs);

    if (snapshot.state !== this.lastObservedState) {
      const payload: StateChangedPayload = {
        previousState: this.lastObservedState,
        currentState: snapshot.state,
      };
      this.emit("state.changed", payload, snapshot);
    }

    this.lastObservedState = snapshot.state;
    this.emit("telemetry.snapshot", { snapshot }, snapshot);
    return snapshot;
  }

  injectFault(fault: Fault): void {
    this.simulator.injectFault(fault);
    const payload: FaultInjectedPayload = { fault: { ...fault } };
    this.emit("fault.injected", payload);
  }

  subscribe(handler: TelemetryEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.unsubscribe(handler);
    };
  }

  unsubscribe(handler: TelemetryEventHandler): void {
    this.handlers.delete(handler);
  }

  getStatus(): TelemetryStreamStatus {
    return this.status;
  }

  private emit(
    type: TelemetryEventType,
    payload:
      | StreamLifecyclePayload
      | TelemetrySnapshotPayload
      | FaultInjectedPayload
      | StateChangedPayload,
    snapshot = this.simulator.getSnapshot(),
  ): void {
    const sequence = this.sequence + 1;
    this.sequence = sequence;

    const event: TelemetryEvent = {
      id: `${this.simulator.robotId}:${sequence}`,
      type,
      timestamp: this.clock?.now() ?? Date.parse(snapshot.timestamp),
      robotId: this.simulator.robotId,
      sequence,
      payload,
    };

    for (const handler of [...this.handlers]) {
      handler(cloneTelemetryEvent(event));
    }
  }
}
