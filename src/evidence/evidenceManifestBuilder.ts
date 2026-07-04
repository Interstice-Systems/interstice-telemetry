import type {
  ArtifactFileContents,
  ExperimentArtifactBundle,
  ExperimentArtifactFileKind,
} from "../artifacts/artifactTypes.js";
import {
  deterministicProvenanceStringify,
  toImmutableProvenanceValue,
} from "../provenance/provenanceHelpers.js";
import {
  EVIDENCE_FORMATS,
  EVIDENCE_KINDS,
  EVIDENCE_MANIFEST_VERSION,
  EVIDENCE_RELATIONSHIP_TYPES,
  type EvidenceFormat,
  type EvidenceKind,
  type EvidenceManifest,
  type EvidenceManifestEntry,
  type EvidenceRelationship,
  type EvidenceRelationshipType,
} from "./evidenceManifestTypes.js";

export type EvidenceManifestEntryInput = Omit<
  EvidenceManifestEntry,
  "evidenceId"
> & {
  readonly evidenceId?: string;
};

export type EvidenceRelationshipInput = Omit<
  EvidenceRelationship,
  "relationshipId"
> & {
  readonly relationshipId?: string;
};

export interface CreateEvidenceManifestInput {
  readonly version?: string;
  readonly manifestId?: string;
  readonly experimentId: string;
  readonly createdAt?: Date | string | number;
  readonly evidence?: readonly EvidenceManifestEntryInput[];
  readonly relationships?: readonly EvidenceRelationshipInput[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

const hashId = (prefix: string, value: unknown): string => {
  const text = deterministicProvenanceStringify(value);
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return `${prefix}-${hash.toString(16).padStart(16, "0")}`;
};

const toIsoString = (value: Date | string | number): string => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new TypeError("evidence manifest createdAt must be a valid date");
  }
  return date.toISOString();
};

const nonEmpty = (value: string, label: string): void => {
  if (value.trim().length === 0) throw new TypeError(`${label} must not be empty`);
};

const compareEntries = (
  left: EvidenceManifestEntry,
  right: EvidenceManifestEntry,
): number => left.evidenceId.localeCompare(right.evidenceId);

const compareRelationships = (
  left: EvidenceRelationship,
  right: EvidenceRelationship,
): number => left.relationshipId.localeCompare(right.relationshipId);

export const createEvidenceManifestEntry = (
  input: EvidenceManifestEntryInput,
): EvidenceManifestEntry => {
  if (!(EVIDENCE_KINDS as readonly string[]).includes(input.kind)) {
    throw new TypeError(`unsupported evidence kind "${input.kind}"`);
  }
  if (
    input.format !== undefined &&
    !(EVIDENCE_FORMATS as readonly string[]).includes(input.format)
  ) {
    throw new TypeError(`unsupported evidence format "${input.format}"`);
  }
  if (input.timestamp !== undefined && (
    !Number.isSafeInteger(input.timestamp) ||
    input.timestamp < 0
  )) {
    throw new TypeError(
      "evidence entry timestamp must be a non-negative safe integer",
    );
  }
  const identity = {
    kind: input.kind,
    ...(input.path === undefined ? {} : { path: input.path }),
    ...(input.robotId === undefined ? {} : { robotId: input.robotId }),
    ...(input.timestamp === undefined ? {} : { timestamp: input.timestamp }),
    ...(input.provenanceId === undefined
      ? {}
      : { provenanceId: input.provenanceId }),
    ...(input.format === undefined ? {} : { format: input.format }),
    ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
  };
  const evidenceId = input.evidenceId ?? hashId("evidence", identity);
  nonEmpty(evidenceId, "evidenceId");
  return toImmutableProvenanceValue(
    { evidenceId, ...identity },
    "evidenceManifestEntry",
  );
};

export const createEvidenceRelationship = (
  input: EvidenceRelationshipInput,
): EvidenceRelationship => {
  if (
    !(EVIDENCE_RELATIONSHIP_TYPES as readonly string[]).includes(input.type)
  ) {
    throw new TypeError(`unsupported evidence relationship type "${input.type}"`);
  }
  nonEmpty(input.fromEvidenceId, "relationship fromEvidenceId");
  nonEmpty(input.toEvidenceId, "relationship toEvidenceId");
  const identity = {
    fromEvidenceId: input.fromEvidenceId,
    toEvidenceId: input.toEvidenceId,
    type: input.type,
    ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
  };
  const relationshipId =
    input.relationshipId ?? hashId("relationship", identity);
  nonEmpty(relationshipId, "relationshipId");
  return toImmutableProvenanceValue(
    { relationshipId, ...identity },
    "evidenceRelationship",
  );
};

