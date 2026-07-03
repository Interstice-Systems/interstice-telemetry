# Scene Model

`Scene` is deterministic environment metadata. It gives state consumers a
shared coordinate convention and semantic context without prescribing a
renderer, collision system, map format, or physics representation.

A scene declares:

- an identifier, display name, open-ended type, and schema version;
- coordinate frame, handedness, length unit, and up axis;
- landmarks with poses;
- static obstacles with descriptive JSON shape data;
- positioned annotations;
- regions represented by ordered boundary points;
- semantic labels and extension metadata.

Element identifiers are unique across all scene element kinds. This allows
future visualization, QA, and annotation systems to reference an element
without also carrying a kind discriminator.

Obstacle shapes are descriptions only. A shape such as
`{ "type": "box", "size": [2, 1, 3] }` has no collision, occupancy, or
dynamics semantics in v1.1. A future adapter may interpret it only under an
explicit adapter/version agreement.

Use `createScene` at trust boundaries and `serializeScene` for canonical JSON.
`deserializeScene` validates and recursively freezes loaded data. Warehouse,
obstacle-course, and robotics-lab examples are under
`examples/digital-twin/scenes`.
