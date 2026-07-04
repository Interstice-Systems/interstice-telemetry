import {
  createEvidenceManifest,
  renderProvenanceCoverageReport,
  summarizeProvenanceCoverage,
} from "../../src/index.js";

const manifest = createEvidenceManifest({
  experimentId: "coverage-example",
  evidence: [
    {
      evidenceId: "telemetry",
      kind: "telemetry",
      provenanceId: "prov-telemetry",
    },
    { evidenceId: "replay", kind: "replay-log" },
  ],
  relationships: [{
    fromEvidenceId: "telemetry",
    toEvidenceId: "replay",
    type: "produced",
  }],
});

console.log(summarizeProvenanceCoverage(manifest));
console.log(renderProvenanceCoverageReport(manifest));