export const createEvidenceManifest = (
  input: CreateEvidenceManifestInput,
): EvidenceManifest => {
  nonEmpty(input.experimentId, "evidence manifest experimentId");
  const createdAt = toIsoString(input.createdAt ?? 0);
  const evidence = (input.evidence ?? [])
    .map(createEvidenceManifestEntry)
    .sort(compareEntries);
  const relationships = (input.relationships ?? [])
    .map(createEvidenceRelationship)
    .sort(compareRelationships);
  const manifestId =
    input.manifestId ??
    hashId("manifest", {
      experimentId: input.experimentId,
      createdAt,
    });
  nonEmpty(manifestId, "manifestId");

  return toImmutableProvenanceValue(
    {
      version: input.version ?? EVIDENCE_MANIFEST_VERSION,
      manifestId,
      experimentId: input.experimentId,
      createdAt,
      evidence,
      relationships,
      ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
    },
    "evidenceManifest",
  );
};

export const addEvidenceEntry = (
  manifest: EvidenceManifest,
  entry: EvidenceManifestEntryInput,
): EvidenceManifest =>
  createEvidenceManifest({
    version: manifest.version,
    manifestId: manifest.manifestId,
    experimentId: manifest.experimentId,
    createdAt: manifest.createdAt,
    evidence: [...manifest.evidence, entry],
    relationships: manifest.relationships,
    ...(manifest.metadata === undefined ? {} : { metadata: manifest.metadata }),
  });

export const addEvidenceRelationship = (
  manifest: EvidenceManifest,
  relationship: EvidenceRelationshipInput,
): EvidenceManifest =>
  createEvidenceManifest({
    version: manifest.version,
    manifestId: manifest.manifestId,
    experimentId: manifest.experimentId,
    createdAt: manifest.createdAt,
    evidence: manifest.evidence,
    relationships: [...manifest.relationships, relationship],
    ...(manifest.metadata === undefined ? {} : { metadata: manifest.metadata }),
  });

const kindForArtifact = (
  kind: ExperimentArtifactFileKind,
): EvidenceKind => {
  switch (kind) {
    case "replay-log":
      return "replay-log";
    case "fleet-event-timeline":
      return "fleet-timeline";
    case "evidence-manifest":
      return "manifest";
    default:
      return "artifact";
  }
};

const record = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const provenanceIdFrom = (value: unknown): string | undefined => {
  const provenance = record(record(value)?.provenance);
  return typeof provenance?.provenanceId === "string"
    ? provenance.provenanceId
    : undefined;
};

const robotIdFrom = (value: unknown): string | undefined => {
  const robotId = record(value)?.robotId;
  return typeof robotId === "string" && robotId.length > 0
    ? robotId
    : undefined;
};

const timestampFrom = (value: unknown): number | undefined => {
  const timestamp = record(value)?.timestamp;
  return typeof timestamp === "number" &&
    Number.isSafeInteger(timestamp) &&
    timestamp >= 0
    ? timestamp
    : undefined;
};

