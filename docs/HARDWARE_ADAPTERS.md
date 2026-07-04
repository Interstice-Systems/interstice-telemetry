# Hardware Adapters

Hardware adapters are synchronous contracts that let telemetry consumers use a
common `TelemetrySnapshot` without depending on a simulator.

No real hardware drivers are included.

## Contract

```ts
interface HardwareAdapter<TReading> {
  getInfo(): HardwareAdapterInfo;
  read(): TReading;
}

interface SteppableHardwareAdapter<TReading>
  extends HardwareAdapter<TReading> {
  step(deltaMs: number): void;
}
```

Adapter status is `ready`, `degraded`, `faulted`, or `offline`.

Reading domains:

- battery: percentage and volts,
- motor: left/right RPM and Celsius temperatures,
- IMU: acceleration and gyro vectors,
- system: CPU/memory percentages and signal strength in dBm.

IMU coordinate frame and physical calibration are adapter responsibilities and
must be documented by the implementation.

## Collect telemetry

```ts
const collector = new AdapterTelemetryCollector({
  robotId: "rover-1",
  battery: new VirtualBatteryAdapter(),
  motor: new VirtualMotorAdapter(),
  imu: new VirtualImuAdapter(),
  system: new VirtualSystemAdapter(),
  initialState: "active",
});

const snapshot = collector.collect("2026-01-01T00:00:00.000Z");
```

A faulted reading makes the snapshot state `faulted`. If every adapter is
offline, the snapshot state is `offline`. Otherwise the configured state is
retained.

## Adapter event stream

`AdapterTelemetryStream` explicitly steps steppable adapters, observes
transitions, and emits an adapter-backed snapshot.

Within one step:

1. adapters step in battery, motor, IMU, system order,
2. time advances,
3. status and optional reading changes emit in domain order,
4. the snapshot emits last.

Reading change events are opt-in. Status is excluded from reading comparison
because status has its own event.

The adapter stream is experimental before v1. Event strings and manual
stepping are expected to remain, while payload typing may be refined.

The stream does not currently emit application commands/custom events or
expose runtime changes to the collector's configured operating mode. These are
post-v1 design candidates, not implicit adapter behavior.

To preserve provenance, seed the replay recorder at the stream boundary:

```ts
const recorder = new ReplayRecorder({
  provenance: adapterOrigin,
  createdAt: 0,
});
const unsubscribe = stream.subscribe(recorder.record);
```

Adapter status, reading-change, and snapshot events from one step share the
step timestamp and remain ordered by sequence. See
[Telemetry Bridge](TelemetryBridge.md) before integrating motion from these
events.

## Implementing an adapter

- Return plain structured data and defensive copies.
- Keep `getInfo()` identity stable.
- Use the documented units and valid finite values.
- Make `read()` synchronous.
- Keep `step()` deterministic for equal state and deltas.
- Do not hide timers or background polling behind the core interface.
- Document calibration, coordinate frames, freshness, and error mapping.
- Pass `validateHardwareAdapter` before integration.

A real asynchronous driver should own its I/O outside this SDK and expose a
current deterministic reading through a small adapter boundary.

## Virtual adapters

The four virtual adapters are deterministic in-memory test doubles. They allow
status and reading changes; the battery adapter can also evolve through
explicit per-second rates.

They model the software boundary, not device accuracy or connectivity.
