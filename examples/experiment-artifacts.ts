import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  exportFleetRunArtifacts,
  getBuiltInFleetScenario,
  readExperimentArtifacts,
  runFleetScenario,
  validateExperimentArtifactBundle,
} from "../src/index.js";

const scenario = getBuiltInFleetScenario("mixed-fault-fleet");

if (scenario === undefined) {
  throw new Error("Built-in mixed-fault-fleet scenario was not found.");
}

const result = runFleetScenario(scenario);
const rootDir = mkdtempSync(join(tmpdir(), "interstice-artifacts-"));
const written = exportFleetRunArtifacts(result, { rootDir });
const validation = validateExperimentArtifactBundle(written.bundle);

console.log(`experiment path: ${written.experimentPath}`);
console.log(`artifact validation: ${validation.valid ? "valid" : "invalid"}`);
console.log("files:");
for (const path of written.files) {
  console.log(`- ${path}`);
}

const loaded = readExperimentArtifacts(written.experimentPath);

console.log("");
console.log(`loaded name: ${loaded.metadata.name}`);
console.log(`loaded robot ids: ${loaded.metadata.robotIds.join(", ")}`);
console.log(`loaded file count: ${loaded.files.length}`);
