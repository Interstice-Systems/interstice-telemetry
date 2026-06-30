# Interstice Telemetry

Interstice Telemetry is a deterministic, software-first robotics telemetry
simulator. It generates believable sensor, actuator, resource, and operating
state snapshots without requiring a physical robot.

Developing against simulated telemetry lets robotics teams define interfaces,
exercise failure handling, and test downstream software before hardware is
available or safe to use. This foundation intentionally stays independent of
robot middleware and transport protocols.

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm test
npm run typecheck
npm run lint
npm run example
npm run example:stream
npm run example:replay
```

Create and step a simulator:

```ts
import { RobotSimulator } from "interstice-telemetry";

const robot = new RobotSimulator({
  robotId: "rover-1",
  seed: 42,
  initialState: "active",
});

console.log(robot.step(1_000));
robot.injectFault({ type: "low_battery" });
console.log(robot.step(1_000));
```

The same seed, starting time, state, and sequence of operations produce the
same snapshots. See `examples/basic-simulation.ts` for a runnable example.

## Deterministic event streams

Version 0.2 adds `TelemetryStream`, a manually stepped event layer around an
existing `RobotSimulator`. It preserves the simulator API while adding explicit
lifecycle and observable event delivery:

```ts
import { RobotSimulator, TelemetryStream } from "interstice-telemetry";

const simulator = new RobotSimulator({
  robotId: "rover-1",
  seed: 42,
  initialState: "active",
});
const stream = new TelemetryStream(simulator);

const unsubscribe = stream.subscribe((event) => {
  console.log(event.sequence, event.type, event.payload);
});

stream.start();
stream.step(1_000);
stream.injectFault({ type: "low_battery" });
stream.step(1_000);
stream.stop();
unsubscribe();
```

The event types are:

- `stream.started`
- `stream.stopped`
- `telemetry.snapshot`
- `fault.injected`
- `state.changed`

Streams use no timers or background loops. Events are produced only by explicit
lifecycle, fault, and `step` calls. The same simulator configuration and action
sequence produce the same event IDs, sequence numbers, timestamps, ordering,
and payloads. Run the complete stream example with:

```bash
npm run example:stream
```

## Deterministic replay logs

Version 0.3 adds file-system-independent replay logs. `ReplayRecorder` captures
events from a stream without changing their IDs, timestamps, sequence numbers,
or payloads. Logs can be validated, serialized to JSON, loaded, and played back
synchronously with `ReplayPlayer`.

Replay logs let robotics teams reproduce a fault or state transition without
the original robot or simulator run. This makes debugging, regression tests,
and sharing a precise event history practical even when hardware is unavailable
or a failure is difficult to reproduce.

```ts
import {
  deserializeReplayLog,
  ReplayPlayer,
  ReplayRecorder,
  RobotSimulator,
  serializeReplayLog,
  TelemetryStream,
  validateReplayLog,
} from "interstice-telemetry";

const simulator = new RobotSimulator({ robotId: "rover-1", seed: 42 });
const stream = new TelemetryStream(simulator);
const recorder = new ReplayRecorder({ robotId: simulator.robotId, seed: 42 });
const unsubscribe = stream.subscribe(recorder.record);

recorder.start();
stream.start();
stream.step(1_000);
stream.injectFault({ type: "low_battery" });
stream.step(1_000);
stream.stop();
recorder.stop();
unsubscribe();

const log = recorder.toLog({ scenario: "low-battery-debug" });
const validation = validateReplayLog(log);
if (!validation.valid) {
  throw new Error(validation.errors.join("\n"));
}

const loadedLog = deserializeReplayLog(serializeReplayLog(log));
const player = new ReplayPlayer(loadedLog);
player.subscribe((event) => console.log(event.sequence, event.type));
player.start();
player.playAll();
```

Recording and playback use no timers or background work. `step()` emits one
remaining event only while the player is running, and `playAll()` synchronously
emits all remaining events. Run the complete example with:

```bash
npm run example:replay
```

## Current limitations

Version 0.3 models one robot per simulator and replay log, uses deliberately
simple physics, and requires callers to step streams and players manually. It
does not provide disk persistence, scenario profiles, networking, ROS
integration, background streaming, a web UI, or hardware adapters.

## Future direction

The project will grow toward reusable scenarios, operator tooling, and hardware
adapter interfaces while keeping its simulation and replay core deterministic
and transport-independent. See [the roadmap](docs/Roadmap.md).

Architecture details are in [docs/Architecture.md](docs/Architecture.md).
