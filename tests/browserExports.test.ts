import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

describe("browser-safe digital twin exports", () => {
  it("imports the browser entry without exposing Node artifact persistence", async () => {
    const browser = await import("../src/digitalTwin/browser.js");
    expect(browser.createTwinTimeline).toBeTypeOf("function");
    expect(browser.validateRobotStateSchema).toBeTypeOf("function");
    expect("writeExperimentArtifacts" in browser).toBe(false);
  });

  it("has no Node built-in imports in the browser entry dependency modules", () => {
    const directory = new URL("../src/digitalTwin/", import.meta.url);
    for (const file of [
      "browser.ts",
      "deterministicJson.ts",
      "fixtures.ts",
      "model.ts",
      "multiRobotTwinView.ts",
      "replayEvent.ts",
      "robotState.ts",
      "scene.ts",
      "schemaValidation.ts",
      "telemetryBridge.ts",
      "twinDiagnostics.ts",
      "twinTimeline.ts",
    ]) {
      const source = readFileSync(fileURLToPath(new URL(file, directory)), "utf8");
      expect(source).not.toMatch(/from ["']node:/);
    }
    const provenanceDirectory = new URL("../src/provenance/", import.meta.url);
    for (const file of [
      "provenanceBuilder.ts",
      "provenanceHelpers.ts",
      "provenanceOwnership.ts",
      "provenanceReport.ts",
      "provenanceTypes.ts",
      "provenanceValidator.ts",
    ]) {
      const source = readFileSync(
        fileURLToPath(new URL(file, provenanceDirectory)),
        "utf8",
      );
      expect(source).not.toMatch(/from ["']node:/);
    }
  });
});
