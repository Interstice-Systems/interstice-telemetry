# Refactor Recommendations

These recommendations are limited to refactors that protect a v1 contract.
They are not authorization to implement changes during this review.

## Must do before v1.0

### Establish an authoritative event model

- Recommendation: Move the event-type vocabulary below both simulator and
  adapter streams, and decide whether public events become a discriminated
  union.
- Rationale: Core events currently depend on hardware event constants, while
  payload typing remains `unknown`.
- Expected benefit: Clear dependency direction and safer consumer event
  handling.
- Risk: A discriminated union can expose incompatible assumptions in consumer
  code; moving constants alone is low risk.
- Suggested implementation approach: First add compile-time API fixtures for
  all event types. Move shared constants without renaming. Evaluate the typed
  union as a separately reviewed public API change.
- Estimated complexity: medium

### Harden serialized boundaries

- Recommendation: Make every replay, fleet replay, timeline, and artifact load
  path enforce supported versions and canonical invariants.
- Rationale: Current deserializers cast and validators accept arbitrary
  non-empty versions.
- Expected benefit: Serialized evidence has a defensible compatibility
  contract.
- Risk: Previously accepted malformed data will be rejected.
- Suggested implementation approach: Write format specifications and negative
  fixtures first; add validated parse functions or make existing
  deserializers validate with clear errors; document migration behavior.
- Estimated complexity: medium

### Isolate event ownership

- Recommendation: Prevent subscriber/caller mutation from changing recorded or
  replayed evidence.
- Rationale: Shared references make output depend on handler order.
- Expected benefit: Determinism and replay immutability claims become true at
  API boundaries.
- Risk: Cloning has runtime cost and may change object identity expectations.
- Suggested implementation approach: Benchmark representative events, define
  ownership explicitly, clone at the smallest sufficient boundaries, and add
  adversarial subscriber tests. Avoid deep-freezing user objects unless the
  behavior is documented.
- Estimated complexity: medium

### Make runner cleanup exception-safe

- Recommendation: Ensure streams, recorders, and subscriptions are finalized
  through `try/finally`.
- Rationale: A synchronous handler error can interrupt cleanup.
- Expected benefit: Predictable lifecycle even when observers fail.
- Risk: Error precedence can change if cleanup also throws.
- Suggested implementation approach: Preserve fail-fast handler behavior
  initially, add cleanup tests, and specify which original error is rethrown.
- Estimated complexity: small

## Should do before v1.0

### Normalize clock integration semantics

- Recommendation: Retain the four public clock roles but document and enforce
  who advances each clock, whether clocks are reusable, and whether zero steps
  count.
- Rationale: Current behavior is internally consistent but not intuitive
  across stream, fleet, and replay contexts.
- Expected benefit: Fewer timestamp mismatches without collapsing useful
  domain concepts.
- Risk: Tightened validation may reject previously accepted zero-step calls.
- Suggested implementation approach: Add a clock integration matrix and
  conformance tests before changing implementation.
- Estimated complexity: small

### Add internal validator conventions

- Recommendation: Share private record/string/date/version guards and standard
  validation conventions.
- Rationale: Domains currently differ in whitespace, punctuation, warning, and
  nested-malformation handling.
- Expected benefit: Predictable results and less duplicated edge-case logic.
- Risk: Broad mechanical edits can accidentally alter messages consumed in
  tests.
- Suggested implementation approach: Define conventions, migrate one
  serialized boundary at a time, and treat public error text stability
  explicitly.
- Estimated complexity: medium

### Separate stable workflow exports from advanced utilities

- Recommendation: Reduce or classify the root surface before it freezes.
- Rationale: Low-level formatters, path helpers, raw built-ins, and bundle
  assembly currently look as stable as primary workflows.
- Expected benefit: Smaller compatibility burden and clearer discovery.
- Risk: Removing or moving exports is breaking for current prerelease users.
- Suggested implementation approach: Inventory actual usage, publish a
  migration table, and make any removals in the final prerelease—not after
  v1.
- Estimated complexity: small

### Add packaged API conformance fixtures

- Recommendation: Test declarations and runtime imports from the packed
  tarball rather than only `src/index.ts`.
- Rationale: Source tests do not prove the package manifest and emitted output
  work for consumers.
