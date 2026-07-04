export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | {
    readonly [key: string]: JsonValue;
};
/**
 * Copies a value into canonical key order and recursively freezes it.
 *
 * Rejecting non-JSON data at construction prevents values such as `NaN`,
 * `undefined`, class instances, and cycles from becoming unstable evidence.
 */
export declare const toImmutableJson: <T>(value: T, name?: string) => T;
export declare const deterministicStringify: (value: unknown, pretty?: boolean) => string;
export declare const deterministicEqual: (left: unknown, right: unknown) => boolean;
export declare const parseImmutableJson: <T>(json: string, name?: string) => T;
