import {
  createEvidenceManifest,
  traceEvidenceAncestors,
  traceEvidenceDescendants,
} from "../../src/index.js";

const manifest = createEvidenceManifest({
  experimentId: "lineage-example",
  evidence: [
    { evidenceId: "telemetry", kind: "telemetry" },
    { evidenceId: "replay", kind: "replay-log" },
    { evidenceId: "timeline", kind: "twin-timeline" },
  ],
  relationships: [
    {
      fromEvidenceId: "telemetry",
      toEvidenceId: "replay",
      type: "produced",
    },
    {
      fromEvidenceId: "replay",
      toEvidenceId: "timeline",
      type: "produced",
    },
  ],
});

console.log(
  "timeline ancestors:",
  traceEvidenceAncestors(manifest, "timeline")
    .map(({ evidenceId }) => evidenceId)
    .join(", "),
);
console.log(
  "telemetry descendants:",
  traceEvidenceDescendants(manifest, "telemetry")
    .map(({ evidenceId }) => evidenceId)
    .join(", "),
);
