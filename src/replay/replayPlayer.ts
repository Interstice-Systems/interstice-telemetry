import type { ReplayClock } from "../clock/replayClock.js";
import type {
  TelemetryEvent,
  TelemetryEventHandler,
} from "../events/eventTypes.js";
import type { ReplayLog } from "./replayLog.js";

export type ReplayPlayerStatus = "running" | "stopped";

export class ReplayPlayer {
  private readonly events: readonly TelemetryEvent[];
  private readonly handlers = new Set<TelemetryEventHandler>();
  private status: ReplayPlayerStatus = "stopped";
  private currentIndex = 0;

  constructor(
    log: ReplayLog,
    private readonly clock?: ReplayClock,
  ) {
    this.events = [...log.events];
  }

  start(): void {
    this.status = "running";
  }

  stop(): void {
    this.status = "stopped";
  }

  step(): TelemetryEvent | undefined {
    if (this.status === "stopped") {
      return undefined;
    }

    const event = this.events[this.currentIndex];

    if (event === undefined) {
      this.status = "stopped";
      return undefined;
    }

    if (this.clock !== undefined && this.currentIndex > 0) {
      this.clock.advanceToNextEvent();
    }

    this.currentIndex += 1;

    for (const handler of [...this.handlers]) {
      handler(event);
    }

    if (this.currentIndex === this.events.length) {
      this.status = "stopped";
    }

    return event;
  }

  playAll(): TelemetryEvent[] {
    const emitted: TelemetryEvent[] = [];

    while (this.status === "running") {
      const event = this.step();

      if (event !== undefined) {
        emitted.push(event);
      }
    }

    return emitted;
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

  getStatus(): ReplayPlayerStatus {
    return this.status;
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }
}
