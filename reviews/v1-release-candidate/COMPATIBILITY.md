# Compatibility Review

Fixtures cover replay logs, fleet timelines, robot state, twin timelines,
provenance, evidence manifests, and artifact indexes. Each loads, validates,
round-trips, and produces stable serialization.

Packed validation installs the generated tarball in a temporary consumer,
imports both package entry points, compiles a TypeScript consumer, checks
schemas and fixtures, and recursively rejects Node built-ins reachable from
the browser entry.

Residual risk: fixtures are representative rather than exhaustive, exact
declaration comparison does not test runtime semantics, and the packed install
still depends on npm resolving declared dependencies.
