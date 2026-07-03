# Contributing

Contributions should preserve Interstice Telemetry's deterministic,
synchronous, transport-independent core.

## Development setup

Requirements:

- Node.js 20 or newer.
- npm with lockfile support.

```bash
npm ci
npm run check
```

Run a specific test file with:

```bash
npx vitest run tests/replayPlayer.test.ts
```

Run examples through the scripts listed in `docs/EXAMPLES.md`.

## Change scope

Before opening a change:

- Keep fixes and stabilization work focused.
- Do not introduce wall-time reads, global randomness, timers, background
  loops, networking, or transport policy into the core.
- Put hardware, ROS, cloud, and scheduling integrations outside the core SDK.
- Avoid public API changes unless the issue and migration path are explicit.
- Treat replay logs, fleet replay logs, timelines, and artifacts as versioned
  contracts.

Read:

- `docs/Architecture.md`
- `docs/API_STABILITY.md`
- `docs/DETERMINISM.md`

## Tests

Every behavior change needs focused tests. Deterministic-output changes also
need an equality fixture and a boundary or negative test.

Before submitting:

```bash
npm test
npm run typecheck
npm run lint
npm run build
git diff --check
```

Documentation-only changes should still run the full check because API
examples and links may accompany generated declarations.

## Public API changes

- Import public APIs through `src/index.ts` in tests.
- Update `docs/API.md` and `docs/API_STABILITY.md`.
- Add a changelog entry.
- Preserve stable exports or document a prerelease migration.
- Do not deep-import private source paths in examples.

## Deterministic and serialized changes

Follow the contributor rules in `docs/DETERMINISM.md`. If persisted meaning or
canonical ordering changes, update the relevant format version and
compatibility tests.

## Pull requests

Keep pull requests reviewable:

- Explain the problem and observable behavior.
- Separate refactors from behavior changes where practical.
- List verification commands and results.
- Note public API, format, determinism, and documentation impact.
- Do not include generated `dist`, coverage, or experiment artifact output.

By participating, contributors agree to follow `CODE_OF_CONDUCT.md`.
