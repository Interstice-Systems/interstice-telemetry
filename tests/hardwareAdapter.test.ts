import { describe, expect, it } from "vitest";

import {
  type BatteryReading,
  type HardwareAdapter,
  HARDWARE_ADAPTER_STATUSES,
  VirtualBatteryAdapter,
} from "../src/index.js";

describe("HardwareAdapter", () => {
  it("exposes the base adapter info shape", () => {
    const adapter: HardwareAdapter<BatteryReading> =
      new VirtualBatteryAdapter({
        id: "battery-main",
        name: "Main Battery",
        status: "degraded",
        metadata: { bus: "virtual" },
      });

    expect(adapter.getInfo()).toEqual({
      id: "battery-main",
      kind: "battery",
      name: "Main Battery",
      status: "degraded",
      metadata: { bus: "virtual" },
    });
  });

  it("publishes the complete set of known statuses", () => {
    expect(HARDWARE_ADAPTER_STATUSES).toEqual([
      "ready",
      "degraded",
      "faulted",
      "offline",
    ]);
  });
});
