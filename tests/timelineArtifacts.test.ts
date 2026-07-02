import {
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  deserializeFleetEventTimeline,
  exportFleetRunArtifacts,
  getBuiltInFleetScenario,
  runFleetScenario,
  serializeFleetEventTimeline,
  validateFleetEventTimeline,
} from "../src/index.js";

const directories: string[] = [];

afterEach(() => {
  for (const path of directories.splice(0)) {
    rmSync(path, { recursive: true, force: true });
  }
});

describe("fleet timeline artifacts", () => {
  it("writes timeline JSON, report, and summary files", () => {
    const profile = getBuiltInFleetScenario("mixed-fault-fleet");
    if (profile === undefined) throw new Error("Missing fleet scenario.");
    const result = runFleetScenario(profile);
    const rootDir = mkdtempSync(join(tmpdir(), "interstice-timeline-"));
    directories.push(rootDir);

    const written = exportFleetRunArtifacts(result, { rootDir });
    const timelinePath = join(
      written.experimentPath,
      "timeline/fleet-event-timeline.json",
    );
    const timeline = deserializeFleetEventTimeline(
      readFileSync(timelinePath, "utf8"),
    );

    expect(validateFleetEventTimeline(timeline).valid).toBe(true);
    expect(timeline.eventCount).toBe(result.fleetReplayLog.eventCount);
    expect(
      readFileSync(
        join(
          written.experimentPath,
          "timeline/fleet-timeline-report.txt",
        ),
        "utf8",
      ),
    ).toContain("GLOBAL FLEET TIMELINE");
    expect(
      readFileSync(
        join(
          written.experimentPath,
          "timeline/fleet-timeline-summary.txt",
        ),
        "utf8",
      ),
    ).toContain("GLOBAL FLEET TIMELINE SUMMARY");
  });

  it("round-trips timeline JSON", () => {
    const timeline = {
      version: "0.11.0",
      fleetId: "fleet-1",
      createdAt: "2026-01-01T00:00:00.000Z",
      eventCount: 0,
      events: [],
    };

    expect(
      deserializeFleetEventTimeline(serializeFleetEventTimeline(timeline)),
    ).toEqual(timeline);
  });
});

