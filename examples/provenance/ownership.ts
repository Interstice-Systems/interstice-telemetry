import {
  createEvidenceOwnership,
  createImporterProvenance,
  renderProvenanceReport,
} from "../../src/index.js";

const ownership = createEvidenceOwnership({
  ownerType: "research",
  ownerId: "mobility-lab",
  visibility: "organization",
});
const provenance = createImporterProvenance({
  sourceName: "Lab Dataset Importer",
  robotId: "rover-1",
  timestamp: 1_735_689_600_000,
  confidence: "measured",
  ownership,
});

console.log(renderProvenanceReport(provenance));
