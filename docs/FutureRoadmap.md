# Digital Twin Roadmap

The v1.2 foundation deliberately stops at deterministic contracts, validation,
bridges, diagnostics, and derived state views. Future releases should extend
this foundation in layers and avoid making core models depend on a particular
simulator or robotics middleware.

## Recommended v1.3 scope

1. Generate schema compatibility reports and declaration-level API gates.
2. Add mapper conformance helpers for identity, timestamp, immutability, and
   repeatability checks.
3. Add bounded indexes for large timeline point-in-time queries without
   changing serialized timeline formats.
4. Make evidence provenance and unit/frame mapping policies explicit.
5. Expand compatibility fixtures to replay, fleet, timeline, and artifact
   formats that predate the digital-twin contracts.

## Simulation

A simulation runtime may consume robot structure, scene metadata, and an
initial state. Physics engines should remain replaceable ports and return new
states. Dynamics parameters, collision geometry, integrator choice, and
randomness policy require separate versioned contracts; they should not be
smuggled into structural fields.

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
before changing any existing field semantics.
