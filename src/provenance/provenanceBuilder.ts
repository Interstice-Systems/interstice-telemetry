import {
  EVIDENCE_PROVENANCE_VERSION,
  PROVENANCE_CONFIDENCE_LEVELS,
  PROVENANCE_SOURCE_TYPES,
  type EvidenceOwnership,
  type EvidenceProvenance,
  type ProvenanceConfidence,
  type ProvenanceSourceType,
  type ProvenanceStep,
} from "./provenanceTypes.js";
import {
  createDeterministicProvenanceId,
  provenanceTimestampToIso,
  toImmutableProvenanceValue,
} from "./provenanceHelpers.js";
import {
  createEvidenceOwnership,
  DEFAULT_EVIDENCE_OWNERSHIP,
} from "./provenanceOwnership.js";

export interface CreateProvenanceInput {
  readonly provenanceId?: string;
  readonly sourceName: string;
  readonly robotId?: string;
  readonly timestamp: number;
  readonly createdAt?: string;
  readonly confidence?: ProvenanceConfidence;
  readonly ownership?: EvidenceOwnership;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CreateTypedProvenanceInput extends CreateProvenanceInput {
  readonly sourceType: ProvenanceSourceType;
  readonly transformationHistory?: readonly ProvenanceStep[];
}

export interface ProvenanceStepInput {
  readonly transformationId?: string;
  readonly name: string;
  readonly timestamp?: number;
  readonly inputProvenanceIds?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DeriveProvenanceOptions {
  readonly provenanceId?: string;
  readonly sourceName?: string;
  readonly robotId?: string;
  readonly confidence?: ProvenanceConfidence;
  readonly ownership?: EvidenceOwnership;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

const assertName = (value: string, label: string): void => {
  if (value.trim().length === 0) throw new TypeError(`${label} must not be empty`);
};

const createStep = (
  input: ProvenanceStepInput,
  provenance: EvidenceProvenance,
): ProvenanceStep => {
  assertName(input.name, "transformation name");
  const timestamp = input.timestamp ?? provenance.timestamp;
  provenanceTimestampToIso(timestamp);
  const inputProvenanceIds = input.inputProvenanceIds ?? [
    provenance.provenanceId,
  ];
  if (
    input.transformationId !== undefined &&
    input.transformationId.trim().length === 0
  ) {
    throw new TypeError("transformationId must not be empty");
  }
  if (
    inputProvenanceIds.some((reference) => reference.trim().length === 0) ||
    new Set(inputProvenanceIds).size !== inputProvenanceIds.length
  ) {
    throw new TypeError(
      "transformation input provenance ids must be non-empty and unique",
    );
  }
  const orderedInputProvenanceIds = [...inputProvenanceIds].sort();
  const identity = {
    name: input.name,
    timestamp,
    inputProvenanceIds: orderedInputProvenanceIds,
    ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
  };
  return toImmutableProvenanceValue({
    transformationId:
      input.transformationId ??
      createDeterministicProvenanceId("step", identity),
    ...identity,
  }, "transformation");
};

export const createProvenance = (
  input: CreateTypedProvenanceInput,
): EvidenceProvenance => {
  assertName(input.sourceName, "provenance sourceName");
  provenanceTimestampToIso(input.timestamp);
  if (
    !(PROVENANCE_SOURCE_TYPES as readonly string[]).includes(input.sourceType)
  ) {
    throw new TypeError(`unsupported provenance sourceType "${input.sourceType}"`);
  }
  if (
    input.confidence !== undefined &&
    !(PROVENANCE_CONFIDENCE_LEVELS as readonly string[]).includes(
      input.confidence,
    )
  ) {
    throw new TypeError(`unsupported provenance confidence "${input.confidence}"`);
  }
  if (input.robotId !== undefined && input.robotId.trim().length === 0) {
    throw new TypeError("provenance robotId must not be empty");
  }
  if (
    input.provenanceId !== undefined &&
    input.provenanceId.trim().length === 0
  ) {
    throw new TypeError("provenanceId must not be empty");
  }
  if (
    input.createdAt !== undefined &&
    !Number.isFinite(Date.parse(input.createdAt))
  ) {
    throw new TypeError("provenance createdAt must be a valid date string");
  }
  const ownership = createEvidenceOwnership(
    input.ownership ?? DEFAULT_EVIDENCE_OWNERSHIP,
  );
  const body = {
    version: EVIDENCE_PROVENANCE_VERSION,
    sourceType: input.sourceType,
    sourceName: input.sourceName,
    ...(input.robotId === undefined ? {} : { robotId: input.robotId }),
    timestamp: input.timestamp,
    createdAt: input.createdAt ?? provenanceTimestampToIso(input.timestamp),
    confidence: input.confidence ?? "exact",
    transformationHistory: input.transformationHistory ?? [],
    ownership,
    ...(input.metadata === undefined ? {} : { metadata: input.metadata }),
  };
  return toImmutableProvenanceValue({
    ...body,
    provenanceId:
      input.provenanceId ?? createDeterministicProvenanceId("prov", body),
  });
};

const typedBuilder =
  (sourceType: ProvenanceSourceType) =>
  (input: CreateProvenanceInput): EvidenceProvenance =>
    createProvenance({ ...input, sourceType });

export const createSimulationProvenance = typedBuilder("simulation");
export const createTelemetryProvenance = typedBuilder("telemetry");
export const createReplayProvenance = typedBuilder("replay");
export const createAdapterProvenance = typedBuilder("adapter");
export const createImporterProvenance = typedBuilder("importer");
export const createManualProvenance = typedBuilder("manual");
export const createDerivedProvenance = typedBuilder("derived");

export const appendTransformation = (
  provenance: EvidenceProvenance,
  transformation: ProvenanceStepInput,
): EvidenceProvenance => {
  const step = createStep(transformation, provenance);
  const previousStep = provenance.transformationHistory.at(-1);
  if (
    step.timestamp <
    Math.max(provenance.timestamp, previousStep?.timestamp ?? 0)
  ) {
    throw new TypeError("transformation timestamp must not move backward");
  }
  if (
    provenance.transformationHistory.some(
      ({ transformationId }) =>
        transformationId === step.transformationId,
    )
  ) {
    throw new TypeError(
      `duplicate transformationId "${step.transformationId}"`,
    );
  }
  const body = {
    ...provenance,
    timestamp: step.timestamp,
    createdAt: provenanceTimestampToIso(step.timestamp),
    transformationHistory: [...provenance.transformationHistory, step],
  };
  const { provenanceId: previousId, ...identity } = body;
  void previousId;
  return toImmutableProvenanceValue({
    ...body,
    provenanceId: createDeterministicProvenanceId("prov", identity),
  });
};

export const deriveProvenance = (
  provenance: EvidenceProvenance,
  transformation: ProvenanceStepInput,
  options: DeriveProvenanceOptions = {},
): EvidenceProvenance => {
  const appended = appendTransformation(provenance, transformation);
  return createProvenance({
    sourceType: appended.sourceType,
    sourceName: options.sourceName ?? appended.sourceName,
    ...((options.robotId ?? appended.robotId) === undefined
      ? {}
      : { robotId: options.robotId ?? appended.robotId }),
    timestamp: appended.timestamp,
    createdAt: appended.createdAt,
    confidence: options.confidence ?? "derived",
    transformationHistory: appended.transformationHistory,
    ownership: options.ownership ?? appended.ownership,
    ...((options.metadata ?? appended.metadata) === undefined
      ? {}
      : { metadata: options.metadata ?? appended.metadata }),
    ...(options.provenanceId === undefined
      ? {}
      : { provenanceId: options.provenanceId }),
  });
};
