import type { EvidenceProvenance } from "./provenanceTypes.js";

const title = (value: string): string =>
  value.length === 0 ? value : value[0]!.toUpperCase() + value.slice(1);

export const renderProvenanceReport = (
  provenance: EvidenceProvenance,
): string => {
  const transformations =
    provenance.transformationHistory.length === 0
      ? "None"
      : provenance.transformationHistory
          .map((step, index) => `${index + 1} ${step.name}`)
          .join("\n");
  return [
    "Evidence Provenance",
    "",
    "Robot:",
    provenance.robotId ?? "Unspecified",
    "",
    "Origin:",
    title(provenance.sourceType),
    "",
    "Generated:",
    provenance.sourceName,
    "",
    "Confidence:",
    title(provenance.confidence),
    "",
    "Transformations:",
    "",
    transformations,
    "",
    "Owner:",
    provenance.ownership.ownerId ?? title(provenance.ownership.ownerType),
    "",
    "Visibility:",
    title(provenance.ownership.visibility),
  ].join("\n");
};
