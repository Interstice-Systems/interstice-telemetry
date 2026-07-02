import { describe, expect, it } from "vitest";

import {
  SimulationClock,
  validateClock,
  type DeterministicClock,
} from "../src/index.js";

describe("validateClock", () => {
  it("passes a valid deterministic clock", () => {
    expect(validateClock(new SimulationClock())).toEqual({
      valid: true,
      errors: [],
      warnings: [],
    });
  });

  it("fails when the clock does not exist", () => {
    expect(validateClock(undefined)).toMatchObject({
      valid: false,
      errors: [expect.stringContaining("must exist")],
    });
  });

  it("fails invalid clock info", () => {
    const clock: DeterministicClock = {
      now: () => 10,
      step: () => 10,
      reset: () => undefined,
      getInfo: () => ({
        id: "",
        kind: "unknown" as "simulation",
        currentTimeMs: -1,
        stepCount: -1,
      }),
    };
    const result = validateClock(clock);

    expect(result.valid).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining("id"),
        expect.stringContaining("kind"),
        expect.stringContaining("currentTimeMs"),
        expect.stringContaining("stepCount"),
      ]),
    );
  });

  it("fails non-finite and negative current time", () => {
    const clock = {
      now: () => Number.NaN,
      step: () => 0,
      reset: () => undefined,
      getInfo: () => ({
        id: "bad-clock",
        kind: "simulation",
        currentTimeMs: Number.NaN,
        stepCount: 0,
      }),
    };

    expect(validateClock(clock).valid).toBe(false);
  });
});
