const normalize = (
  value: unknown,
  path: string,
  ancestors: Set<object>,
): unknown => {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError(`${path} must contain only finite numbers`);
    }
    return Object.is(value, -0) ? 0 : value;
  }
  if (typeof value !== "object") {
    throw new TypeError(`${path} must contain only JSON values`);
  }
  if (ancestors.has(value)) {
    throw new TypeError(`${path} must not contain circular references`);
  }

  ancestors.add(value);
  if (!Array.isArray(value)) {
    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) {
      ancestors.delete(value);
      throw new TypeError(`${path} must contain only plain objects`);
    }
  }
  const result = Array.isArray(value)
    ? value.map((item, index) =>
        normalize(item, `${path}[${index}]`, ancestors),
      )
    : Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [
            key,
            normalize(
              (value as Record<string, unknown>)[key],
              `${path}.${key}`,
              ancestors,
            ),
          ]),
      );
  ancestors.delete(value);
  return result;
};

const freeze = (value: unknown): void => {
  if (typeof value !== "object" || value === null) return;
  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    freeze(child);
  }
  Object.freeze(value);
};

export const toImmutableProvenanceValue = <T>(
  value: T,
  name = "provenance",
): T => {
  const normalized = normalize(value, name, new Set()) as T;
  freeze(normalized);
  return normalized;
};

export const deterministicProvenanceStringify = (value: unknown): string =>
  JSON.stringify(normalize(value, "provenance", new Set()));

/** Small deterministic identifier hash. This is not a cryptographic digest. */
export const createDeterministicProvenanceId = (
  prefix: "prov" | "step",
  value: unknown,
): string => {
  const text = deterministicProvenanceStringify(value);
  let hash = 0xcbf29ce484222325n;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return `${prefix}-${hash.toString(16).padStart(16, "0")}`;
};

export const provenanceTimestampToIso = (timestamp: number): string => {
  if (!Number.isSafeInteger(timestamp) || timestamp < 0) {
    throw new TypeError("provenance timestamp must be a non-negative safe integer");
  }
  return new Date(timestamp).toISOString();
};
