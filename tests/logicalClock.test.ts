import { describe, expect, it } from "vitest";

import {
  AdapterTelemetryStream,
  LogicalClock,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
} from "../src/index.js";

describe("LogicalClock", () => {
  it("ticks deterministically using the configured tick size", () => {
    const clock = new LogicalClock({ tickSizeMs: 5 });

    expect(clock.tick()).toBe(5);
    expect(clock.tick()).toBe(10);
    expect(clock.step(20)).toBe(30);
    expect(clock.getInfo()).toMatchObject({
      kind: "logical",
      currentTimeMs: 30,
      stepCount: 3,
      metadata: { tickSizeMs: 5 },
    });
  });

  it("resets logical time and ordering count", () => {
    const clock = new LogicalClock({ startTimeMs: 100 });
    clock.tick();
    clock.reset();

    expect(clock.now()).toBe(100);
    expect(clock.getInfo().stepCount).toBe(0);
  });

  it("can drive an adapter telemetry stream without changing defaults", () => {
    const clock = new LogicalClock({ startTimeMs: 1_000 });
    const stream = new AdapterTelemetryStream({
      robotId: "logical-rover",
      battery: new VirtualBatteryAdapter(),
      motor: new VirtualMotorAdapter(),
      imu: new VirtualImuAdapter(),
      system: new VirtualSystemAdapter(),
      clock,
    });

    stream.start();
    const snapshot = stream.step(250);

    expect(clock.now()).toBe(1_250);
    expect(snapshot?.timestamp).toBe("1970-01-01T00:00:01.250Z");
  });
});
