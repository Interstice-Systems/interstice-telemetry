# Release Readiness Assessment

## Overall assessment

Interstice Telemetry is a coherent and well-tested prerelease SDK. The current
implementation can support internal use and design-partner evaluation. It
should not yet be published as v1 because the public surface and serialized
contracts are not frozen, deterministic evidence is mutable by reference, and
basic open-source/release controls are absent.

## Scorecard

| Area | Score | Status | Notes |
|---|---:|---|---|
| API stability | 3/5 | needs work | Core workflows are consistent, but the root surface is broad and has no stability policy. Payload typing, deserialization, clock injection, and ownership decisions remain. |
| Documentation | 2/5 | needs work | Technically detailed and honest, but milestone-oriented, missing a golden path, API reference, data dictionary, compatibility policy, and normative determinism contract. |
| Test coverage | 4/5 | ready | 50 files and 192 tests pass across every major module. Missing coverage reporting, adversarial ownership tests, format compatibility fixtures, and packaged-consumer tests. |
| Examples | 4/5 | ready | Eleven public-API examples cover the feature set and typecheck. They are not smoke-run as a suite and artifact examples have repeat-run side effects. |
| Package quality | 2/5 | risky | ESM exports, declarations, files allowlist, lockfile, and Node engine are sound. License/package metadata, prepack gate, tarball consumer test, and release process are missing. |
| Architecture | 4/5 | ready | Small, layered, synchronous, transport-independent design. Core-event dependency direction and runner duplication need controlled cleanup, not a rewrite. |
| Determinism guarantees | 3/5 | needs work | Seed, time, ordering, and reporting are deterministic under controlled inputs. Mutable events, custom extensions, and handler failures weaken unconditional claims. |
| Artifact/replay/timeline reliability | 3/5 | needs work | Models are clear and thoroughly tested, but versions and canonical invariants are incompletely enforced; loads use unchecked casts and writes are non-atomic. |
| User onboarding | 2/5 | needs work | Source-checkout commands are easy, but registry install, current workflow map, troubleshooting, units, and support boundaries are missing. |
| Open-source readiness | 1/5 | risky | No license, contribution guide, changelog, security policy, templates, CI, or release notes. |
| Commercial/founder potential | 3/5 | needs work | The reproducible evidence pipeline has a credible niche, but user discovery, production integrations, willingness to pay, and a narrow initial buyer are unproven. |

## Evidence reviewed

- 59 TypeScript source files and approximately 4,923 source lines.
- 50 test files and 192 passing tests.
- 11 examples.
- Root exports, package metadata, TypeScript/ESLint configuration, gitignore,
  commit/tag history, README, architecture, and roadmap.
- Built output and an npm package dry run.

The npm dry run succeeded with a writable local cache: 120 package entries,
approximately 38 KB packed and 177 KB unpacked. The allowlist correctly limits
publication to `dist`, README, and package metadata, but there is no license to
include.

## Verification results

Run on 2026-07-01:

| Command | Result |
|---|---|
| `npm test` | Pass: 50 files, 192 tests |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm run build` | Pass |
| `git diff --check` | Pass |
| `npm pack --dry-run --json` | Pass with writable cache |

The first package dry run encountered a read-only default npm cache in the
managed environment. Re-running with a cache under `/tmp` succeeded; this is
not a repository failure.

## Release blockers

1. No license or complete package/repository metadata.
2. No intentionally frozen public API inventory or compatibility test.
3. Unsupported serialized format versions can pass validation.
4. Recorded/replayed evidence is mutable through shared references.
5. No CI, tarball consumer test, changelog, or reproducible release checklist.
6. Documentation does not state a normative determinism, units, ownership, or
   serialized compatibility contract.

## Conditions for reconsidering the verdict

The project can move to a release candidate when:

- The P0 roadmap is complete.
- Proposed v1 exports and data format contracts are reviewed and frozen.
- Adversarial boundary tests pass.
- The packed tarball installs and runs in a clean Node 20+ consumer.
- CI runs all release gates from a clean checkout.
- Legal and release documents are present.
- README onboarding and API/format documentation match actual behavior.

## Verdict

**NOT_READY**

This verdict reflects public v1 release readiness, not code quality. The gap is
bounded and mostly consists of contract hardening and release discipline.
