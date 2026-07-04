import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  createCustomExperimentBundle,
  exportCustomExperimentBundle,
  renderCustomExperimentSummary,
  validateCustomExperimentBundle,
  type ReplayLog,
} from "../src/index.js";

const replayLog: ReplayLog = {
  version: "0.3.0",
  robotId: "rover-0",
  createdAt: "1970-01-01T00:00:00.000Z",
  eventCount: 0,
  events: [],
  metadata: { missionId: "custom-square-patrol" },
};

const bundle = createCustomExperimentBundle({
  experimentId: "custom-square-patrol",
  createdAt: 0,
  metadata: {
    name: "Custom square patrol",
    description: "Application-defined deterministic mission evidence",
    robotIds: ["rover-0"],
    tags: ["example", "custom-application"],
    application: "rover-controller",
  },
  evidence: {
    replayLog,
    replayValidation: { valid: true, errors: [], warnings: [] },
    twinTimeline: { version: "1.0.0", entries: [] },
    diagnostics: { valid: true, diagnostics: [] },
    provenance: { provenanceId: "custom-square-patrol-source" },
    telemetrySummary: { eventCount: 0, distanceMeters: 0 },
  },
  customJson: {
    "mission-profile": {
      commands: ["forward", "left", "stop"],
      deterministic: true,
    },
  },
  reports: {
    "mission-summary": "Mission completed with no replay events.",
    "operator-notes": "This report is supplied by the external application.",
  },
});

const validation = validateCustomExperimentBundle(bundle);
if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}

console.log(renderCustomExperimentSummary(bundle));

const rootDir = mkdtempSync(join(tmpdir(), "interstice-custom-experiment-"));
const written = exportCustomExperimentBundle(bundle, { rootDir });

console.log(`Output: ${written.experimentPath}`);
console.log(written.files.join("\n"));
