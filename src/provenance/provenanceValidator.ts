import {
  EVIDENCE_OWNER_TYPES,
  EVIDENCE_PROVENANCE_VERSION,
  EVIDENCE_VISIBILITIES,
  PROVENANCE_CONFIDENCE_LEVELS,
  PROVENANCE_SOURCE_TYPES,
  type ProvenanceValidationResult,
} from "./provenanceTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validTimestamp = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

export const validateEvidenceProvenance = (
  value: unknown,
): ProvenanceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isRecord(value)) {
    return {
      valid: false,
      errors: ["Evidence provenance must be an object."],
      warnings,
    };
  }

  if (value.version !== EVIDENCE_PROVENANCE_VERSION) {
    errors.push(
      `Unsupported provenance version "${String(value.version)}"; expected "${EVIDENCE_PROVENANCE_VERSION}".`,
    );
  }
  if (!nonEmpty(value.provenanceId)) {
    errors.push("Provenance id is required.");
  }
  if (
    typeof value.sourceType !== "string" ||
    !(PROVENANCE_SOURCE_TYPES as readonly string[]).includes(value.sourceType)
  ) {
    errors.push(`Unknown provenance source type "${String(value.sourceType)}".`);
  }
  if (!nonEmpty(value.sourceName)) errors.push("Provenance sourceName is required.");
  if (!validTimestamp(value.timestamp)) {
    errors.push("Provenance timestamp must be a non-negative safe integer.");
  }
  if (
    !nonEmpty(value.createdAt) ||
    !Number.isFinite(Date.parse(value.createdAt))
  ) {
    errors.push("Provenance createdAt must be a valid date string.");
  }
  if (
    typeof value.confidence !== "string" ||
    !(PROVENANCE_CONFIDENCE_LEVELS as readonly string[]).includes(
      value.confidence,
    )
  ) {
    errors.push(`Unknown provenance confidence "${String(value.confidence)}".`);
  }

  if (!isRecord(value.ownership)) {
    errors.push("Provenance ownership must be an object.");
  } else {
    if (
      typeof value.ownership.ownerType !== "string" ||
      !(EVIDENCE_OWNER_TYPES as readonly string[]).includes(
        value.ownership.ownerType,
      )
    ) {
      errors.push("Provenance ownership ownerType is invalid.");
    }
    if (
      typeof value.ownership.visibility !== "string" ||
      !(EVIDENCE_VISIBILITIES as readonly string[]).includes(
        value.ownership.visibility,
      )
    ) {
      errors.push("Provenance ownership visibility is invalid.");
    }
    if (
      value.ownership.ownerId !== undefined &&
      !nonEmpty(value.ownership.ownerId)
    ) {
      errors.push("Provenance ownership ownerId must not be empty.");
    }
  }

  if (!Array.isArray(value.transformationHistory)) {
    errors.push("Provenance transformationHistory must be an array.");
  } else {
    const transformationIds = new Set<string>();
    let previousTimestamp: number | undefined;
    value.transformationHistory.forEach((step, index) => {
      const label = `Transformation at index ${index}`;
      if (!isRecord(step)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!nonEmpty(step.transformationId)) {
        errors.push(`${label} must have a non-empty transformationId.`);
      } else if (transformationIds.has(step.transformationId)) {
        errors.push(
          `${label} has duplicate transformationId "${step.transformationId}".`,
        );
      } else {
        transformationIds.add(step.transformationId);
      }
      if (!nonEmpty(step.name)) errors.push(`${label} must have a name.`);
      if (!validTimestamp(step.timestamp)) {
        errors.push(`${label} must have a non-negative safe integer timestamp.`);
      } else {
        if (
          previousTimestamp !== undefined &&
          step.timestamp < previousTimestamp
        ) {
          errors.push(`${label} timestamp must not move backward.`);
        }
        previousTimestamp = step.timestamp;
      }
      if (!Array.isArray(step.inputProvenanceIds)) {
        errors.push(`${label} inputProvenanceIds must be an array.`);
      } else {
        const references = new Set<string>();
        step.inputProvenanceIds.forEach((reference) => {
          if (!nonEmpty(reference)) {
            errors.push(`${label} contains an invalid provenance reference.`);
          } else if (reference === value.provenanceId) {
            errors.push(`${label} must not reference its containing provenance.`);
          } else if (references.has(reference)) {
            errors.push(`${label} contains duplicate provenance reference "${reference}".`);
          } else {
            references.add(reference);
          }
        });
      }
    });
  }

  return { valid: errors.length === 0, errors, warnings };
};

export const validateProvenance = validateEvidenceProvenance;
