import { describe, expect, it } from "vitest";

import { VirtualMotorAdapter } from "../src/index.js";

describe("VirtualMotorAdapter", () => {
  it("returns configured RPM and temperature values", () => {
    const adapter = new VirtualMotorAdapter({
      leftRpm: 120,
      rightRpm: 118,
      leftTemperatureC: 41.5,
      rightTemperatureC: 42,
    });

    expect(adapter.read()).toEqual({
      leftRpm: 120,
      rightRpm: 118,
      leftTemperatureC: 41.5,
      rightTemperatureC: 42,
      status: "ready",
    });
  });

  it("supports explicit reading and status updates", () => {
    const adapter = new VirtualMotorAdapter();

    adapter.setReading({ leftRpm: 75, rightRpm: 74 });
    adapter.setStatus("degraded");

    expect(adapter.read()).toMatchObject({
      leftRpm: 75,
      rightRpm: 74,
      status: "degraded",
    });
  });
});
