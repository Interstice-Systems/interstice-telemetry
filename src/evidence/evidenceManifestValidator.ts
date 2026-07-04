import {
  EVIDENCE_FORMATS,
  EVIDENCE_KINDS,
  EVIDENCE_MANIFEST_VERSION,
  EVIDENCE_RELATIONSHIP_TYPES,
  type EvidenceManifestValidationResult,
} from "./evidenceManifestTypes.js";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const nonEmpty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isSafeRelativeEvidencePath = (value: string): boolean => {
  const normalized = value.replaceAll("\\", "/");
  return (
    nonEmpty(value) &&
    !normalized.startsWith("/") &&
    !/^[a-zA-Z]:\//.test(normalized) &&
    !normalized.split("/").some((segment) => segment === "..") &&
    normalized !== "."
  );
};

export const validateEvidenceManifest = (
  manifest: unknown,
): EvidenceManifestValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!isRecord(manifest)) {
    return {
      valid: false,
      errors: ["Evidence manifest must be an object."],
      warnings,
    };
  }

  if (manifest.version !== EVIDENCE_MANIFEST_VERSION) {
    errors.push(
      `Unsupported evidence manifest version "${String(manifest.version)}"; expected "${EVIDENCE_MANIFEST_VERSION}".`,
    );
  }
  if (!nonEmpty(manifest.manifestId)) errors.push("Manifest id is required.");
  if (!nonEmpty(manifest.experimentId)) {
    errors.push("Manifest experimentId is required.");
  }
  if (
    !nonEmpty(manifest.createdAt) ||
    !Number.isFinite(Date.parse(manifest.createdAt))
  ) {
    errors.push("Manifest createdAt must be a valid date string.");
  }

  const evidenceIds = new Set<string>();
  if (!Array.isArray(manifest.evidence)) {
    errors.push("Manifest evidence must be an array.");
  } else {
    if (manifest.evidence.length === 0) {
      warnings.push("Evidence manifest contains no evidence.");
    }
    manifest.evidence.forEach((entry, index) => {
      const label = `Evidence at index ${index}`;
      if (!isRecord(entry)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!nonEmpty(entry.evidenceId)) {
        errors.push(`${label} must have a non-empty evidenceId.`);
      } else if (evidenceIds.has(entry.evidenceId)) {
        errors.push(`${label} has duplicate evidenceId "${entry.evidenceId}".`);
      } else {
        evidenceIds.add(entry.evidenceId);
      }
      if (
        typeof entry.kind !== "string" ||
        !(EVIDENCE_KINDS as readonly string[]).includes(entry.kind)
      ) {
        errors.push(`${label} has unknown kind "${String(entry.kind)}".`);
      }
      if (
        entry.path !== undefined &&
        (typeof entry.path !== "string" ||
          !isSafeRelativeEvidencePath(entry.path))
      ) {
        errors.push(`${label} path must be a safe relative path.`);
      }
      if (
        entry.format !== undefined &&
        (typeof entry.format !== "string" ||
          !(EVIDENCE_FORMATS as readonly string[]).includes(entry.format))
      ) {
        errors.push(`${label} has unknown format "${String(entry.format)}".`);
      }
      if (
        entry.timestamp !== undefined &&
        (typeof entry.timestamp !== "number" ||
          !Number.isSafeInteger(entry.timestamp) ||
          entry.timestamp < 0)
      ) {
        errors.push(`${label} timestamp must be a non-negative safe integer.`);
      }
      if (
        entry.provenanceId !== undefined &&
        !nonEmpty(entry.provenanceId)
      ) {
        errors.push(`${label} provenanceId must not be empty.`);
      }
      if (entry.provenanceId === undefined && nonEmpty(entry.evidenceId)) {
        warnings.push(`Evidence "${entry.evidenceId}" has no provenance.`);
      }
    });
  }

  if (!Array.isArray(manifest.relationships)) {
    errors.push("Manifest relationships must be an array.");
  } else {
    if (manifest.relationships.length === 0) {
      warnings.push("Evidence manifest contains no relationships.");
    }
    const relationshipIds = new Set<string>();
    manifest.relationships.forEach((relationship, index) => {
      const label = `Relationship at index ${index}`;
      if (!isRecord(relationship)) {
        errors.push(`${label} must be an object.`);
        return;
      }
      if (!nonEmpty(relationship.relationshipId)) {
        errors.push(`${label} must have a non-empty relationshipId.`);
      } else if (relationshipIds.has(relationship.relationshipId)) {
        errors.push(
          `${label} has duplicate relationshipId "${relationship.relationshipId}".`,
        );
      } else {
        relationshipIds.add(relationship.relationshipId);
      }
      if (
        typeof relationship.type !== "string" ||
        !(EVIDENCE_RELATIONSHIP_TYPES as readonly string[]).includes(
          relationship.type,
        )
      ) {
        errors.push(
          `${label} has unknown type "${String(relationship.type)}".`,
        );
      }
      for (const field of ["fromEvidenceId", "toEvidenceId"] as const) {
        const endpoint = relationship[field];
        if (!nonEmpty(endpoint)) {
          errors.push(`${label} ${field} is required.`);
        } else if (!evidenceIds.has(endpoint)) {
          errors.push(
            `${label} ${field} "${endpoint}" does not reference manifest evidence.`,
          );
        }
      }
    });
  }

  return { valid: errors.length === 0, errors, warnings };
};
