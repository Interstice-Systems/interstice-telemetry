import { describe, expect, it } from "vitest";

import { VirtualImuAdapter } from "../src/index.js";

describe("VirtualImuAdapter", () => {
  it("returns configured acceleration and gyro readings", () => {
    const adapter = new VirtualImuAdapter({
      acceleration: { x: 0.1, y: -0.2, z: 9.8 },
      gyro: { x: 0.01, y: 0.02, z: -0.01 },
    });

    expect(adapter.read()).toEqual({
      acceleration: { x: 0.1, y: -0.2, z: 9.8 },
      gyro: { x: 0.01, y: 0.02, z: -0.01 },
      status: "ready",
    });
  });

  it("does not expose mutable internal vectors", () => {
    const adapter = new VirtualImuAdapter();
    const reading = adapter.read();

    reading.acceleration.z = 0;

    expect(adapter.read().acceleration.z).toBe(9.81);
  });
});
