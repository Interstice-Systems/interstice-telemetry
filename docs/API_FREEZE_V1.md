# Public API Freeze for v1

This document classifies every package-root and `digital-twin` subpath export.
Unless listed under Experimental or Internal, an exported symbol is Stable.

## Stable

Stable families are telemetry and event contracts, simulation and faults,
replay, scenario and fleet execution, clocks, hardware adapters, reports,
artifacts, canonical digital-twin models, robot state, scenes, replay events,
twin timelines and cursors, schemas and fixtures, telemetry bridges,
diagnostics, multi-robot views, provenance and ownership, evidence manifests,
lineage queries, provenance coverage, and custom experiment bundle creation,
validation, reporting, and export.

Stable exports retain source-compatible TypeScript signatures and compatible
serialized behavior throughout v1.x. Additive optional fields and new exports
may ship in a minor release. Removing or renaming an export, narrowing an
accepted input, or changing serialized meaning requires v2 unless correcting
a security or evidence-integrity defect.

## Experimental

- Adapter event-stream contracts: `ADAPTER_EVENT_TYPES`,
  `AdapterTelemetryStream`, its options/status, and adapter event types.
- Global fleet timeline contracts: timeline models, builders, queries,
  reports, serialization, validation, and version.
- Future platform interfaces for renderers, physics, simulation runtimes,
  middleware, engines, and fleet visualization.
- Application-defined metadata extension contents.

Experimental changes still require changelog and migration notes. Persisted
meaning cannot change without a serialized version change.

## Internal public compatibility exports

- `createSeededRandom`, `RandomSource`, and full built-in scenario maps.
- Low-level artifact bundle, metadata, path, and summary helpers.
- Low-level console formatters and `ConsoleReport`.
- Provenance canonicalization and deterministic-ID helpers.
- Direct evidence entry/relationship constructors and safe-path predicates.

These remain declaration-gated in v1. New consumers should prefer high-level
workflow functions. Removal still requires deprecation and normal versioning.

## Compatibility automation

`npm run api:check` builds declarations and compares every generated `.d.ts`
file with `compatibility/api-v1`. Exact declaration changes fail the gate.

For an intentional compatible update:

1. review generated declarations;
2. update documentation, tests, changelog, and version;
3. run `npm run api:update`;
4. commit the baseline diff with the implementation;
5. obtain explicit API review.

Do not update the baseline merely to make CI pass.

## Versioning

Patch releases preserve APIs and serialized behavior. Minor releases add
compatible capabilities. Breaking stable contracts require a major release
and migration plan. Emergency integrity fixes must document affected versions
and migration impact.
