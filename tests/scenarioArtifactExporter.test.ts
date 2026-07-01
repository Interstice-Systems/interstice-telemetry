import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  createScenarioTelemetrySummary,
  exportScenarioRunArtifacts,
  getBuiltInScenario,
  readExperimentArtifacts,
  runScenario,
} from "../src/index.js";

const directories: string[] = [];

afterEach(() => {
  for (const path of directories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe("exportScenarioRunArtifacts", () => {
  it("writes the complete scenario layout and round-trips JSON", () => {
    const profile = getBuiltInScenario("motor-overheat");
    if (profile === undefined) throw new Error("Missing scenario.");
    const result = runScenario(profile);
    const rootDir = mkdtempSync(join(tmpdir(), "interstice-scenario-export-"));
    directories.push(rootDir);

    const written = exportScenarioRunArtifacts(result, { rootDir });
    const loaded = readExperimentArtifacts(written.experimentPath);

    expect(existsSync(join(written.experimentPath, "scenario.json"))).toBe(true);
    expect(
      existsSync(
        join(written.experimentPath, "reports/event-timeline.txt"),
      ),
    ).toBe(true);
    expect(JSON.parse(readFileSync(
      join(written.experimentPath, "replay-log.json"),
      "utf8",
    ))).toEqual(result.replayLog);
    expect(loaded.files).toHaveLength(10);
  });

  it("summarizes identity, counts, final state, and duration", () => {
    const profile = getBuiltInScenario("motor-overheat");
    if (profile === undefined) throw new Error("Missing scenario.");
    const result = runScenario(profile);

    expect(createScenarioTelemetrySummary(result)).toEqual({
      robotIds: [result.finalSnapshot.robotId],
      eventCount: result.summary.eventCount,
      faultCount: result.summary.faultCount,
      finalStates: {
        [result.finalSnapshot.robotId]: result.summary.finalState,
      },
      durationMs: result.summary.durationMs,
    });
  });
});
