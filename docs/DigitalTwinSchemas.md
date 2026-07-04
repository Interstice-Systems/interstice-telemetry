# Digital Twin Schemas

Version 1.2 publishes JSON Schema draft 2020-12 documents for `RobotState`,
`Scene`, and `TwinTimeline`. The documents are checked in under
`src/digitalTwin/schemas/` and exported as `robotStateSchema`,
`sceneModelSchema`, and `twinTimelineSchema`.

Use `validateRobotStateSchema`, `validateSceneModelSchema`, or
`validateTwinTimelineSchema` when accepting serialized data. Each returns a
boolean and deterministically ordered issues without exposing Ajv as the SDK
contract.

The `src/digitalTwin/fixtures/v1_1/` fixtures are stable serialized v1.1
examples. They verify that v1.2 readers continue to accept the previous
contract version. Package version and schema version are independent:
compatible SDK releases may continue to publish schema version `1.0.0`.
Changing required fields or meaning requires a new schema version and fixture
set; additive optional fields require explicit compatibility review.

Schemas validate structure and local constraints. Cross-record conditions,
such as timestamp ordering and robot identity, belong to twin diagnostics.
