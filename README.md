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
npm run example:scenario
npm run example:console
npm run example:hardware
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

## Reusable scenario profiles

Version 0.4 adds deterministic scenario profiles: reusable descriptions of a
robot's identity, starting state, seed, duration, step interval, and scheduled
faults. Profiles make patrols and failure cases consistent across development,
regression tests, and demonstrations. A scenario run uses the existing
simulator, event stream, and replay layers and returns its final snapshot,
events, validated replay log, and a compact summary.

The built-in profiles are:

- `basic-patrol`
- `battery-drain`
- `motor-overheat`
- `signal-loss`
- `sensor-noise`
- `stalled-motor`

Run a built-in scenario and use its replay log:

```ts
import {
  getBuiltInScenario,
  runScenario,
  ReplayPlayer,
} from "interstice-telemetry";

const scenario = getBuiltInScenario("motor-overheat");
if (!scenario) {
  throw new Error("Scenario not found");
}

const result = runScenario(scenario);
const player = new ReplayPlayer(result.replayLog);

console.log(result.summary);
console.log(result.replayValidation);
player.subscribe((event) => console.log(event.sequence, event.type));
player.start();
player.playAll();
```

Scenario execution is synchronous and manually stepped. Scheduled faults are
injected once when elapsed scenario time reaches or crosses their `atMs`
value. Run the complete scenario example with:

```bash
npm run example:scenario
```

## Terminal-first console reports

Version 0.5 adds a plain-text reporting layer for scenario runs, telemetry
snapshots, event timelines, faults, and replay logs. Terminal-first inspection
makes a complete deterministic run easy to read in local development, CI logs,
remote shells, and incident notes without requiring a browser or terminal UI
framework.

Renderers are pure functions: they return strings and never write to the
console. Applications decide where the output goes.

```ts
import {
  getBuiltInScenario,
  renderEventTimeline,
  renderScenarioReport,
  runScenario,
} from "interstice-telemetry";

const scenario = getBuiltInScenario("motor-overheat");
if (!scenario) {
  throw new Error("Scenario not found");
}

const result = runScenario(scenario);
console.log(renderScenarioReport(result));
console.log(renderEventTimeline(result.events, { limit: 5 }));
```

Run the complete mission-control-style example:

```bash
npm run example:console
```

Sample output:

```text
INTERSTICE TELEMETRY — SCENARIO REPORT
Scenario: Motor Overheat
Robot: thermal-rover
Duration: 10000 ms
Steps: 10
Events: 14
Faults: 1
Final State: faulted
Replay Valid: yes

FAULT SUMMARY
Total Fault Events: 1
- motor overheating at sequence #7, timestamp 5000
```

This is intentionally not a web UI. Version 0.5 keeps reports portable,
non-interactive, dependency-free, and straightforward to snapshot-test.

## Hardware adapter interfaces

Version 0.6 adds the software seam between telemetry consumers and future
hardware sources. A small synchronous `HardwareAdapter<TReading>` contract
exposes adapter identity, health status, and a current reading. Virtual battery,
motor, IMU, and system adapters make that boundary testable without devices,
drivers, middleware, or nondeterministic polling.

Adapter seams matter in robotics because hardware availability and protocols
vary across development machines and deployed robots. Consumers can depend on
the stable `TelemetrySnapshot` contract while a future adapter handles the
details of a Raspberry Pi, Jetson, ESP32, ROS node, motor controller, battery,
IMU, camera, or networked robot.

`AdapterTelemetryCollector` combines the four current reading domains into a
snapshot without requiring or replacing `RobotSimulator`:

```ts
import {
  AdapterTelemetryCollector,
  VirtualBatteryAdapter,
  VirtualImuAdapter,
  VirtualMotorAdapter,
  VirtualSystemAdapter,
} from "interstice-telemetry";

const battery = new VirtualBatteryAdapter({
  percentage: 85,
  voltage: 24.5,
});
const motor = new VirtualMotorAdapter({ leftRpm: 120, rightRpm: 118 });
const imu = new VirtualImuAdapter();
const system = new VirtualSystemAdapter({
  cpuUsage: 35,
  memoryUsage: 48,
  signalStrength: -61,
});

const collector = new AdapterTelemetryCollector({
  robotId: "rover-1",
  battery,
  motor,
  imu,
  system,
  initialState: "active",
});

const snapshot = collector.collect("2026-01-01T00:00:00.000Z");
console.log(snapshot);
```

Run validation, collection, fault inference, and console rendering end to end:

```bash
npm run example:hardware
```

**No real hardware is integrated in v0.6.** The adapters are contracts and
deterministic virtual implementations only. There is no GPIO, serial, ROS,
networking, timer, background loop, or asynchronous hardware polling.

## Current limitations

Version 0.6 models one robot per simulator, scenario, replay log, and adapter
collector, uses deliberately simple physics, and provides fixed-layout
plain-text reports. Hardware adapters are virtual and synchronous. The SDK
does not provide real device integration, disk persistence, networking, ROS,
background streaming, an interactive or web UI, environment physics, or
multi-robot scenarios.

## Future direction

The project will grow toward multi-robot scenarios, persistence/export, and
adapter event streams while keeping its simulation, replay, scenario,
reporting, and adapter core deterministic and transport-independent. See
[the roadmap](docs/Roadmap.md).

Architecture details are in [docs/Architecture.md](docs/Architecture.md).
