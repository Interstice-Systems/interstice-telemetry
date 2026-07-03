export type JsonPrimitive = boolean | number | string | null;
export type JsonValue =
  | JsonPrimitive
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

const normalize = (
  value: unknown,
  path: string,
  ancestors: Set<object>,
): JsonValue => {
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
  let result: JsonValue;

  if (Array.isArray(value)) {
    result = value.map((item, index) =>
      normalize(item, `${path}[${index}]`, ancestors),
    );
  } else {
    const prototype = Object.getPrototypeOf(value) as object | null;
    if (prototype !== Object.prototype && prototype !== null) {
      ancestors.delete(value);
      throw new TypeError(`${path} must contain only plain objects`);
    }

    result = Object.fromEntries(
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
  }

  ancestors.delete(value);
  return result;
};

const freezeJson = (value: JsonValue): JsonValue => {
  if (typeof value === "object" && value !== null) {
    for (const child of Array.isArray(value) ? value : Object.values(value)) {
      freezeJson(child);
    }
    Object.freeze(value);
  }
  return value;
};

/**
 * Copies a value into canonical key order and recursively freezes it.
 *
 * Rejecting non-JSON data at construction prevents values such as `NaN`,
 * `undefined`, class instances, and cycles from becoming unstable evidence.
 */
export const toImmutableJson = <T>(value: T, name = "value"): T =>
  freezeJson(normalize(value, name, new Set())) as T;

export const deterministicStringify = (
  value: unknown,
  pretty = false,
): string =>
  JSON.stringify(
    normalize(value, "value", new Set()),
    null,
    pretty ? 2 : undefined,
  );

export const deterministicEqual = (left: unknown, right: unknown): boolean =>
  deterministicStringify(left) === deterministicStringify(right);

export const parseImmutableJson = <T>(json: string, name = "value"): T =>
  toImmutableJson(JSON.parse(json) as unknown, name) as T;
