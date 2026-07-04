import {
  createEvidenceManifest,
  renderEvidenceManifestReport,
  validateEvidenceManifest,
} from "../../src/index.js";

const manifest = createEvidenceManifest({
  experimentId: "rover-inspection",
  createdAt: 1_735_689_600_000,
  evidence: [
    {
      evidenceId: "telemetry-rover-1",
      kind: "telemetry",
      robotId: "rover-1",
      provenanceId: "prov-telemetry-rover-1",
    },
    {
      evidenceId: "replay-rover-1",
      kind: "replay-log",
      path: "replay-log.json",
      format: "json",
      robotId: "rover-1",
      provenanceId: "prov-replay-rover-1",
    },
  ],
  relationships: [{
    fromEvidenceId: "telemetry-rover-1",
    toEvidenceId: "replay-rover-1",
    type: "produced",
  }],
});

console.log(`valid: ${validateEvidenceManifest(manifest).valid}`);
console.log(renderEvidenceManifestReport(manifest));
