# Roadmap

## v0.2 — Event stream (completed)

Added deterministic, manually stepped telemetry event streams with explicit
lifecycle control, subscriptions, fault events, and robot state-change events.

## v0.3 — Replay logs (completed)

Added event recording, a versioned replay log model, structured validation,
JSON serialization and deserialization, and synchronous deterministic playback.

## v0.4 — Scenario profiles (completed)

Added reusable deterministic scenario profiles, built-in patrol and fault
situations, structured validation, synchronous scenario execution, and replay
log integration.

## v0.5 — Dashboard and console (completed)

Added deterministic plain-text reports for scenarios, telemetry snapshots,
event timelines, fault events, and replay logs, plus a terminal-first example.

## v0.6 — Hardware adapter interface

Define optional adapters that map real devices and robotics middleware onto the
same telemetry contract.

## v0.7 — Multi-robot scenario support

Coordinate multiple robot identities, event streams, and scenario timelines
while retaining deterministic ordering.

## v0.8 — Persistence and export layer

Add explicit adapters for storing and exporting replay logs and reports without
coupling the core SDK to a database or file-system policy.

## v1.0 — Robotics telemetry SDK

Stabilize the public API for simulation, event processing, replay, scenarios,
console reporting, persistence adapters, and hardware-backed telemetry.
