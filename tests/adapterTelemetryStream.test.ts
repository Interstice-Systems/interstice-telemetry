import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  AdapterTelemetryStream,
  createArtifactMetadataDocument,
  createExperimentArtifactBundle,
  readExperimentArtifacts,
  ReplayPlayer,
  ReplayRecorder,
  renderEventTimeline,
  renderReplayReport,
  validateReplayLog,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
  writeExperimentArtifacts,
  type AdapterTelemetryStreamOptions,
  type TelemetryEvent,
} from "../src/index.js";

const createOptions = (
  overrides: Partial<AdapterTelemetryStreamOptions> = {},
): AdapterTelemetryStreamOptions => ({
  robotId: "adapter-rover",
  battery: new VirtualBatteryAdapter({
    id: "battery-main",
    percentage: 80,
    percentageChangePerSecond: -1,
  }),
  motor: new VirtualMotorAdapter({ id: "motors-main" }),
  imu: new VirtualImuAdapter({ id: "imu-main" }),
  system: new VirtualSystemAdapter({ id: "system-main" }),
  initialState: "active",
  startTime: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

const collectEvents = (
  stream: AdapterTelemetryStream,
): { events: TelemetryEvent[]; unsubscribe: () => void } => {
  const events: TelemetryEvent[] = [];
  const unsubscribe = stream.subscribe((event) => events.push(event));
  return { events, unsubscribe };
};

describe("AdapterTelemetryStream", () => {
  it("starts stopped and has an empty sequence", () => {
    const stream = new AdapterTelemetryStream(createOptions());

    expect(stream.getStatus()).toBe("stopped");
    expect(stream.getSequence()).toBe(0);
  });

  it("has an idempotent explicit lifecycle", () => {
    const stream = new AdapterTelemetryStream(createOptions());
    const { events } = collectEvents(stream);

    stream.start();
    stream.start();
    stream.stop();
    stream.stop();

    expect(stream.getStatus()).toBe("stopped");
    expect(events.map(({ type }) => type)).toEqual([
      "adapter.stream.started",
      "adapter.stream.stopped",
    ]);
  });

  it("steps only while running and emits an adapter-backed snapshot", () => {
    const stream = new AdapterTelemetryStream(createOptions());
    const { events } = collectEvents(stream);

    expect(stream.step(1_000)).toBeUndefined();
    stream.start();
    const snapshot = stream.step(1_000);

    expect(snapshot).toMatchObject({
      robotId: "adapter-rover",
      timestamp: "2026-01-01T00:00:01.000Z",
      batteryPercentage: 79,
      state: "active",
    });
    expect(events.at(-1)).toMatchObject({
      type: "adapter.telemetry.snapshot",
      timestamp: Date.parse("2026-01-01T00:00:01.000Z"),
      payload: { snapshot },
    });
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects invalid step duration %s",
    (deltaMs) => {
      const stream = new AdapterTelemetryStream(createOptions());
      expect(() => stream.step(deltaMs)).toThrow(RangeError);
    },
  );

  it("emits exactly one event for each status transition", () => {
    const motor = new VirtualMotorAdapter({ id: "motors-main" });
    const stream = new AdapterTelemetryStream(createOptions({ motor }));
    const { events } = collectEvents(stream);

    stream.start();
    motor.setStatus("degraded");
    stream.step(100);
    stream.step(100);
    motor.setStatus("faulted");
    stream.step(100);

    const changes = events.filter(
      ({ type }) => type === "adapter.status.changed",
    );
    expect(changes).toHaveLength(2);
    expect(changes.map(({ payload }) => payload)).toEqual([
      expect.objectContaining({
        previousStatus: "ready",
        currentStatus: "degraded",
      }),
      expect.objectContaining({
        previousStatus: "degraded",
        currentStatus: "faulted",
      }),
    ]);
  });

  it("disables reading-change events by default", () => {
    const motor = new VirtualMotorAdapter();
    const stream = new AdapterTelemetryStream(createOptions({ motor }));
    const { events } = collectEvents(stream);

    stream.start();
    motor.setReading({ leftRpm: 100 });
    stream.step(100);

    expect(events.some(({ type }) => type === "adapter.reading.changed")).toBe(
      false,
    );
  });

  it("optionally emits one reading event per changed adapter", () => {
    const motor = new VirtualMotorAdapter({ id: "motors-main" });
    const stream = new AdapterTelemetryStream(
      createOptions({ motor, emitReadingChanges: true }),
    );
    const { events } = collectEvents(stream);

    stream.start();
    motor.setReading({ leftRpm: 100, rightRpm: 98 });
    stream.step(100);
    stream.step(100);

    const changes = events.filter(
      ({ type, payload }) =>
        type === "adapter.reading.changed" &&
        (payload as { adapter: { id: string } }).adapter.id === "motors-main",
    );
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      payload: {
        adapter: { id: "motors-main", kind: "motor" },
        previousReading: { leftRpm: 0, rightRpm: 0 },
        currentReading: { leftRpm: 100, rightRpm: 98 },
      },
    });
  });

  it("orders adapter changes by domain before the snapshot", () => {
    const battery = new VirtualBatteryAdapter({ id: "battery-main" });
    const motor = new VirtualMotorAdapter({ id: "motors-main" });
    const stream = new AdapterTelemetryStream(
      createOptions({ battery, motor, emitReadingChanges: true }),
    );
    const { events } = collectEvents(stream);

    stream.start();
    battery.setStatus("degraded");
    battery.setReading({ voltage: 23 });
    motor.setStatus("faulted");
    motor.setReading({ leftRpm: 20 });
    stream.step(100);

    expect(events.slice(1).map(({ type }) => type)).toEqual([
      "adapter.status.changed",
      "adapter.reading.changed",
      "adapter.status.changed",
      "adapter.reading.changed",
      "adapter.telemetry.snapshot",
    ]);
    expect(
      events.slice(1, -1).map(({ payload }) =>
        "adapter" in (payload as Record<string, unknown>)
          ? (payload as { adapter: { id: string } }).adapter.id
          : undefined,
      ),
    ).toEqual([
      "battery-main",
      "battery-main",
      "motors-main",
      "motors-main",
    ]);
  });

  it("assigns deterministic IDs, timestamps, and increasing sequences", () => {
    const run = (): TelemetryEvent[] => {
      const stream = new AdapterTelemetryStream(
        createOptions({ emitReadingChanges: true }),
      );
      const { events } = collectEvents(stream);
      stream.start();
      stream.step(1_000);
      stream.step(500);
      stream.stop();
      return events;
    };

    const first = run();
    expect(first).toEqual(run());
    expect(first.map(({ id }) => id)).toEqual(
      first.map((_, index) => `adapter-rover:${index + 1}`),
    );
    expect(first.map(({ sequence }) => sequence)).toEqual(
      first.map((_, index) => index + 1),
    );
  });

  it("isolates each subscriber from adapter event mutation", () => {
    const stream = new AdapterTelemetryStream(createOptions());
    const observed: TelemetryEvent[] = [];

    stream.subscribe((event) => {
      event.id = "mutated";
      (event.payload as { status: string }).status = "mutated";
    });
    stream.subscribe((event) => observed.push(event));

    stream.start();

    expect(observed[0]).toMatchObject({
      id: "adapter-rover:1",
      payload: { status: "running" },
    });
  });

  it("records, validates, and deterministically replays adapter events", () => {
    const stream = new AdapterTelemetryStream(createOptions());
    const recorder = new ReplayRecorder();
    const unsubscribe = stream.subscribe(recorder.record);

    recorder.start();
    stream.start();
    stream.step(1_000);
    stream.stop();
    recorder.stop();
    unsubscribe();

    const log = recorder.toLog();
    expect(validateReplayLog(log).valid).toBe(true);

    const player = new ReplayPlayer(log);
    const replayed: TelemetryEvent[] = [];
    player.subscribe((event) => replayed.push(event));
    player.start();
    player.playAll();

    expect(replayed).toEqual(recorder.getEvents());
  });

  it("renders adapter replay logs and event payload summaries", () => {
    const motor = new VirtualMotorAdapter({ id: "motors-main" });
    const stream = new AdapterTelemetryStream(createOptions({ motor }));
    const recorder = new ReplayRecorder();
    stream.subscribe(recorder.record);
    recorder.start();
    stream.start();
    motor.setStatus("degraded");
    stream.step(100);
    stream.stop();

    const log = recorder.toLog();
    const timeline = renderEventTimeline(log.events, {
      includePayloadSummary: true,
    });
    const report = renderReplayReport(log);

    expect(timeline).toContain("motors-main: ready -> degraded");
    expect(timeline).toContain("state=active");
    expect(report).toContain("Validation: valid");
    expect(report).toContain("adapter.status.changed: 1");
    expect(report).toContain("adapter.telemetry.snapshot: 1");
  });

  it("persists adapter replay logs through the artifact pipeline", () => {
    const stream = new AdapterTelemetryStream(createOptions());
    const recorder = new ReplayRecorder();
    stream.subscribe(recorder.record);
    recorder.start();
    stream.start();
    stream.step(100);
    stream.stop();
    const log = recorder.toLog();
    const report = renderReplayReport(log);
    const bundle = createExperimentArtifactBundle({
      experimentId: "adapter-stream-run",
      kind: "scenario",
      createdAt: log.createdAt,
      metadata: {
        name: "Adapter stream run",
        robotIds: [log.robotId],
        source: "adapter-stream",
      },
      files: [
        { path: "metadata.json", kind: "metadata", format: "json" },
        { path: "replay-log.json", kind: "replay-log", format: "json" },
        { path: "reports/replay-report.txt", kind: "report", format: "txt" },
      ],
    });
    const rootDir = mkdtempSync(join(tmpdir(), "interstice-adapter-stream-"));

    try {
      const written = writeExperimentArtifacts(
        bundle,
        {
          "metadata.json": createArtifactMetadataDocument(bundle),
          "replay-log.json": log,
          "reports/replay-report.txt": report,
        },
        { rootDir },
      );
      const loaded = readExperimentArtifacts(written.experimentPath);

      expect(loaded.validation.valid).toBe(true);
      expect(
        loaded.files.find(({ path }) => path === "replay-log.json")?.content,
      ).toEqual(log);
      expect(
        loaded.files.find(
          ({ path }) => path === "reports/replay-report.txt",
        )?.content,
      ).toBe(`${report}\n`);
    } finally {
      rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it("supports explicit and returned unsubscribe functions", () => {
    const stream = new AdapterTelemetryStream(createOptions());
    const first: TelemetryEvent[] = [];
    const second: TelemetryEvent[] = [];
    const firstHandler = (event: TelemetryEvent): void => {
      first.push(event);
    };

    stream.subscribe(firstHandler);
    const unsubscribeSecond = stream.subscribe((event) => second.push(event));
    stream.start();
    stream.unsubscribe(firstHandler);
    unsubscribeSecond();
    stream.stop();

    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);
  });
});
