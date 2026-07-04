import type {
  EvidenceKind,
  EvidenceManifest,
  EvidenceManifestEntry,
} from "./evidenceManifestTypes.js";

const sortEntries = (
  entries: readonly EvidenceManifestEntry[],
): EvidenceManifestEntry[] =>
  [...entries].sort((left, right) =>
    left.evidenceId.localeCompare(right.evidenceId),
  );

const trace = (
  manifest: EvidenceManifest,
  evidenceId: string,
  direction: "ancestors" | "descendants",
): readonly EvidenceManifestEntry[] => {
  if (!manifest.evidence.some((entry) => entry.evidenceId === evidenceId)) {
    return Object.freeze([]);
  }
  const byId = new Map(
    manifest.evidence.map((entry) => [entry.evidenceId, entry]),
  );
  const visited = new Set([evidenceId]);
  const pending = [evidenceId];
  const result: EvidenceManifestEntry[] = [];

  while (pending.length > 0) {
    const current = pending.shift()!;
    const adjacent = manifest.relationships
      .flatMap((relationship) => {
        const parentId =
          relationship.type === "derived-from"
            ? relationship.toEvidenceId
            : relationship.fromEvidenceId;
        const childId =
          relationship.type === "derived-from"
            ? relationship.fromEvidenceId
            : relationship.toEvidenceId;
        if (
          direction === "ancestors" &&
          childId === current
        ) {
          return [parentId];
        }
        if (
          direction === "descendants" &&
          parentId === current
        ) {
          return [childId];
        }
        return [];
      })
      .sort();
    for (const adjacentId of adjacent) {
      if (visited.has(adjacentId)) continue;
      visited.add(adjacentId);
      pending.push(adjacentId);
      const entry = byId.get(adjacentId);
      if (entry !== undefined) result.push(entry);
    }
  }
  return Object.freeze(sortEntries(result));
};

export const traceEvidenceAncestors = (
  manifest: EvidenceManifest,
  evidenceId: string,
): readonly EvidenceManifestEntry[] =>
  trace(manifest, evidenceId, "ancestors");

export const traceEvidenceDescendants = (
  manifest: EvidenceManifest,
  evidenceId: string,
): readonly EvidenceManifestEntry[] =>
  trace(manifest, evidenceId, "descendants");

export const findEvidenceByKind = (
  manifest: EvidenceManifest,
  kind: EvidenceKind,
): readonly EvidenceManifestEntry[] =>
  Object.freeze(
    sortEntries(manifest.evidence.filter((entry) => entry.kind === kind)),
  );

export const findEvidenceByRobot = (
  manifest: EvidenceManifest,
  robotId: string,
): readonly EvidenceManifestEntry[] =>
  Object.freeze(
    sortEntries(
      manifest.evidence.filter((entry) => entry.robotId === robotId),
    ),
  );

export const findEvidenceByProvenance = (
  manifest: EvidenceManifest,
  provenanceId: string,
): readonly EvidenceManifestEntry[] =>
  Object.freeze(
    sortEntries(
      manifest.evidence.filter(
        (entry) => entry.provenanceId === provenanceId,
      ),
    ),
  );
