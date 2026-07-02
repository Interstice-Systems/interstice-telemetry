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

## v0.8 — Experiment artifacts and persistence (completed)

Added versioned experiment bundle models, safe local-directory persistence,
index-aware loading and discovery, structured validation, scenario and fleet
exporters, compact telemetry summaries, deterministic reports, and an
end-to-end read-back example.

## v0.9 — Adapter event streams (completed)

Added explicit adapter stream lifecycle, deterministic adapter-backed snapshot
events, status and opt-in reading transition detection, replay validation and
playback compatibility, report rendering, artifact-compatible replay logs, and
an end-to-end example while keeping scheduling, transport, and real hardware
polling out of the core.

## v0.10 — Deterministic clock system (completed)

Added simulation, logical, replay, and fleet clocks; structured clock
validation; optional stream, runner, replay, and experiment metadata
integration; and a manually stepped end-to-end example.

## v0.11 — Global fleet event timeline (completed)

Added a derived global fleet event model, deterministic cross-robot ordering,
fleet sequence assignment, structured validation, pure query and summary
helpers, fixed-layout reports, timeline artifact export, and an end-to-end
example while preserving each robot's existing replay sequence.

## v0.12 — Anomaly and diagnostics reports

Add deterministic anomaly summaries and diagnostic reports over telemetry,
events, replay logs, and experiment artifacts.

## v1.0 — Robotics telemetry SDK

Stabilize the public API for simulation, event processing, replay, scenarios,
console reporting, experiment artifacts, adapter event streams, global fleet
timelines, diagnostics, and hardware-backed telemetry.
