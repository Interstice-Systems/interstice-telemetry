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
  createFleetTelemetrySummary,
  exportFleetRunArtifacts,
  getBuiltInFleetScenario,
  readExperimentArtifacts,
  runFleetScenario,
} from "../src/index.js";

const directories: string[] = [];

afterEach(() => {
  for (const path of directories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

const fleetResult = () => {
  const profile = getBuiltInFleetScenario("mixed-fault-fleet");
  if (profile === undefined) throw new Error("Missing fleet scenario.");
  return runFleetScenario(profile);
};

describe("exportFleetRunArtifacts", () => {
  it("writes aggregate and per-robot fleet artifacts", () => {
    const result = fleetResult();
    const rootDir = mkdtempSync(join(tmpdir(), "interstice-fleet-export-"));
    directories.push(rootDir);

    const written = exportFleetRunArtifacts(result, { rootDir });
    const loaded = readExperimentArtifacts(written.experimentPath);

    expect(
      existsSync(join(written.experimentPath, "fleet-replay-log.json")),
    ).toBe(true);
    expect(
      existsSync(
        join(
          written.experimentPath,
          "robots/robot-alpha/reports/replay-report.txt",
        ),
      ),
    ).toBe(true);
    expect(JSON.parse(readFileSync(
      join(written.experimentPath, "fleet-replay-log.json"),
      "utf8",
    ))).toEqual(result.fleetReplayLog);
    expect(loaded.metadata.robotIds).toEqual([
      "robot-alpha",
      "robot-beta",
      "robot-gamma",
    ]);
    expect(loaded.files).toHaveLength(28);
  });

  it("summarizes fleet identity, counts, final states, and duration", () => {
    const result = fleetResult();

    expect(createFleetTelemetrySummary(result)).toEqual({
      robotIds: ["robot-alpha", "robot-beta", "robot-gamma"],
      eventCount: result.summary.totalEvents,
      faultCount: result.summary.totalFaults,
      finalStates: result.summary.finalStates,
      durationMs: result.summary.durationMs,
    });
  });
});