- Expected benefit: Release failures are detected before publication.
- Risk: Minimal; adds CI time and fixtures.
- Suggested implementation approach: Build, `npm pack`, install the tarball in
  a temporary ESM consumer, compile representative imports, and run one short
  workflow.
- Estimated complexity: small

## Can wait until after v1.0

### Deduplicate scenario and fleet robot runtimes

- Recommendation: Extract common runtime construction/fault scheduling only
  when maintenance evidence justifies it.
- Rationale: Duplicate orchestration can drift, but it is currently small,
  readable, and tested.
- Expected benefit: One place for lifecycle and scheduling fixes.
- Risk: A premature abstraction could obscure fleet-specific clock order and
  metadata.
- Suggested implementation approach: Add parity tests now; extract a private
  helper during the first change that must touch both paths.
- Estimated complexity: medium

### Make artifact replacement atomic

- Recommendation: Use temporary-directory write/validate/rename semantics.
- Rationale: Overwrite can leave incomplete output after interruption.
- Expected benefit: Safer persistence for CI and long-lived evidence.
- Risk: Cross-platform rename and cleanup semantics need care.
- Suggested implementation approach: Introduce it in a documented artifact
  writer revision with failure-injection tests.
- Estimated complexity: medium

### Consider package subpaths

- Recommendation: Consider pure-core and Node-persistence entry points only if
  user demand requires browser/bundler portability.
- Rationale: The current root is intentionally Node-oriented.
- Expected benefit: Smaller consumer graphs and clearer platform boundaries.
- Risk: Multiple public surfaces increase release and documentation burden.
- Suggested implementation approach: Gather usage data first.
- Estimated complexity: medium

### Consolidate duplicate clock implementation

- Recommendation: Share a private base or state helper for simulation and
  fleet clocks without merging their public types.
- Rationale: Their implementation is nearly identical but their domain roles
  are useful.
- Expected benefit: Minor reduction in maintenance.
- Risk: Low value relative to churn.
- Suggested implementation approach: Do it only alongside a clock behavior
  change.
- Estimated complexity: small

## Avoid or refuse for now

### Do not introduce asynchronous scheduling into the core

- Recommendation: Keep timers, polling, queues, and real-time pacing outside
  the deterministic core.
- Rationale: Caller-controlled stepping is the main architectural advantage.
- Expected benefit: Preserves testability and transport independence.
- Risk: None; async integrations can wrap the SDK later.
- Suggested implementation approach: Define adapters at integration edges.
- Estimated complexity: small

### Do not replace plain data with a generic entity framework

- Recommendation: Keep explicit snapshot, replay, fleet, timeline, and
  artifact models.
- Rationale: A generalized event-sourcing or robotics-domain framework would
  add abstraction without current need.
- Expected benefit: Conceptual clarity and easy serialization.
- Risk: None.
- Suggested implementation approach: Refuse until multiple concrete use cases
  prove a shared abstraction.
- Estimated complexity: large

### Do not unify all time into one mandatory clock

- Recommendation: Preserve simulator time, per-robot event sequence, fleet
  sequence, and replay navigation as distinct concepts.
- Rationale: They represent different evidence dimensions.
- Expected benefit: Avoids breaking working determinism to achieve superficial
  uniformity.
- Risk: None.
- Suggested implementation approach: Improve documentation and adapters
  between concepts instead.
- Estimated complexity: large

### Do not add diagnostics, cloud storage, UI, ROS, or real hardware to qualify v1

- Recommendation: Define v1 around the current coherent SDK and its hardened
  contracts.
- Rationale: New features expand risk without resolving release readiness.
- Expected benefit: A smaller, credible release.
- Risk: Product scope may need adjustment if validated users require one of
  these capabilities.
- Suggested implementation approach: Use post-v1 discovery and separate
  integration packages.
- Estimated complexity: large

## Refactor sequencing

1. Freeze proposed public contracts and format specifications.
2. Add compatibility and adversarial tests.
3. Change event taxonomy/ownership and serialized boundaries.
4. Make runner cleanup exception-safe.
5. Run full and packaged-consumer verification.
6. Defer structural deduplication unless the hardening work demonstrates an
   immediate need.
