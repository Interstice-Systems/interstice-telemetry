import type { TelemetrySnapshot } from "../types.js";

export function snapshotToJson(
  snapshot: TelemetrySnapshot,
  pretty = false,
): string {
  return JSON.stringify(snapshot, null, pretty ? 2 : undefined);
}
