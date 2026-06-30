import { describe, expect, it } from "vitest";

import {
  deserializeReplayLog,
  serializeReplayLog,
  type ReplayLog,
} from "../src/index.js";

const log: ReplayLog = {
  version: "0.3.0",
  robotId: "replay-rover",
  createdAt: "1970-01-01T00:00:00.000Z",
  seed: 42,
  eventCount: 1,
  events: [
    {
      id: "replay-rover:1",
      type: "stream.started",
      timestamp: 0,
      robotId: "replay-rover",
      sequence: 1,
      payload: { status: "running" },
    },
  ],
  metadata: { scenario: "test" },
};

describe("replay log serialization", () => {
  it("round trips without changing the replay log", () => {
    expect(deserializeReplayLog(serializeReplayLog(log))).toEqual(log);
  });

  it("rejects JSON values that are not objects", () => {
    expect(() => deserializeReplayLog("[]")).toThrow(TypeError);
  });
});
