import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createTwinDiagnosticReport,
  exportCustomEvidenceArtifacts,
  renderTwinDiagnosticReport,
} from "../src/index.js";

const diagnostics = createTwinDiagnosticReport([]);
const rootDir = mkdtempSync(join(tmpdir(), "interstice-custom-mission-"));
const written = exportCustomEvidenceArtifacts({
  experimentId: "custom-rover-mission",
  rootDir,
  createdAt: 0,
  metadata: {
    name: "Custom rover mission",
    robotIds: ["rover-0"],
  },
  replayValidation: { valid: true, errors: [], warnings: [] },
  diagnostics,
  reports: {
    "twin-diagnostics.txt": renderTwinDiagnosticReport(diagnostics),
    "mission-summary.json": {
      format: "json",
      content: { completed: true, distanceMeters: 3 },
    },
  },
});

console.log(`custom mission artifacts: ${written.experimentPath}`);
console.log(written.files.join("\n"));
