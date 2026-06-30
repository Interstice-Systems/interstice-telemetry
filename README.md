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

## Current limitations

Version 0.2 models one robot per simulator, uses deliberately simple physics,
and requires callers to step streams manually. It does not provide replay,
scenario profiles, networking, ROS integration, persistence, background
streaming, a web UI, or hardware adapters.

## Future direction

The project will grow toward log replay, reusable scenarios, operator tooling,
and hardware adapter interfaces while keeping its simulation core deterministic
and transport-independent. See [the roadmap](docs/Roadmap.md).

Architecture details are in [docs/Architecture.md](docs/Architecture.md).
