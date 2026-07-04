import { describe, expect, it } from "vitest";

import {
  appendTransformation,
  createSimulationProvenance,
  renderProvenanceReport,
} from "../src/index.js";

describe("provenance report", () => {
  it("renders stable plain text", () => {
    const provenance = appendTransformation(
      createSimulationProvenance({
        sourceName: "ScenarioRunner",
        robotId: "rover-1",
        timestamp: 1_000,
      }),
      { name: "Replay Recorder", timestamp: 2_000 },
    );
    expect(renderProvenanceReport(provenance)).toBe(
      [
        "Evidence Provenance",
        "",
        "Robot:",
        "rover-1",
        "",
        "Origin:",
        "Simulation",
        "",
        "Generated:",
        "ScenarioRunner",
        "",
        "Confidence:",
        "Exact",
        "",
        "Transformations:",
        "",
        "1 Replay Recorder",
        "",
        "Owner:",
        "Local",
        "",
        "Visibility:",
        "Private",
      ].join("\n"),
    );
  });
});
