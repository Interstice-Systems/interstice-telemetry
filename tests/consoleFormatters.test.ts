import { describe, expect, it } from "vitest";

import {
  formatPercent,
  formatRobotState,
  formatTemperature,
  formatTimestampMs,
  formatVoltage,
} from "../src/index.js";

describe("console formatters", () => {
  it("formats percentages with at most one decimal place", () => {
    expect(formatPercent(86.24)).toBe("86.2%");
    expect(formatPercent(42)).toBe("42%");
  });

  it("formats voltage with at most one decimal place", () => {
    expect(formatVoltage(12.14)).toBe("12.1V");
  });

  it("formats temperature with at most one decimal place", () => {
    expect(formatTemperature(54.24)).toBe("54.2C");
  });

  it("formats millisecond timestamps", () => {
    expect(formatTimestampMs(60_000)).toBe("60000 ms");
  });

  it("formats robot states without changing their SDK value", () => {
    expect(formatRobotState("faulted")).toBe("faulted");
  });
});
