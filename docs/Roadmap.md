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

## v0.6 — Hardware adapter interface (completed)

Added synchronous hardware adapter contracts, deterministic virtual battery,
motor, IMU, and system adapters, structured adapter validation, and
adapter-backed telemetry collection using the existing snapshot contract.

## v0.7 — Multi-robot scenario support (completed)

Added fleet scenario profiles, four built-in fleet scenarios, structured fleet
validation, sorted synchronous fleet execution, per-robot results, fleet replay
wrappers, aggregate summaries, deterministic console reports, and an end-to-end
example.

## v0.8 — Persistence and export layer

Add explicit adapters for storing and exporting replay logs and reports without
coupling the core SDK to a database or file-system policy.

## v0.9 — Adapter event streams

Add explicit, deterministic event production around adapter-backed telemetry
while keeping scheduling, transport, and real hardware polling out of the core.

## v1.0 — Robotics telemetry SDK

Stabilize the public API for simulation, event processing, replay, scenarios,
console reporting, persistence adapters, adapter event streams, and
hardware-backed telemetry.
