import { describe, expect, it } from "vitest";

import {
  validateHardwareAdapter,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
} from "../src/index.js";

describe("validateHardwareAdapter", () => {
  it("passes valid virtual adapters", () => {
    const adapters = [
      new VirtualBatteryAdapter(),
      new VirtualMotorAdapter(),
      new VirtualImuAdapter(),
      new VirtualSystemAdapter(),
    ];

    for (const adapter of adapters) {
      expect(validateHardwareAdapter(adapter)).toEqual({
        valid: true,
        errors: [],
        warnings: [],
      });
    }
  });

  it("fails when the adapter is missing", () => {
    expect(validateHardwareAdapter(undefined)).toEqual({
      valid: false,
      errors: ["adapter must be a non-null object"],
      warnings: [],
    });
  });

  it("reports missing and invalid adapter behavior", () => {
    const result = validateHardwareAdapter({
      getInfo: () => ({
        id: "",
        kind: "battery",
        name: "Broken Battery",
        status: "unknown",
      }),
      read: () => null,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "adapter info id must be a non-empty string",
    );
    expect(result.errors).toContain(
      "adapter info status must be a known hardware adapter status",
    );
    expect(result.errors).toContain("read() must return a non-null object");
  });

  it("converts thrown methods into structured errors", () => {
    const result = validateHardwareAdapter({
      getInfo: () => {
        throw new Error("failed");
      },
      read: () => {
        throw new Error("failed");
      },
    });

    expect(result.errors).toEqual([
      "getInfo() must not throw",
      "read() must not throw",
    ]);
  });
});
