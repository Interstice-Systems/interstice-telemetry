# Digital Twin Roadmap

The v1.1 foundation deliberately stops at deterministic contracts. Future
releases should extend this foundation in layers and avoid making core models
depend on a particular simulator or robotics middleware.

## Recommended v1.2 scope

1. Add explicit validators that return diagnostics without throwing and
   publish JSON Schema documents for every v1.1 top-level artifact.
2. Add opt-in bridges from existing `TelemetrySnapshot` and adapter readings
   to `RobotState`, with versioned unit and field-mapping policies.
3. Define multi-robot twin timelines as derived views over independent robot
   timelines, reusing the existing fleet total-order rules.
4. Add compatibility fixtures and schema migration tests for all published
   digital-twin artifact versions.
5. Add package subpath exports so browser-safe domain contracts can be used
   without importing Node-only artifact persistence.

## Simulation

A simulation runtime may consume robot structure, scene metadata, and an
initial state. Physics engines should remain replaceable ports and return new
states. Dynamics parameters, collision geometry, integrator choice, and
randomness policy require separate versioned contracts; they should not be
smuggled into v1.1 structural fields.

## Robotics integrations

ROS, Gazebo, NVIDIA Isaac, Unity, and Unreal adapters should live in separate
packages. Each adapter must document frame conventions, units, timestamp
mapping, identifier mapping, backpressure, and loss behavior. Hardware and
network access remain outside the core package.

## Visualization

Initial visualization can be read-only timeline inspection: pose paths,
sensor overlays, health changes, and replay-event markers. Rendering should
consume immutable snapshots and never become authoritative state. Fleet
visualization should derive a global view while retaining each robot's clock
and provenance.

## Long-term constraints

Schema versions, deterministic ordering, immutable ownership boundaries, and
transport independence are architectural invariants. New capabilities should
arrive as adapters, derived artifacts, or independently versioned contracts
before changing any v1.1 field semantics.
