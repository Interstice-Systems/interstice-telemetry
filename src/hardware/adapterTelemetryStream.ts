import { isDeepStrictEqual } from "node:util";

import type { TelemetrySnapshot } from "../types.js";
import {
  AdapterTelemetryCollector,
  type AdapterTelemetryCollectorOptions,
  type TelemetryCollectionTimestamp,
} from "./adapterTelemetryCollector.js";
import type {
  AdapterEventPayload,
  AdapterEventType,
  AdapterReadingChangedPayload,
  AdapterStatusChangedPayload,
  AdapterTelemetryEvent,
  AdapterTelemetryEventHandler,
} from "./adapterEventTypes.js";
import type {
  HardwareAdapter,
  SteppableHardwareAdapter,
} from "./hardwareAdapter.js";
import type { HardwareAdapterInfo } from "./hardwareTypes.js";

export type AdapterTelemetryStreamStatus = "running" | "stopped";

export interface AdapterTelemetryStreamOptions
  extends AdapterTelemetryCollectorOptions {
  startTime?: TelemetryCollectionTimestamp;
  emitReadingChanges?: boolean;
}

interface ObservedAdapter {
  info: HardwareAdapterInfo;
  reading: Readonly<Record<string, unknown>>;
}

const toTimestamp = (value: TelemetryCollectionTimestamp): number => {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) {
    throw new TypeError("startTime must be a valid date");
  }
  return timestamp;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const cloneReading = (value: unknown): Readonly<Record<string, unknown>> => {
  if (!isRecord(value)) {
    throw new TypeError("adapter readings must be objects");
  }
  return structuredClone(value);
};

const comparableReading = (
  reading: Readonly<Record<string, unknown>>,
): Record<string, unknown> => {
  const copy: Record<string, unknown> = { ...structuredClone(reading) };
  delete copy.status;
  return copy;
};

const readingsEqual = (
  previous: Readonly<Record<string, unknown>>,
  current: Readonly<Record<string, unknown>>,
): boolean =>
  isDeepStrictEqual(
    comparableReading(previous),
    comparableReading(current),
  );

const isSteppable = (
  adapter: HardwareAdapter<unknown>,
): adapter is SteppableHardwareAdapter<unknown> =>
  "step" in adapter &&
  typeof (adapter as { step?: unknown }).step === "function";

export class AdapterTelemetryStream {
  private readonly collector: AdapterTelemetryCollector;
  private readonly adapters: readonly HardwareAdapter<unknown>[];
  private readonly emitReadingChanges: boolean;
  private readonly handlers = new Set<AdapterTelemetryEventHandler>();
  private status: AdapterTelemetryStreamStatus = "stopped";
  private sequence = 0;
  private timestamp: number;
  private observations: ObservedAdapter[] = [];

  constructor(options: AdapterTelemetryStreamOptions) {
    this.collector = new AdapterTelemetryCollector(options);
    this.adapters = [
      options.battery,
      options.motor,
      options.imu,
      options.system,
    ];
    this.emitReadingChanges = options.emitReadingChanges ?? false;
    this.timestamp = toTimestamp(options.startTime ?? 0);
  }

  start(): void {
    if (this.status === "running") {
      return;
    }

    this.status = "running";
    this.observations = this.observeAdapters();
    this.emit("adapter.stream.started", { status: this.status });
  }

  stop(): void {
    if (this.status === "stopped") {
      return;
    }

    this.status = "stopped";
    this.emit("adapter.stream.stopped", { status: this.status });
  }

  step(deltaMs: number): TelemetrySnapshot | undefined {
    if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
      throw new RangeError("step duration must be a positive number");
    }

    if (this.status === "stopped") {
      return undefined;
    }

    for (const adapter of this.adapters) {
      if (isSteppable(adapter)) {
        adapter.step(deltaMs);
      }
    }

    this.timestamp += deltaMs;
    const currentObservations = this.observeAdapters();

    currentObservations.forEach((current, index) => {
      const previous = this.observations[index];
      if (previous === undefined) {
        return;
      }

      if (current.info.status !== previous.info.status) {
        const payload: AdapterStatusChangedPayload = {
          adapterId: current.info.id,
          adapterKind: current.info.kind,
          adapter: structuredClone(current.info),
          previousStatus: previous.info.status,
          currentStatus: current.info.status,
        };
        this.emit("adapter.status.changed", payload);
      }

      if (
        this.emitReadingChanges &&
        !readingsEqual(previous.reading, current.reading)
      ) {
        const payload: AdapterReadingChangedPayload = {
          adapterId: current.info.id,
          adapterKind: current.info.kind,
          adapter: structuredClone(current.info),
          previousReading: structuredClone(previous.reading),
          currentReading: structuredClone(current.reading),
        };
        this.emit("adapter.reading.changed", payload);
      }
    });

    this.observations = currentObservations;
    const snapshot = this.collector.collect(this.timestamp);
    this.emit("adapter.telemetry.snapshot", { snapshot });
    return snapshot;
  }

  subscribe(handler: AdapterTelemetryEventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.unsubscribe(handler);
    };
  }

  unsubscribe(handler: AdapterTelemetryEventHandler): void {
    this.handlers.delete(handler);
  }

  getStatus(): AdapterTelemetryStreamStatus {
    return this.status;
  }

  getSequence(): number {
    return this.sequence;
  }

  private observeAdapters(): ObservedAdapter[] {
    return this.adapters.map((adapter) => ({
      info: structuredClone(adapter.getInfo()),
      reading: cloneReading(adapter.read()),
    }));
  }

  private emit(type: AdapterEventType, payload: AdapterEventPayload): void {
    const sequence = this.sequence + 1;
    this.sequence = sequence;

    const event: AdapterTelemetryEvent = {
      id: `${this.collector.robotId}:${sequence}`,
      type,
      timestamp: this.timestamp,
      robotId: this.collector.robotId,
      sequence,
      payload,
    };

    for (const handler of [...this.handlers]) {
      handler(event);
    }
  }
}
