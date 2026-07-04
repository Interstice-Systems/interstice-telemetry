import { describe, expect, it } from "vitest";

import {
  ReplayRecorder,
  buildTwinTimelineFromReplay,
  createSimulationProvenance,
  runTwinDiagnostics,
  validateEvidenceProvenance,
  type TelemetryEvent,
} from "../src/index.js";

describe("provenance propagation", () => {
  it("preserves lineage through replay, twin construction, and diagnostics", () => {
    const origin = createSimulationProvenance({
      sourceName: "ScenarioRunner",
      robotId: "rover-1",
      timestamp: 1_000,
    });
    const event: TelemetryEvent = {
      id: "rover-1:1",
      type: "telemetry.snapshot",
      timestamp: 1_000,
      robotId: "rover-1",
      sequence: 1,
      payload: {},
      provenance: origin,
    };
    const recorder = new ReplayRecorder({ createdAt: 1_000 });
    recorder.start();
    recorder.record(event);
    const log = recorder.toLog();
    const timeline = buildTwinTimelineFromReplay(log);
    const report = runTwinDiagnostics(timeline);

    expect(log.provenance?.transformationHistory.map(({ name }) => name)).toEqual([
      "Replay Recorder",
    ]);
    expect(timeline.provenance?.transformationHistory.map(({ name }) => name)).toEqual([
      "Replay Recorder",
      "Twin Timeline Builder",
    ]);
    expect(report.provenance?.transformationHistory.map(({ name }) => name)).toEqual([
      "Replay Recorder",
      "Twin Timeline Builder",
      "Diagnostics",
    ]);
    expect(validateEvidenceProvenance(report.provenance).valid).toBe(true);
    expect(origin.transformationHistory).toEqual([]);
  });

  it("leaves legacy replay and twin shapes unchanged when provenance is absent", () => {
    const recorder = new ReplayRecorder({
      robotId: "rover-1",
      createdAt: 0,
    });
    const log = recorder.toLog();
    const timeline = buildTwinTimelineFromReplay(log);
    expect("provenance" in log).toBe(false);
    expect("provenance" in timeline).toBe(false);
    expect("provenance" in runTwinDiagnostics(timeline)).toBe(false);
  });

  it("exposes provenance from the browser-safe entry", async () => {
    const browser = await import("../src/digitalTwin/browser.js");
    expect(browser.createSimulationProvenance).toBeTypeOf("function");
    expect(browser.renderProvenanceReport).toBeTypeOf("function");
  });
});
