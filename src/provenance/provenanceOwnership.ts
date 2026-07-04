import {
  EVIDENCE_OWNER_TYPES,
  EVIDENCE_VISIBILITIES,
  type EvidenceOwnership,
} from "./provenanceTypes.js";
import { toImmutableProvenanceValue } from "./provenanceHelpers.js";

export const DEFAULT_EVIDENCE_OWNERSHIP: EvidenceOwnership =
  toImmutableProvenanceValue({
    ownerType: "local",
    visibility: "private",
  });

export const createEvidenceOwnership = (
  ownership: EvidenceOwnership = DEFAULT_EVIDENCE_OWNERSHIP,
): EvidenceOwnership => {
  if (!(EVIDENCE_OWNER_TYPES as readonly string[]).includes(ownership.ownerType)) {
    throw new TypeError(`unsupported evidence ownerType "${ownership.ownerType}"`);
  }
  if (
    !(EVIDENCE_VISIBILITIES as readonly string[]).includes(ownership.visibility)
  ) {
    throw new TypeError(
      `unsupported evidence visibility "${ownership.visibility}"`,
    );
  }
  if (ownership.ownerId !== undefined && ownership.ownerId.length === 0) {
    throw new TypeError("evidence ownerId must not be empty");
  }
  return toImmutableProvenanceValue(ownership, "ownership");
};
