# Multi-Robot Twin View

`MultiRobotTwinView` is a derived state container over independent
`TwinTimeline` values. It is not a visualization or fleet simulator.

`createMultiRobotTwinView` stores one timeline per robot in lexical robot-ID
order and calculates record and timestamp bounds. Its default creation time is
the Unix epoch so equivalent inputs remain deterministic; applications should
provide a recorded `createdAt` when provenance matters.

`getTwinStatesAtTime` returns each available robot state at or immediately
before a requested timestamp. Robots without a prior state are omitted.
`getRobotTwinTimeline` retrieves an individual history,
`summarizeMultiRobotTwinView` recomputes summary values, and
`validateMultiRobotTwinView` checks ordering, identity, completeness, and
summary consistency.

This contract is the state layer a future renderer can consume. It adds no
rendering, collision, physics, networking, or race semantics.
