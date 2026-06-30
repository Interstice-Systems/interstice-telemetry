import { describe, expect, it } from "vitest";

import { VirtualSystemAdapter } from "../src/index.js";

describe("VirtualSystemAdapter", () => {
  it("returns configured CPU, memory, and signal readings", () => {
    const adapter = new VirtualSystemAdapter({
      cpuUsage: 37,
      memoryUsage: 62,
      signalStrength: -68,
    });

    expect(adapter.read()).toEqual({
      cpuUsage: 37,
      memoryUsage: 62,
      signalStrength: -68,
      status: "ready",
    });
  });

  it("keeps readings stable until explicitly updated", () => {
    const adapter = new VirtualSystemAdapter({ cpuUsage: 10 });

    expect(adapter.read()).toEqual(adapter.read());
    adapter.setReading({ cpuUsage: 20 });
    expect(adapter.read().cpuUsage).toBe(20);
  });
});
