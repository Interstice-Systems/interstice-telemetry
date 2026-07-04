import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  deserializeEvidenceManifest,
  exportScenarioRunArtifacts,
  getBuiltInScenario,
  runScenario,
  validateEvidenceManifest,
} from "../../src/index.js";

const scenario = getBuiltInScenario("motor-overheat");
if (scenario === undefined) throw new Error("Scenario was not found.");

const rootDir = mkdtempSync(join(tmpdir(), "interstice-evidence-example-"));
const written = exportScenarioRunArtifacts(runScenario(scenario), { rootDir });
const manifest = deserializeEvidenceManifest(
  readFileSync(
    join(written.experimentPath, "evidence/evidence-manifest.json"),
    "utf8",
  ),
);

console.log(`experiment: ${manifest.experimentId}`);
console.log(`manifest valid: ${validateEvidenceManifest(manifest).valid}`);
console.log(`evidence items: ${manifest.evidence.length}`);
