import { describe, expect, it } from "vitest";

import { VirtualBatteryAdapter } from "../src/index.js";

describe("VirtualBatteryAdapter", () => {
  it("returns configured percentage and voltage", () => {
    const adapter = new VirtualBatteryAdapter({
      percentage: 72.5,
      voltage: 23.8,
    });

    expect(adapter.read()).toEqual({
      percentage: 72.5,
      voltage: 23.8,
      status: "ready",
    });
  });

  it("updates status and returns defensive reading copies", () => {
    const adapter = new VirtualBatteryAdapter();
    const reading = adapter.read();

    reading.percentage = 1;
    adapter.setStatus("faulted");

    expect(adapter.read().percentage).toBe(100);
    expect(adapter.read().status).toBe("faulted");
    expect(adapter.getInfo().status).toBe("faulted");
  });

  it("steps by explicitly configured deterministic rates", () => {
    const adapter = new VirtualBatteryAdapter({
      percentage: 80,
      voltage: 24,
      percentageChangePerSecond: -0.5,
      voltageChangePerSecond: -0.1,
    });

    adapter.step(2_000);

    expect(adapter.read()).toEqual({
      percentage: 79,
      voltage: 23.8,
      status: "ready",
    });
    expect(() => adapter.step(0)).toThrow(RangeError);
  });
});