export const buildEvidenceManifestFromArtifactBundle = (
  bundle: ExperimentArtifactBundle,
  contents: ArtifactFileContents = {},
): EvidenceManifest => {
  const packageEntry = createEvidenceManifestEntry({
    evidenceId: hashId("evidence-package", {
      experimentId: bundle.experimentId,
      kind: bundle.kind,
    }),
    kind: "artifact",
    metadata: { artifactKind: bundle.kind },
  });
  const entries = bundle.files.map((file) => {
    const content = contents[file.path];
    const robotId = robotIdFrom(content);
    const timestamp = timestampFrom(content);
    const provenanceId = provenanceIdFrom(content);
    return createEvidenceManifestEntry({
      evidenceId: hashId("evidence-file", {
        experimentId: bundle.experimentId,
        path: file.path,
      }),
      kind: kindForArtifact(file.kind),
      path: file.path,
      format: file.format as EvidenceFormat,
      ...(robotId === undefined ? {} : { robotId }),
      ...(timestamp === undefined ? {} : { timestamp }),
      ...(provenanceId === undefined ? {} : { provenanceId }),
      metadata: { artifactFileKind: file.kind },
    });
  });
  const relationships: EvidenceRelationship[] = entries.map((entry) =>
    createEvidenceRelationship({
      fromEvidenceId: packageEntry.evidenceId,
      toEvidenceId: entry.evidenceId,
      type: "contains",
    }),
  );
  const entryByPath = new Map(
    bundle.files.map((file, index) => [file.path, entries[index]!]),
  );
  const addRelationship = (
    fromPath: string,
    toPath: string,
    type: EvidenceRelationshipType,
  ): void => {
    const from = entryByPath.get(fromPath);
    const to = entryByPath.get(toPath);
    if (from === undefined || to === undefined) return;
    relationships.push(
      createEvidenceRelationship({
        fromEvidenceId: from.evidenceId,
        toEvidenceId: to.evidenceId,
        type,
      }),
    );
  };
  const rootForPath = (path: string): string => {
    const reportMarker = path.indexOf("/reports/");
    if (reportMarker >= 0) return path.slice(0, reportMarker);
    if (path.startsWith("reports/")) return "";
    const separator = path.lastIndexOf("/");
    return separator < 0 ? "" : path.slice(0, separator);
  };

  const scenarioPaths = bundle.files
    .filter(({ kind }) => kind === "scenario" || kind === "fleet-scenario")
    .map(({ path }) => path);
  const replayFiles = bundle.files.filter(
    ({ kind }) => kind === "replay-log" || kind === "fleet-replay-log",
  );
  for (const scenarioPath of scenarioPaths) {
    for (const replay of replayFiles) {
      addRelationship(scenarioPath, replay.path, "produced");
    }
  }
  for (const replay of replayFiles) {
    const replayRoot = rootForPath(replay.path);
    for (const dependent of bundle.files) {
      if (
        rootForPath(dependent.path) === replayRoot &&
        (dependent.kind === "validation" || dependent.kind === "report")
      ) {
        addRelationship(
          replay.path,
          dependent.path,
          dependent.kind === "validation" ? "validated-by" : "reported-by",
        );
      }
    }
  }

  const fleetReplay = bundle.files.find(
    ({ kind }) => kind === "fleet-replay-log",
  );
  const fleetTimeline = bundle.files.find(
    ({ kind }) => kind === "fleet-event-timeline",
  );
  if (fleetReplay !== undefined && fleetTimeline !== undefined) {
    addRelationship(fleetTimeline.path, fleetReplay.path, "derived-from");
    for (const file of bundle.files) {
      if (file.kind === "timeline-report" || file.kind === "timeline-summary") {
        addRelationship(fleetTimeline.path, file.path, "reported-by");
      }
    }
  }

  const manifestFile = bundle.files.find(
    ({ kind }) => kind === "evidence-manifest",
  );
  if (manifestFile !== undefined) {
    for (const file of bundle.files) {
      if (
        file.kind === "evidence-manifest-report" ||
        file.kind === "provenance-coverage-report"
      ) {
        addRelationship(manifestFile.path, file.path, "reported-by");
      }
    }
  }
  return createEvidenceManifest({
    experimentId: bundle.experimentId,
    createdAt: bundle.createdAt,
    evidence: [packageEntry, ...entries],
    relationships,
    metadata: {
      artifactBundleVersion: bundle.version,
      artifactKind: bundle.kind,
    },
  });
};

export const buildScenarioEvidenceManifest = (
  bundle: ExperimentArtifactBundle,
  contents: ArtifactFileContents = {},
): EvidenceManifest => {
  if (bundle.kind !== "scenario") {
    throw new TypeError("scenario evidence manifest requires a scenario bundle");
  }
  return buildEvidenceManifestFromArtifactBundle(bundle, contents);
};

export const buildFleetEvidenceManifest = (
  bundle: ExperimentArtifactBundle,
  contents: ArtifactFileContents = {},
): EvidenceManifest => {
  if (bundle.kind !== "fleet") {
    throw new TypeError("fleet evidence manifest requires a fleet bundle");
  }
  return buildEvidenceManifestFromArtifactBundle(bundle, contents);
};

export const serializeEvidenceManifest = (
  manifest: EvidenceManifest,
  pretty = false,
): string =>
  JSON.stringify(manifest, undefined, pretty ? 2 : undefined);

export const deserializeEvidenceManifest = (json: string): EvidenceManifest => {
  const value = JSON.parse(json) as EvidenceManifest;
  return createEvidenceManifest({
    version: value.version,
    manifestId: value.manifestId,
    experimentId: value.experimentId,
    createdAt: value.createdAt,
    evidence: value.evidence,
    relationships: value.relationships,
    ...(value.metadata === undefined ? {} : { metadata: value.metadata }),
  });
};
